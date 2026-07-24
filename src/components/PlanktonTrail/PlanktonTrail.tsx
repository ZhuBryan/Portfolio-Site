import { useEffect, useRef, useState } from 'react';
import './PlanktonTrail.css';

/**
 * Bioluminescent plankton stirred up by the cursor. In the two deepest, darkest
 * sections (Skills, Contact), moving the pointer through the water disturbs
 * glowing motes that flare, drift, flicker and fade — the faster you move, the
 * brighter and denser the bloom. Rest the cursor and the water goes dark again.
 *
 * ONE canvas for the whole page: a single position:fixed, full-viewport canvas
 * mounted once (in App, after the sections). Spawning is gated to the union of
 * the Skills + Contact section rects, so motes only appear in the deep water —
 * but because the canvas spans the viewport, motes drift SEAMLESSLY across the
 * Skills/Contact seam instead of being cut and restarted at a per-section
 * boundary. Coordinates are viewport-space (clientX/clientY), matching the
 * fixed canvas.
 *
 * Same discipline as before: zero React state per frame, the rAF loop pauses
 * when neither deep section is on screen and on hidden tabs, a fixed
 * ring-buffer pool caps live motes, and it's gated to desktop / hover /
 * no-reduced-motion.
 */

const CAP = 220; // live motes (fixed ring-buffer pool)
const SPAWN_STEP = 14; // px of cursor travel between bursts
const CORE_MIN = 1;
const CORE_MAX = 3;
const LIFE_MIN = 1200; // ms
const LIFE_MAX = 2500; // ms
const SPRITE = 32; // offscreen glow sprite size (logical px)

// seafoam / cyan palette, mixed per-mote
const PALETTE: Array<[number, number, number]> = [
  [62, 230, 192], // #3ee6c0
  [127, 216, 255], // #7fd8ff
  [181, 255, 233], // #b5ffe9
];

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  core: number; // solid centre radius
  glow: number; // soft halo radius
  sprite: number; // palette / sprite index
  age: number; // ms
  life: number; // ms
  phase: number; // flicker phase
  freq: number; // flicker frequency
  bright: number; // 0..1, scaled by cursor speed at spawn
  active: boolean;
}

export default function PlanktonTrail() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      '(min-width: 768px) and (hover: hover) and (prefers-reduced-motion: no-preference)'
    );
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  if (!enabled) return null;
  return <PlanktonCanvas />;
}

function makeSprite(rgb: [number, number, number]): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = SPRITE;
  c.height = SPRITE;
  const g = c.getContext('2d');
  if (g) {
    const h = SPRITE / 2;
    const grad = g.createRadialGradient(h, h, 0, h, h, h);
    const [r, gr, b] = rgb;
    grad.addColorStop(0, `rgba(${r},${gr},${b},0.95)`);
    grad.addColorStop(0.28, `rgba(${r},${gr},${b},0.45)`);
    grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, SPRITE, SPRITE);
  }
  return c;
}

function PlanktonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sprites = PALETTE.map(makeSprite);

    // fixed full-viewport canvas
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // spawn zone: the union of the two deep sections, in viewport coords.
    // Rects are cached and refreshed on scroll/resize (passive) rather than
    // measured every mousemove.
    const skills = document.getElementById('skills');
    const contact = document.getElementById('contact');
    const deepSections = [skills, contact].filter((el): el is HTMLElement => el != null);
    let rects: DOMRect[] = [];
    const refreshRects = () => {
      rects = deepSections.map((el) => el.getBoundingClientRect());
    };
    refreshRects();
    const inZone = (x: number, y: number) =>
      rects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);

    const onResize = () => {
      resize();
      refreshRects();
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', refreshRects, { passive: true });

    // fixed pool + ring-buffer write head (overwrite the oldest mote)
    const pool: Mote[] = Array.from({ length: CAP }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, core: 0, glow: 0, sprite: 0,
      age: 0, life: 0, phase: 0, freq: 0, bright: 0, active: false,
    }));
    let head = 0;

    // cursor state: position, smoothed per-ms velocity vector, last spawn anchor
    const cur = { x: -9999, y: -9999, vx: 0, vy: 0, lastT: 0, sx: 0, sy: 0, seeded: false };

    const spawnBurst = (speed: number) => {
      const bright = Math.max(0.4, Math.min(1, 0.4 + speed * 0.32));
      const count = 2 + Math.round(Math.min(2, speed * 0.8));
      for (let i = 0; i < count; i++) {
        const m = pool[head];
        head = (head + 1) % CAP;
        const core = CORE_MIN + Math.random() * (CORE_MAX - CORE_MIN);
        m.x = cur.x + (Math.random() - 0.5) * 10;
        m.y = cur.y + (Math.random() - 0.5) * 10;
        // inherit a fraction of cursor velocity (px/ms → px/tick) + small scatter
        m.vx = cur.vx * 2.2 + (Math.random() - 0.5) * 0.4;
        m.vy = cur.vy * 2.2 + (Math.random() - 0.5) * 0.4 - 0.2;
        m.core = core;
        m.glow = 6 + core * 3 + Math.random() * 4;
        m.sprite = (Math.random() * sprites.length) | 0;
        m.age = 0;
        m.life = LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN);
        m.phase = Math.random() * Math.PI * 2;
        m.freq = 0.006 + Math.random() * 0.006;
        m.bright = bright;
        m.active = true;
      }
    };

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX;
      const ny = e.clientY;
      const now = performance.now();
      if (cur.lastT > 0) {
        const dtm = Math.max(now - cur.lastT, 4);
        const ivx = (nx - cur.x) / dtm;
        const ivy = (ny - cur.y) / dtm;
        cur.vx += (ivx - cur.vx) * 0.35;
        cur.vy += (ivy - cur.vy) * 0.35;
      }
      cur.x = nx;
      cur.y = ny;
      cur.lastT = now;
      // only bloom inside the deep-water zone (Skills ∪ Contact)
      if (!inZone(nx, ny)) {
        cur.seeded = false;
        return;
      }
      if (!cur.seeded) {
        cur.sx = nx;
        cur.sy = ny;
        cur.seeded = true;
        return;
      }
      // spawn a burst every SPAWN_STEP px of travel; brightness tracks speed
      let dist = Math.hypot(nx - cur.sx, ny - cur.sy);
      let guard = 0;
      while (dist >= SPAWN_STEP && guard < 4) {
        const speed = Math.hypot(cur.vx, cur.vy);
        spawnBurst(speed);
        const t = SPAWN_STEP / dist;
        cur.sx += (nx - cur.sx) * t;
        cur.sy += (ny - cur.sy) * t;
        dist = Math.hypot(nx - cur.sx, ny - cur.sy);
        guard++;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // pause when neither deep section is on screen or the tab is hidden
    let skillsVisible = false;
    let contactVisible = false;
    let hidden = document.hidden;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === skills) skillsVisible = entry.isIntersecting;
        if (entry.target === contact) contactVisible = entry.isIntersecting;
      }
    });
    deepSections.forEach((el) => io.observe(el));
    const onVis = () => { hidden = document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    let raf = 0;
    let lastT = performance.now();

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dtMs = Math.min(now - lastT, 100);
      lastT = now;
      if (hidden || !(skillsVisible || contactVisible)) return;
      const dt = Math.min(dtMs / 16.67, 2.4); // 60fps ticks

      // cursor velocity decays when the pointer rests → the bloom stops
      cur.vx *= Math.pow(0.8, dt);
      cur.vy *= Math.pow(0.8, dt);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (const m of pool) {
        if (!m.active) continue;
        m.age += dtMs;
        if (m.age >= m.life) { m.active = false; continue; }

        // drift: inherited velocity decays, faint upward buoyancy, tiny wander
        m.vx *= Math.pow(0.94, dt);
        m.vy *= Math.pow(0.94, dt);
        m.vy -= 0.01 * dt;
        m.x += (m.vx + Math.sin(m.phase + m.age * 0.004) * 0.12) * dt;
        m.y += m.vy * dt;

        // envelope: quick flare in, slow fade out; subtle per-mote flicker
        const t = m.age / m.life;
        const env = t < 0.16 ? t / 0.16 : (1 - t) / 0.84;
        const flicker = 0.72 + 0.28 * Math.sin(m.phase + m.age * m.freq);
        const a = Math.max(0, env) * flicker * m.bright;
        if (a <= 0.01) continue;

        const spr = sprites[m.sprite];
        const gr = m.glow;
        ctx.globalAlpha = a * 0.9;
        ctx.drawImage(spr, m.x - gr, m.y - gr, gr * 2, gr * 2);
        // bright core
        ctx.globalAlpha = Math.min(1, a * 1.15);
        ctx.fillStyle = '#eafffb';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.core * 0.62, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', refreshRects);
    };
  }, []);

  return <canvas ref={canvasRef} className="plankton-canvas" aria-hidden="true" />;
}
