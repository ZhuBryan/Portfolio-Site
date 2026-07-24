import { useEffect, useRef, useState } from 'react';
import './SandCrab.css';

/**
 * SandCrab — a single SVG crab that skitters along the sandy floor of the
 * Contact section, scuttling sideways AWAY from the cursor and idling when left
 * alone. Canvas-free: the whole crab is one <svg> moved by writing a transform
 * straight onto its wrapper element from a requestAnimationFrame loop — there is
 * NO React state per frame, so React never re-renders while it moves. Legs
 * animate via a CSS class that toggles only when the crab is actually walking.
 *
 * Behaviour:
 *  - Flees horizontally from the cursor's x within a sense range; clamps to the
 *    sand strip so it never climbs into the copy.
 *  - Faces its travel direction (sideways scuttle — the body flips on the X).
 *  - Idles (slow bob, no leg cycle) when the cursor is far or absent.
 *  - If a fast cursor corners it against a section edge, it raises a claw in a
 *    quick defensive stance instead of walking through the wall.
 *  - pointer-events:none on the crab; the section owns the pointer listeners.
 *  - Gated to desktop + hover + no-reduced-motion (ambient-only elsewhere).
 */

const GATE = '(min-width: 768px) and (hover: hover) and (prefers-reduced-motion: no-preference)';

