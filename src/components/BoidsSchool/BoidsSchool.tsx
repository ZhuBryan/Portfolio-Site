import { useEffect, useRef, useState } from 'react';
import './BoidsSchool.css';

/**
 * A school of fish that actually schools — classic Reynolds boids on a 2D
 * canvas. Three rules per fish (separation / alignment / cohesion), a min
 * speed floor so nobody ever spins in place, and soft edge steering.
 *
 * Interactions:
 *  - CLICK drops a food pellet. Fish that sense it swim over (arrival
 *    behavior, so they mill around the crumbs instead of orbiting), and
 *    excitement spreads fish-to-fish so distant fish turn to join.
 *  - Fast cursor movement startles nearby fish: a brief dart away that
 *    ripples mildly to immediate neighbors, then settles. Slow movement
 *    is ignored — they're wary, not panicky.
 *
 * Zero React state per frame; rAF loop pauses off-screen and on hidden tabs.
 */

const COUNT = 80;
const PERCEPTION = 64;
const SEP_RADIUS = 20;
const MAX_SPEED = 1.9; // px per 60fps tick
const MAX_SPEED_EXCITED = 2.9;
const MIN_SPEED = MAX_SPEED * 0.55;
const MAX_FORCE = 0.06;
const W_SEP = 1.4;
const W_ALI = 1.0;
const W_COH = 0.75;
const W_WANDER = 0.35;
const W_EDGE = 1.2;
const W_FOOD = 1.9;
const EDGE_MARGIN = 80;
const DT_CAP = 2.4; // in 60fps ticks

// feeding
const FOOD_SENSE = 180;
const FOOD_ARRIVE = 40;
const FOOD_EAT = 22;
const FOOD_DEPLETE = 0.14; // per fish per second
const PELLET_LIFE = 8000;
const PELLET_MAX = 4;
const PELLET_SINK = 0.28;
const EXCITE_THRESHOLD = 0.25;
const EXCITE_CONTAGION = 0.82;
const EXCITE_HALF_LIFE = 1400;

// startle (fast cursor) — tuned twitchy: a quick flick of the mouse should
// visibly spook the nearby fish, while slow deliberate movement stays calm
const STARTLE_SPEED = 0.85; // px/ms of smoothed cursor velocity
const STARTLE_RADIUS = 170;
const STARTLE_HALF_LIFE = 800;
const STARTLE_CONTAGION = 0.6;
const STARTLE_NEIGHBOR_MIN = 0.4;

interface FishB {
  x: number; y: number; vx: number; vy: number;
  phase: number; wa: number; s: number;
  excite: number; startle: number;
}
interface Pellet { x: number; y: number; food: number; born: number; wob: number }

const BASE_RGB: [number, number, number] = [10, 61, 79];
const LIVELY_RGB: [number, number, number] = [26, 178, 158];

export default function BoidsSchool() {
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
  return <BoidsCanvas />;
}

function BoidsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const r = parent.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const fish: FishB[] = Array.from({ length: COUNT }, () => {
      const a = Math.random() * Math.PI * 2;
      const sp = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
      return {
        x: Math.random() * w, y: Math.random() * h,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        phase: Math.random() * Math.PI * 2,
        wa: 0, s: 0.8 + Math.random() * 0.4,
        excite: 0, startle: 0,
      };
    });
    const pellets: Pellet[] = [];

    // cursor tracking (position in canvas coords + smoothed speed px/ms)
    const cur = { x: -9999, y: -9999, v: 0, lastT: 0 };
    const onMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      const nx = e.clientX - r.left;
      const ny = e.clientY - r.top;
      const now = performance.now();
      if (cur.lastT > 0) {
        const dtm = Math.max(now - cur.lastT, 4);
        const inst = Math.hypot(nx - cur.x, ny - cur.y) / dtm;
        cur.v = cur.v + (inst - cur.v) * 0.3;
      }
      cur.x = nx; cur.y = ny; cur.lastT = now;
    };
    const onClick = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      if (px < 0 || py < 0 || px > w || py > h) return;
      if (pellets.length >= PELLET_MAX) pellets.shift();
      pellets.push({ x: px, y: py, food: 1, born: performance.now(), wob: Math.random() * 6 });
    };
    parent.addEventListener('mousemove', onMove, { passive: true });
    parent.addEventListener('click', onClick);

    // pause when off-screen or tab hidden
    let visible = true;
    let hidden = document.hidden;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(canvas);
    const onVis = () => { hidden = document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    let raf = 0;
    let lastT = performance.now();

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dtMs = Math.min(now - lastT, 100);
      lastT = now;
      if (!visible || hidden) return;
      const dt = Math.min(dtMs / 16.67, DT_CAP); // in 60fps ticks

      // cursor speed decays when the mouse rests
      cur.v *= Math.pow(0.85, dt);
      const exciteDecay = Math.pow(0.5, dtMs / EXCITE_HALF_LIFE);
      const startleDecay = Math.pow(0.5, dtMs / STARTLE_HALF_LIFE);

      // pellets: sink, wobble, expire
      for (let i = pellets.length - 1; i >= 0; i--) {
        const p = pellets[i];
        p.y += PELLET_SINK * dt;
        p.x += Math.sin(now / 900 + p.wob) * 0.12 * dt;
        if (p.food <= 0 || now - p.born > PELLET_LIFE || p.y > h + 10) pellets.splice(i, 1);
      }

      const startling = cur.v > STARTLE_SPEED;

      for (const f of fish) {
        // ── neighbors (O(n²) is fine at 80 fish) ──
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
        let maxNE = 0, maxNS = 0;
        for (const o of fish) {
          if (o === f) continue;
          const dx = o.x - f.x, dy = o.y - f.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > PERCEPTION * PERCEPTION) continue;
          n++;
          ax += o.vx; ay += o.vy;
          cx += o.x; cy += o.y;
          if (o.excite > maxNE) maxNE = o.excite;
          if (o.startle > maxNS) maxNS = o.startle;
          if (d2 < SEP_RADIUS * SEP_RADIUS && d2 > 0.01) {
            const d = Math.sqrt(d2);
            sx -= (dx / d) * (1 - d / SEP_RADIUS);
            sy -= (dy / d) * (1 - d / SEP_RADIUS);
          }
        }

        // contagion: word of food / alarm spreads neighbor to neighbor
        if (maxNE > EXCITE_THRESHOLD) f.excite = Math.max(f.excite, maxNE * EXCITE_CONTAGION);
        if (maxNS > STARTLE_NEIGHBOR_MIN) f.startle = Math.max(f.startle, maxNS * STARTLE_CONTAGION);

        // direct startle from a fast cursor
        if (startling) {
          const dxc = f.x - cur.x, dyc = f.y - cur.y;
          const dc = Math.hypot(dxc, dyc);
          if (dc < STARTLE_RADIUS && dc > 0.01) {
            f.startle = 1;
            const imp = 2.0 * (1 - dc / STARTLE_RADIUS) * dt;
            f.vx += (dxc / dc) * imp;
            f.vy += (dyc / dc) * imp;
          }
        }

        const k = Math.max(f.excite, f.startle * 0.8);
        const maxSp = MAX_SPEED + (MAX_SPEED_EXCITED - MAX_SPEED) * k;
        const maxF = MAX_FORCE * dt;

        // Reynolds steering: desired − velocity, clamped
        let fx = 0, fy = 0;
        const steer = (tx: number, ty: number, weight: number, speed = maxSp) => {
          const m = Math.hypot(tx, ty);
          if (m < 0.0001) return;
          let dx2 = (tx / m) * speed - f.vx;
          let dy2 = (ty / m) * speed - f.vy;
          const sm = Math.hypot(dx2, dy2);
          if (sm > maxF) { dx2 = (dx2 / sm) * maxF; dy2 = (dy2 / sm) * maxF; }
          fx += dx2 * weight;
          fy += dy2 * weight;
        };

        if (n > 0) {
          steer(sx, sy, W_SEP);
          steer(ax / n, ay / n, W_ALI);
          steer(cx / n - f.x, cy / n - f.y, W_COH);
        }

        // wander — slow noise on heading so the school looks alive
        f.wa += (Math.random() - 0.5) * 0.4 * dt;
        f.wa *= 0.98;
        const hd = Math.atan2(f.vy, f.vx) + f.wa;
        steer(Math.cos(hd), Math.sin(hd), W_WANDER);

        // food: sensed directly, or joined because the neighbors got excited
        if (pellets.length > 0) {
          let best: Pellet | null = null;
          let bestD = Infinity;
          for (const p of pellets) {
            const d = Math.hypot(p.x - f.x, p.y - f.y);
            if (d < bestD) { bestD = d; best = p; }
          }
          if (best) {
            if (bestD < FOOD_SENSE) f.excite = 1;
            if (f.excite > 0.3) {
              // arrival: decelerate near the crumbs so fish mill, not orbit
              const arriveSp = bestD < FOOD_ARRIVE ? maxSp * (bestD / FOOD_ARRIVE) : maxSp;
              steer(best.x - f.x, best.y - f.y, W_FOOD * Math.min(1, f.excite), arriveSp);
            }
            if (bestD < FOOD_EAT) best.food -= FOOD_DEPLETE * (dtMs / 1000);
          }
        }

        // soft edges: gentle inward steer ramping inside the margin
        if (f.x < EDGE_MARGIN) steer(1, 0, W_EDGE * (1 - f.x / EDGE_MARGIN));
        if (f.x > w - EDGE_MARGIN) steer(-1, 0, W_EDGE * (1 - (w - f.x) / EDGE_MARGIN));
        if (f.y < EDGE_MARGIN) steer(0, 1, W_EDGE * (1 - f.y / EDGE_MARGIN));
        if (f.y > h - EDGE_MARGIN) steer(0, -1, W_EDGE * (1 - (h - f.y) / EDGE_MARGIN));

        f.vx += fx;
        f.vy += fy;

        // speed clamp + MIN SPEED FLOOR (always moving forward — no spinning)
        const sp = Math.hypot(f.vx, f.vy);
        if (sp > maxSp) { f.vx = (f.vx / sp) * maxSp; f.vy = (f.vy / sp) * maxSp; }
        else if (sp < MIN_SPEED && sp > 0.0001) { f.vx = (f.vx / sp) * MIN_SPEED; f.vy = (f.vy / sp) * MIN_SPEED; }

        f.x += f.vx * dt;
        f.y += f.vy * dt;
        // hard clamp as a last resort (soft steer should prevent reaching this)
        f.x = Math.max(-20, Math.min(w + 20, f.x));
        f.y = Math.max(-20, Math.min(h + 20, f.y));

        f.excite *= exciteDecay;
        f.startle *= startleDecay;
        f.phase += (0.25 * Math.hypot(f.vx, f.vy) + 0.6 * f.startle + 0.3 * f.excite) * dt;
      }

      // ── draw ──
      ctx.clearRect(0, 0, w, h);

      for (const p of pellets) {
        ctx.globalAlpha = Math.max(0.15, p.food) * 0.9;
        ctx.fillStyle = '#ffd9a0';
        for (let i = 0; i < 3; i++) {
          const ang = p.wob + i * 2.1;
          ctx.beginPath();
          ctx.arc(p.x + Math.cos(ang) * 4, p.y + Math.sin(ang) * 3, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      for (const f of fish) {
        const k = Math.max(f.excite, f.startle);
        const r = Math.round(BASE_RGB[0] + (LIVELY_RGB[0] - BASE_RGB[0]) * k);
        const g = Math.round(BASE_RGB[1] + (LIVELY_RGB[1] - BASE_RGB[1]) * k);
        const b = Math.round(BASE_RGB[2] + (LIVELY_RGB[2] - BASE_RGB[2]) * k);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(Math.atan2(f.vy, f.vx));
        ctx.scale(f.s, f.s);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.5 + 0.3 * k})`;
        // body
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.quadraticCurveTo(2, -3.2, -3, -2.2);
        ctx.quadraticCurveTo(-5.5, -1, -5.5, 0);
        ctx.quadraticCurveTo(-5.5, 1, -3, 2.2);
        ctx.quadraticCurveTo(2, 3.2, 7, 0);
        ctx.fill();
        // tail, flexing with the swim phase
        const flex = Math.sin(f.phase) * (0.35 + 0.5 * k);
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-10, -2.6 + flex * 3.2);
        ctx.lineTo(-10, 2.6 + flex * 3.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('click', onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="boids-canvas" aria-hidden="true" />;
}
