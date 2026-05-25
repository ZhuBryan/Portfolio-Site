import { useRef, useState } from 'react';
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
 * Composition (back to front):
 *   1. Underwater backdrop (always present)
 *   2. Above-water surface (stars + waterline; fades out as the dive begins)
 *   3. Scuba visor SVG (scales 0.5 → 6.5 — the dark rubber covers the screen
 *      while the two transparent lens cutouts become huge underwater windows)
 *   4. Lens distortion ripple (peaks mid-transition for the "water-lens" wash)
 *   5. HUD overlays — DESCENT MODE, live DEPTH readout, PRESSURE STABLE
 *
 * The scroll-driven scrub happens inside a 200vh section with a sticky
 * 100vh viewport, so a single scroll-page of input drives the whole moment.
 */
export default function MaskTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [depth, setDepth] = useState(2);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 22, mass: 0.4 });

  /* ── Visor: scale + a touch of settle rotation ─────────────────────── */
  const visorScale = useTransform(
    smooth,
    [0, 0.35, 0.75, 1],
    shouldReduceMotion ? [1, 1, 1, 1] : [0.55, 1.3, 4.6, 6.8]
  );
  const visorRotate = useTransform(
    smooth,
    [0, 0.5, 1],
    shouldReduceMotion ? [0, 0, 0] : [8, 0, -2]
  );
  const visorY = useTransform(
    smooth,
    [0, 0.5, 1],
    shouldReduceMotion ? [0, 0, 0] : [60, 0, -20]
  );

  /* ── Surface above-water fades out ─────────────────────────────────── */
  const surfaceOpacity = useTransform(smooth, [0, 0.42], [1, 0]);
  const surfaceBlur = useTransform(smooth, [0, 0.5], ['blur(0px)', 'blur(8px)']);

  /* ── Underwater layer fades in (visible through the lens cutouts) ──── */
  const oceanOpacity = useTransform(smooth, [0.15, 0.65], [0, 1]);

  /* ── Water-lens distortion ripple peaks mid-transition ─────────────── */
  const rippleOpacity = useTransform(smooth, [0, 0.3, 0.6, 0.9], [0, 0.55, 0.7, 0]);
  const rippleScale = useTransform(smooth, [0, 0.6, 1], [0.9, 1.15, 1.4]);

  /* ── HUD readouts ──────────────────────────────────────────────────── */
  const hudOpacity = useTransform(smooth, [0, 0.12, 0.9, 1], [0, 1, 1, 0]);
  const ctaOpacity = useTransform(smooth, [0, 0.08], [1, 0]);
  const deepIntroOpacity = useTransform(smooth, [0.78, 0.95], [0, 1]);

  // Depth meter ticks 02m → 50m as the user descends
  useMotionValueEvent(smooth, 'change', (latest) => {
    const next = Math.round(2 + Math.max(0, Math.min(1, latest)) * 48);
    setDepth((prev) => (prev === next ? prev : next));
  });

  return (
    <section ref={sectionRef} className="mask-section" id="mask-transition">
      <div className="mask-sticky">
        {/* Layer 1 — underwater backdrop (always present) */}
        <div className="mask-ocean" aria-hidden="true">
          <motion.div className="mask-ocean__veil" style={{ opacity: oceanOpacity }} />
          <div className="mask-ocean__shafts" />
        </div>

        {/* Layer 2 — above-water surface, fades out */}
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

        {/* Layer 3 — the visor, scaling up to envelop the viewport */}
        <motion.div
          className="mask-visor"
          style={{ scale: visorScale, rotate: visorRotate, y: visorY }}
          aria-hidden="true"
        >
          <ScubaVisor />
        </motion.div>

        {/* Layer 4 — lens distortion ripple */}
        <motion.div
          className="mask-ripple"
          style={{ opacity: rippleOpacity, scale: rippleScale }}
          aria-hidden="true"
        />

        {/* Layer 5 — HUD overlays */}
        <motion.div className="mask-hud" style={{ opacity: hudOpacity }} aria-hidden="true">
          <div className="mask-hud__corner mask-hud__corner--tl">
            <span className="mask-hud__dot mask-hud__dot--live" />
            <span>Descent mode · engaged</span>
          </div>
          <div className="mask-hud__corner mask-hud__corner--tr">
            <span className="mask-hud__label">Depth</span>
            <span className="mask-hud__value">
              −{String(depth).padStart(2, '0')}m
            </span>
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

        {/* Deep ocean welcome — fades in at the bottom of the descent */}
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