export default function SandCrab({ sectionSelector }: { sectionSelector: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(GATE);
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (!enabled) return null;
  return <Crab sectionSelector={sectionSelector} />;
}

// ── Tunables ────────────────────────────────────────────────────────────────
const CRAB_W = 46; // crab footprint (px) — used for edge clamps
const SENSE = 220; // starts fleeing when cursor x is within this range (px)
const FLEE_SPEED = 3.4; // max scuttle speed (px/frame @ 60fps)
const EASE = 0.12; // how quickly actual velocity approaches the target
const IDLE_DRIFT = 0.15; // gentle wander speed when idle (px/frame)
const CORNER_MARGIN = 8; // "against the wall" tolerance (px)
const CORNER_PRESS = 90; // cursor must be this close to trigger the claw raise
const WALK_EPS = 0.35; // speed above which the leg cycle plays

function Crab({ sectionSelector }: { sectionSelector: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const sectionEl = document.querySelector<HTMLElement>(sectionSelector);
    if (!wrap || !sectionEl) return;
    const section: HTMLElement = sectionEl; // non-null alias for the closures below

    // Sand strip geometry (relative to the section box). The crab lives on a
    // horizontal band near the bottom; recomputed on resize.
    let width = section.clientWidth;
    let floorY = 0; // y of the crab's resting line (px from section top)
    let minX = CRAB_W / 2;
    let maxX = width - CRAB_W / 2;

    function measure() {
      width = section.clientWidth;
      const h = section.clientHeight;
      // Sit ~46px above the section's bottom edge, on the sandy floor.
      floorY = h - 46;
      minX = CRAB_W / 2 + 6;
      maxX = width - CRAB_W / 2 - 6;
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);

    // Motion state — plain closure vars, never React state.
    let x = maxX * 0.6;
    let vx = 0;
    let facing = 1; // +1 faces right, -1 faces left
    let bob = Math.random() * Math.PI * 2;
    let clawT = 0; // 0..1 claw-raise amount (defensive stance)

    // Cursor tracking (section-local). speed in px/ms for the "fast" check.
    const cur = { x: 0, y: 0, speed: 0, t: 0, inside: false };
    function onMove(e: MouseEvent) {
      const rect = section.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const now = performance.now();
      const inside = cx >= 0 && cy >= 0 && cx <= rect.width && cy <= rect.height;
      if (cur.t > 0 && inside) {
        const dtMs = Math.max(now - cur.t, 1);
        const dist = Math.hypot(cx - cur.x, cy - cur.y);
        cur.speed = cur.speed * 0.4 + (dist / dtMs) * 0.6;
      } else {
        cur.speed = 0;
      }
      cur.x = cx;
      cur.y = cy;
      cur.t = now;
      cur.inside = inside;
    }
    function onLeave() {
      cur.inside = false;
      cur.speed = 0;
    }
    section.addEventListener('mousemove', onMove, { passive: true });
    section.addEventListener('mouseleave', onLeave, { passive: true });

    // Pause when the section is off-screen or the tab is hidden.
    let onScreen = true;
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen && running && raf === 0) {
          last = performance.now();
          raf = requestAnimationFrame(step);
        }
      },
      { threshold: 0 }
    );
    io.observe(section);

    let running = true;
    let raf = 0;
    let last = performance.now();

    function onVisibility() {
      if (document.hidden) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else {
        running = true;
        if (onScreen && raf === 0) {
          last = performance.now();
          raf = requestAnimationFrame(step);
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    let walking = false;

    function step(now: number) {
      raf = 0;
      if (!running || !onScreen) return;
      let dt = (now - last) / 16.6667;
      last = now;
      if (dt > 2.4) dt = 2.4;
      if (dt <= 0) dt = 1;

      const freshCursor = cur.inside && now - cur.t < 140;
      const fresh = freshCursor && cur.t > 0;

      // Target velocity: flee the cursor's x if it's within sense range.
      let targetV = 0;
      let fleeing = false;
      if (fresh) {
        const dx = x - cur.x; // + means crab is to the RIGHT of cursor
        const near = Math.abs(dx) < SENSE;
        if (near) {
          const prox = 1 - Math.abs(dx) / SENSE; // 0..1
          const dir = dx >= 0 ? 1 : -1; // move further from the cursor
          targetV = dir * FLEE_SPEED * prox;
          fleeing = true;
        }
      }

      if (!fleeing) {
        // Idle micro-wander so it feels alive without wandering off.
        bob += 0.05 * dt;
        targetV = Math.sin(bob * 0.7) * IDLE_DRIFT;
      }

      // Cornered? Pressed against an edge with a fast cursor still pushing in →
      // raise a claw instead of walking through the wall.
      const atLeft = x <= minX + CORNER_MARGIN;
      const atRight = x >= maxX - CORNER_MARGIN;
      const cursorClose = fresh && Math.abs(x - cur.x) < CORNER_PRESS;
      const cursorFast = fresh && cur.speed > 0.9;
      const cornered =
        ((atLeft && (fresh ? cur.x < x : false)) || (atRight && (fresh ? cur.x > x : false))) &&
        cursorClose &&
        (cursorFast || clawT > 0.05);

      if (cornered) {
        clawT = Math.min(1, clawT + 0.12 * dt);
        targetV = 0; // dig in
      } else {
        clawT = Math.max(0, clawT - 0.06 * dt);
      }

      // Ease actual velocity toward target and integrate.
      vx += (targetV - vx) * EASE * dt;
      x += vx * dt;

      // Clamp to the sand strip.
      if (x < minX) {
        x = minX;
        if (vx < 0) vx = 0;
      } else if (x > maxX) {
        x = maxX;
        if (vx > 0) vx = 0;
      }

      // Facing: flip toward travel direction (with a small deadzone).
      if (vx > 0.15) facing = 1;
      else if (vx < -0.15) facing = -1;

      // Idle bob (vertical) is tiny; walking flattens it.
      const speed = Math.abs(vx);
      const nowWalking = speed > WALK_EPS && clawT < 0.2;
      if (nowWalking !== walking) {
        walking = nowWalking;
        wrap!.classList.toggle('sandcrab--walking', walking);
      }
      wrap!.classList.toggle('sandcrab--alarmed', clawT > 0.35);

      const yBob = walking ? 0 : Math.sin(bob) * 2.2;
      // Compose transform: place at (x, floorY), face direction, gentle bob.
      wrap!.style.transform = `translate3d(${(x - CRAB_W / 2).toFixed(2)}px, ${(
        floorY + yBob
      ).toFixed(2)}px, 0) scaleX(${facing})`;

      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sectionSelector]);

  return (
    <div ref={wrapRef} className="sandcrab" aria-hidden="true">
      <svg viewBox="0 0 46 32" width="46" height="32">
        {/* legs — three per side; the CSS leg-cycle nudges them while walking */}
        <g className="sandcrab__legs" stroke="#c05a3a" strokeWidth="2.4" strokeLinecap="round">
          <path className="sandcrab__leg sandcrab__leg--l1" d="M15 20 L7 26" />
          <path className="sandcrab__leg sandcrab__leg--l2" d="M16 22 L9 30" />
          <path className="sandcrab__leg sandcrab__leg--l3" d="M18 23 L13 31" />
          <path className="sandcrab__leg sandcrab__leg--r1" d="M31 20 L39 26" />
          <path className="sandcrab__leg sandcrab__leg--r2" d="M30 22 L37 30" />
          <path className="sandcrab__leg sandcrab__leg--r3" d="M28 23 L33 31" />
        </g>
        {/* claws — the left/right claw arms; left one raises when alarmed */}
        <g stroke="#b34e30" strokeWidth="2.6" strokeLinecap="round" fill="#ff8a65">
          <g className="sandcrab__claw sandcrab__claw--l">
            <path d="M14 15 L6 12" fill="none" />
            <path d="M6 12 q-4 -1 -5 -4 q3 0 5 1 q1 2 0 3z" stroke="none" />
            <path d="M6 12 q-4 2 -5 -1 q3 -1 5 -1" fill="none" />
          </g>
          <g className="sandcrab__claw sandcrab__claw--r">
            <path d="M32 15 L40 12" fill="none" />
            <path d="M40 12 q4 -1 5 -4 q-3 0 -5 1 q-1 2 0 3z" stroke="none" />
            <path d="M40 12 q4 2 5 -1 q-3 -1 -5 -1" fill="none" />
          </g>
        </g>
        {/* body — a rounded carapace with two eye stalks */}
        <ellipse cx="23" cy="18" rx="11" ry="8" fill="#ff7043" stroke="#c05a3a" strokeWidth="2" />
        <path d="M14 17 q9 -5 18 0" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" />
        <line x1="19" y1="11" x2="18" y2="6" stroke="#c05a3a" strokeWidth="2" strokeLinecap="round" />
        <line x1="27" y1="11" x2="28" y2="6" stroke="#c05a3a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="5" r="2.4" fill="#3a2016" />
        <circle cx="28" cy="5" r="2.4" fill="#3a2016" />
      </svg>
    </div>
  );
}
