import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CursorTurtle.css';

/**
 * A small 2D sea-turtle "cursor buddy" that swims after the mouse.
 *
 * Design notes:
 *  - Position is driven entirely by MotionValues + useSpring (transform only).
 *    There is NO React state update per frame, so React never re-renders while
 *    the turtle swims — the spring writes straight to the compositor.
 *  - The turtle lags behind the cursor (soft spring), and rotates to FACE the
 *    cursor — the angle from its sprung position to the raw cursor target,
 *    eased along the shortest arc (heading held when nearly on top of it).
 *  - Flippers wiggle via a CSS keyframe; when the cursor stops, an idle class
 *    switches to a gentle bob.
 *  - Fixed-position, pointer-events:none, sits below the navbar (z-index 900).
 *  - Mounts only on (hover:hover) pointers >= 768px with reduced-motion:
 *    no-preference. Bonus: a window click triggers a quick barrel-roll.
 */

const SIZE = 56;

export default function CursorTurtle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      '(hover: hover) and (min-width: 768px) and (prefers-reduced-motion: no-preference)'
    );
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!enabled) return null;
  return <Buddy />;
}

function Buddy() {
  // Raw cursor target (centered on the turtle body).
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);

  // The turtle lags behind via a soft spring.
  const x = useSpring(targetX, { stiffness: 120, damping: 18, mass: 0.9 });
  const y = useSpring(targetY, { stiffness: 120, damping: 18, mass: 0.9 });

  // Face the direction of travel, derived from the spring velocity.
  const rotate = useMotionValue(0);
  const [idle, setIdle] = useState(true);
  const [roll, setRoll] = useState(false);

  const idleTimer = useRef<number | undefined>(undefined);
  const rollTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const half = SIZE / 2;

    const onMove = (e: MouseEvent) => {
      targetX.set(e.clientX - half);
      targetY.set(e.clientY - half);
      setIdle(false);
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setIdle(true), 220);
    };

    const onClick = () => {
      setRoll(true);
      window.clearTimeout(rollTimer.current);
      rollTimer.current = window.setTimeout(() => setRoll(false), 620);
    };

    // Rotate to FACE THE CURSOR: the angle from the turtle's current sprung
    // position to the raw cursor target, smoothed via shortest-arc easing.
    // When the turtle is nearly on top of the cursor, hold the last heading so
    // it doesn't jitter as the vector direction becomes ill-defined.
    let raf = 0;
    const HOLD_DIST = 24;
    const spin = () => {
      const dx = targetX.get() - x.get();
      const dy = targetY.get() - y.get();
      const dist = Math.hypot(dx, dy);
      if (dist > HOLD_DIST) {
        // SVG faces up (−90°); add 90 so 0° heading = pointing right.
        const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        const cur = rotate.get();
        const delta = ((target - cur + 540) % 360) - 180;
        rotate.set(cur + delta * 0.18);
      }
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(rollTimer.current);
    };
  }, [targetX, targetY, x, y, rotate]);

  return (
    <motion.div
      className="cturtle"
      style={{ x, y, width: SIZE, height: SIZE }}
      aria-hidden="true"
    >
      <motion.div className="cturtle__heading" style={{ rotate }}>
        {/* Barrel-roll spins the body a full turn on top of the heading. */}
        <motion.div
          className="cturtle__body"
          animate={{ rotate: roll ? 360 : 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* idle bob lives on its own layer so it never fights the roll transform */}
          <div className={`cturtle__bob ${idle ? 'is-idle' : ''}`}>
            <TurtleSvg />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Top-down sea turtle, facing up. Flippers are separate paths so CSS can wiggle them. */
function TurtleSvg() {
  return (
    <svg viewBox="0 0 64 64" width={SIZE} height={SIZE}>
      <defs>
        <radialGradient id="ct-shell" cx="42%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#5fe6c9" />
          <stop offset="60%" stopColor="#22b39b" />
          <stop offset="100%" stopColor="#0e7d76" />
        </radialGradient>
      </defs>

      {/* front flippers */}
      <path className="ct-flip ct-flip--fl" d="M22 24 C10 16 4 18 6 26 C8 32 16 32 24 30 Z" fill="#1c9c8c" />
      <path className="ct-flip ct-flip--fr" d="M42 24 C54 16 60 18 58 26 C56 32 48 32 40 30 Z" fill="#1c9c8c" />
      {/* rear flippers */}
      <path className="ct-flip ct-flip--rl" d="M24 44 C16 50 12 50 12 44 C13 39 19 39 26 40 Z" fill="#178074" />
      <path className="ct-flip ct-flip--rr" d="M40 44 C48 50 52 50 52 44 C51 39 45 39 38 40 Z" fill="#178074" />

      {/* head */}
      <ellipse cx="32" cy="15" rx="6.5" ry="7.5" fill="#22b39b" />
      <circle cx="29.4" cy="13.5" r="1.2" fill="#06303a" />
      <circle cx="34.6" cy="13.5" r="1.2" fill="#06303a" />

      {/* shell */}
      <ellipse cx="32" cy="34" rx="16" ry="18" fill="url(#ct-shell)" stroke="#0c6b64" strokeWidth="1.5" />
      {/* shell plates */}
      <g stroke="rgba(6,64,60,0.45)" strokeWidth="1.2" fill="none">
        <path d="M32 18 L32 50" />
        <path d="M20 28 L44 28" />
        <path d="M21 42 L43 42" />
        <path d="M24 20 L40 20" />
      </g>
      <ellipse cx="32" cy="34" rx="6" ry="7.5" fill="rgba(210,255,244,0.35)" />
      {/* tail */}
      <path d="M30 51 L34 51 L32 57 Z" fill="#178074" />
    </svg>
  );
}
