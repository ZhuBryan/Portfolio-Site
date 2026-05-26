import { useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import ScubaVisor from '../../svg/ScubaVisor';
import WaterSurface from '../../svg/WaterSurface';
import './MaskTransition.css';

/**
 * Cinematic "putting on the mask" transition.
 *
 * The motion timeline (driven by scroll progress 0 → 1):
 *
 *   0.00 ─── 0.10   mask far away, lightly tilted, surface fully visible
 *   0.10 ─── 0.45   mask approaches the face — scales, rotates flat,
 *                   surface dims & blurs, underwater starts bleeding in
 *   0.45 ─── 0.58   SEAL — quick x-wobble, ripple flashes, depth tint
 *                   ramps; the rubber and rim suddenly fill the screen
 *   0.58 ─── 0.85   you're inside the mask — lens engulfs everything,
 *                   bubbles drift up, tint deepens, depth meter accelerates
 *   0.85 ─── 1.00   settled at depth — HUD softens, arrival message fades in
 *
 * Geometric note: the visor SVG has ONE big oval lens cutout (see
 * `ScubaVisor.tsx`). That's why scaling it up actually lets the user
 * "look through" the mask instead of just seeing the rubber between two
 * lenses.
 */
export default function MaskTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [depth, setDepth] = useState(2);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Tighter spring — minimal mass so the visor tracks the wheel/touchpad
  // instead of swimming behind it. Critically damped so it never overshoots.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 38,
    mass: 0.18,
  });

  /* ── Visor scale: approach → snap → engulf ─────────────────────────────
     Scale 14 at the end means the lens cutout (which spans ~80% of the SVG
     width) covers ~11× the viewport width — i.e. you're looking through
     an enormous window, with the rubber rim well past the screen edges. */
  const visorScale = useTransform(
    smooth,
    [0, 0.1, 0.42, 0.55, 0.85, 1],
    shouldReduceMotion ? [1, 1, 1, 1, 1, 1] : [0.55, 0.82, 2.6, 4.4, 12, 14]
  );

  // Forward-settle: the mask comes toward your face from below.
  const visorY = useTransform(
    smooth,
    [0, 0.45, 0.6, 1],
    shouldReduceMotion ? [0, 0, 0, 0] : [80, 12, -4, -8]
  );

  // Tilt: held loosely at first, levels off as it reaches your face.
  const visorRotate = useTransform(
    smooth,
    [0, 0.45, 0.6, 1],
    shouldReduceMotion ? [0, 0, 0, 0] : [7, 1, -0.4, 0]
  );

  // "Seal" wobble — tiny x-jitter as the mask snaps onto the face.
  // Only happens in a narrow band around scroll 0.5.
  const visorX = useTransform(
    smooth,
    [0.44, 0.47, 0.5, 0.53, 0.56, 0.6],
    shouldReduceMotion ? [0, 0, 0, 0, 0, 0] : [0, -5, 6, -3, 1, 0]
  );

  /* ── Surface above-water fades & blurs out early ─────────────────────── */
  const surfaceOpacity = useTransform(smooth, [0, 0.32], [1, 0]);
  const surfaceBlur = useTransform(smooth, [0, 0.4], ['blur(0px)', 'blur(10px)']);

  /* ── Underwater layer fades in (visible through the lens cutout) ─────── */
  const oceanOpacity = useTransform(smooth, [0.12, 0.55], [0, 1]);

  /* ── Depth tint: a full-viewport teal cast that deepens during descent.
       This is what sells "I'm submerging" beyond the visor itself.       */
  const tintOpacity = useTransform(smooth, [0.15, 0.7], [0, 0.45]);

  /* ── Lens distortion ripple — peaks at the seal moment ──────────────── */
  const rippleOpacity = useTransform(
    smooth,
    [0.28, 0.5, 0.7],
    shouldReduceMotion ? [0, 0, 0] : [0, 0.65, 0]
  );
  const rippleScale = useTransform(smooth, [0, 1], [0.85, 1.45]);

  /* ── Visor halo: a cheap gradient glow that fades out as the visor
       engulfs the screen. Replaces the expensive `filter: drop-shadow`
       that was causing most of the frame-time spikes. ────────────────── */
  const haloOpacity = useTransform(
    smooth,
    [0, 0.3, 0.55],
    shouldReduceMotion ? [0, 0, 0] : [0.55, 0.4, 0]
  );

  /* ── Bubbles layer — visible during the dive, peaks while engulfed ──── */
  const bubblesOpacity = useTransform(
    smooth,
    [0.18, 0.55, 0.95, 1],
    shouldReduceMotion ? [0, 0, 0, 0] : [0, 1, 1, 0]
  );

  /* ── HUD readouts ──────────────────────────────────────────────────── */
  const hudOpacity = useTransform(smooth, [0, 0.12, 0.92, 1], [0, 1, 1, 0]);
  const ctaOpacity = useTransform(smooth, [0, 0.08], [1, 0]);
  const deepIntroOpacity = useTransform(smooth, [0.82, 0.95], [0, 1]);

  // Depth meter accelerates with smoothstep — you fall faster as you descend.
  useMotionValueEvent(smooth, 'change', (latest) => {
    const t = Math.max(0, Math.min(1, latest));
    const eased = t * t * (3 - 2 * t);
    const next = Math.round(2 + eased * 50);
    setDepth((prev) => (prev === next ? prev : next));
  });

  // Stable bubble field — randomized once on mount so positions don't
  // re-roll every render (which would kill the rising animation).
  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 18,
        delay: -Math.random() * 14,
        duration: 9 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 80,
      })),
    []
  );

  return (
    <section ref={sectionRef} className="mask-section" id="mask-transition">
      <div className="mask-sticky">
        {/* Layer 1 — underwater backdrop */}
        <div className="mask-ocean" aria-hidden="true">
          <motion.div className="mask-ocean__veil" style={{ opacity: oceanOpacity }} />
          <div className="mask-ocean__shafts" />
        </div>

        {/* Layer 2 — above-water surface (fades early) */}
        <motion.div
          className="mask-surface"
          style={{ opacity: surfaceOpacity, filter: surfaceBlur }}
          aria-hidden="true"
        >
          <div className="mask-surface__stars" />
          <div className="mask-surface__waterline">
            <WaterSurface showScrollHint={false} />
          </div>
        </motion.div>

        {/* Layer 2.5 — drifting bubble field (immersion) */}
        <motion.div
          className="mask-bubbles"
          style={{ opacity: bubblesOpacity }}
          aria-hidden="true"
        >
          {bubbles.map((b) => (
            <span
              key={b.id}
              className="mask-bubble"
              style={
                {
                  left: `${b.left}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  animationDelay: `${b.delay}s`,
                  animationDuration: `${b.duration}s`,
                  '--bubble-drift': `${b.drift}px`,
                } as CSSProperties
              }
            />
          ))}
        </motion.div>

        {/* Layer 3 — soft halo behind the visor (cheap GPU-friendly glow) */}
        <motion.div
          className="mask-halo"
          style={{ opacity: haloOpacity }}
          aria-hidden="true"
        />

        {/* Layer 4 — the visor, scaling up to engulf the viewport */}
        <motion.div
          className="mask-visor"
          style={{
            scale: visorScale,
            rotate: visorRotate,
            y: visorY,
            x: visorX,
          }}
          aria-hidden="true"
        >
          <ScubaVisor />
        </motion.div>

        {/* Layer 5 — lens distortion ripple (peaks at the seal moment) */}
        <motion.div
          className="mask-ripple"
          style={{ opacity: rippleOpacity, scale: rippleScale }}
          aria-hidden="true"
        />

        {/* Layer 6 — full-viewport depth tint */}
        <motion.div
          className="mask-tint"
          style={{ opacity: tintOpacity }}
          aria-hidden="true"
        />

        {/* Layer 7 — HUD overlays */}
        <motion.div className="mask-hud" style={{ opacity: hudOpacity }} aria-hidden="true">
          <div className="mask-hud__corner mask-hud__corner--tl">
            <span className="mask-hud__dot mask-hud__dot--live" />
            <span>Descent mode · engaged</span>
          </div>
          <div className="mask-hud__corner mask-hud__corner--tr">
            <span className="mask-hud__label">Depth</span>
            <span className="mask-hud__value">−{String(depth).padStart(2, '0')}m</span>
          </div>
          <div className="mask-hud__corner mask-hud__corner--bl">
            <span className="mask-hud__dot mask-hud__dot--stable" />
            <span>Pressure stable</span>
          </div>
          <div className="mask-hud__corner mask-hud__corner--br">
            <span>SYS · AR / ML</span>
          </div>
        </motion.div>

        {/* Initial CTA — invites the user to scroll */}
        <motion.div className="mask-cta" style={{ opacity: ctaOpacity }} aria-hidden="true">
          <span className="mask-cta__label">scroll to dive</span>
          <span className="mask-cta__arrow">↓</span>
        </motion.div>

        {/* Deep-ocean welcome — fades in once you're fully engulfed */}
        <motion.div
          className="mask-arrival"
          style={{ opacity: deepIntroOpacity }}
          aria-hidden="true"
        >
          <span className="mask-arrival__eyebrow">— pressure stable —</span>
          <h3 className="mask-arrival__title">welcome to the deep</h3>
          <span className="mask-arrival__sub">−{depth}m · keep scrolling</span>
        </motion.div>
      </div>
    </section>
  );
}
