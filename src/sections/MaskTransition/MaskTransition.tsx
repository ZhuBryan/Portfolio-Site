import { useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import ScubaVisor from '../../svg/ScubaVisor';
import './MaskTransition.css';

/**
 * Act II — "putting on the mask".
 *
 * Scroll timeline (progress 0 → 1 across a 260vh scrub zone):
 *
 *   0.00 ─ 0.12   just under the surface: bright shallows, mask floats ahead
 *   0.12 ─ 0.50   the mask approaches your face — scales up, levels out,
 *                 the surface light dims as the lagoon hue takes over
 *   0.50 ─ 0.82   ENGULF — the lens swallows the viewport; the rubber rim
 *                 slides past the screen edges; bubbles stream upward
 *   0.82 ─ 0.86   fully inside: only the lagoon is visible through the lens
 *   0.86 ─ 0.98   the whole sticky layer crossfades out over the About
 *                 section, whose background is the IDENTICAL lagoon
 *                 gradient — so the handoff is invisible, no pop
 *
 * The two rules that keep it seamless:
 *   1. Nothing behind the visor ever fades until the zoom is 100% done.
 *   2. The color on screen at fade-out start == About's background color.
 */
export default function MaskTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [depth, setDepth] = useState(2);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  /* ── Visor: approach → engulf. Direct 1:1 mapping (no spring) so reverse
     scrolling replays the exact same frames with zero lag or overshoot. ── */
  const visorScale = useTransform(
    scrollYProgress,
    [0, 0.12, 0.5, 0.82, 1],
    shouldReduceMotion ? [1, 1, 1, 1, 1] : [0.55, 0.8, 3.4, 34, 34]
  );
  const visorY = useTransform(
    scrollYProgress,
    [0, 0.5, 0.82, 1],
    shouldReduceMotion ? [0, 0, 0, 0] : [70, 8, 0, 0]
  );
  const visorRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 0.82, 1],
    shouldReduceMotion ? [0, 0, 0, 0] : [6, 1, 0, 0]
  );

  /* ── Sub-surface light fades as we sink (under-layer is always opaque) ── */
  const shallowsOpacity = useTransform(scrollYProgress, [0.2, 0.62], [1, 0]);

  /* ── Sun shafts strongest near the surface ────────────────────────────── */
  const shaftsOpacity = useTransform(scrollYProgress, [0, 0.55, 0.85], [0.85, 0.5, 0]);

  /* ── Bubbles stream while descending ──────────────────────────────────── */
  const bubblesOpacity = useTransform(
    scrollYProgress,
    [0.12, 0.45, 0.86],
    shouldReduceMotion ? [0, 0, 0] : [0, 1, 0.4]
  );

  /* ── Whole sticky layer crossfades out ONLY after the engulf completes ── */
  const stickyOpacity = useTransform(scrollYProgress, [0.86, 0.98], [1, 0]);

  /* ── HUD + CTA ─────────────────────────────────────────────────────────── */
  const hudOpacity = useTransform(scrollYProgress, [0.04, 0.14, 0.7, 0.84], [0, 1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  // Depth meter eases in — you fall faster the deeper you go.
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const t = Math.max(0, Math.min(1, latest));
    const eased = t * t * (3 - 2 * t);
    const next = Math.round(2 + eased * 16);
    setDepth((prev) => (prev === next ? prev : next));
  });

  // Stable bubble field — randomized once on mount.
  const bubbles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 8 + Math.random() * 20,
        delay: -Math.random() * 12,
        duration: 8 + Math.random() * 7,
        drift: (Math.random() - 0.5) * 90,
      })),
    []
  );

  return (
    <section ref={sectionRef} className="mask-section" id="mask-transition">
      <motion.div className="mask-sticky" style={{ opacity: stickyOpacity }}>
        {/* Layer 1 — the lagoon underneath (always opaque, matches About bg) */}
        <div className="mask-lagoon" aria-hidden="true" />

        {/* Layer 2 — bright shallows just under the surface */}
        <motion.div className="mask-shallows" style={{ opacity: shallowsOpacity }} aria-hidden="true" />

        {/* Layer 3 — sun shafts slicing down */}
        <motion.div className="mask-shafts" style={{ opacity: shaftsOpacity }} aria-hidden="true" />

        {/* Layer 4 — rising bubbles */}
        <motion.div className="mask-bubbles" style={{ opacity: bubblesOpacity }} aria-hidden="true">
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

        {/* Layer 5 — the visor scaling up to engulf the viewport */}
        <motion.div
          className="mask-visor"
          style={{ scale: visorScale, rotate: visorRotate, y: visorY }}
          aria-hidden="true"
        >
          <ScubaVisor />
        </motion.div>

        {/* Layer 6 — dive HUD */}
        <motion.div className="mask-hud" style={{ opacity: hudOpacity }} aria-hidden="true">
          <div className="mask-hud__chip mask-hud__chip--tl">
            <span className="mask-hud__dot" />
            <span>Descent · engaged</span>
          </div>
          <div className="mask-hud__chip mask-hud__chip--tr">
            <span className="mask-hud__label">Depth</span>
            <span className="mask-hud__value">−{String(depth).padStart(2, '0')}m</span>
          </div>
          <div className="mask-hud__chip mask-hud__chip--bl">
            <span>Visibility · excellent</span>
          </div>
          <div className="mask-hud__chip mask-hud__chip--br">
            <span>Water · 27°C</span>
          </div>
        </motion.div>

        {/* Initial CTA */}
        <motion.div className="mask-cta" style={{ opacity: ctaOpacity }} aria-hidden="true">
          <span className="mask-cta__label">keep scrolling — mask on</span>
          <span className="mask-cta__arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
