import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OscillatingWave from '../../components/OscillatingWave';
import './Hero.css';

/** Hand-drawn message-in-a-bottle, bobbing on the waterline. */
function BottleSvg() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id="bottle-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="45%" stopColor="rgba(190,240,245,0.55)" />
          <stop offset="100%" stopColor="rgba(120,210,225,0.6)" />
        </linearGradient>
      </defs>
      <g transform="rotate(24 60 60)">
        {/* cork */}
        <rect x="52" y="8" width="16" height="14" rx="4" fill="#b5773f" />
        {/* neck */}
        <rect x="53" y="20" width="14" height="14" rx="5" fill="url(#bottle-glass)" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
        {/* body */}
        <path
          d="M48 32 h24 c8 6 12 14 12 26 v28 c0 8 -6 14 -14 14 h-20 c-8 0 -14 -6 -14 -14 v-28 c0 -12 4 -20 12 -26 z"
          fill="url(#bottle-glass)"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="2.5"
        />
        {/* rolled letter inside */}
        <rect x="50" y="52" width="20" height="34" rx="9" fill="#fff6dd" stroke="#eab308" strokeWidth="1.5" />
        <line x1="56" y1="60" x2="64" y2="60" stroke="#d9a514" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="56" y1="67" x2="64" y2="67" stroke="#d9a514" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="56" y1="74" x2="62" y2="74" stroke="#d9a514" strokeWidth="1.6" strokeLinecap="round" />
        {/* glass shine */}
        <path d="M44 42 c-3 6 -4 12 -4 18" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 26, filter: 'blur(10px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.12 * i, duration: 0.9, ease: [0.23, 0.86, 0.39, 0.96] },
  }),
};

/** Floating translucent shape — dramatic entrance, then endless slow drift. */
function FloatingShape({
  className,
  delay,
  rotate = 0,
}: {
  className: string;
  delay: number;
  rotate?: number;
}) {
  return (
    <motion.div
      className={`hero-shape ${className}`}
      aria-hidden="true"
      initial={{ opacity: 0, y: -120, rotate: rotate - 14 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.2, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.1, delay } }}
    >
      <motion.div
        className="hero-shape__inner"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay }}
      />
    </motion.div>
  );
}

export default function Hero() {
  const [bottleOpen, setBottleOpen] = useState(false);

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      {/* sun + drifting clouds */}
      <div className="hero-sun" aria-hidden="true" />
      <div className="hero-cloud hero-cloud--a" aria-hidden="true" />
      <div className="hero-cloud hero-cloud--b" aria-hidden="true" />
      <div className="hero-cloud hero-cloud--c" aria-hidden="true" />

      {/* floating translucent shapes (elegant entrance, endless drift) */}
      <FloatingShape className="hero-shape--a" delay={0.4} rotate={10} />
      <FloatingShape className="hero-shape--b" delay={0.65} rotate={-8} />
      <FloatingShape className="hero-shape--c" delay={0.9} rotate={4} />

      {/* headline */}
      <div className="hero-ui">
        <motion.p className="hero-eyebrow" variants={fadeUp} initial="hidden" animate="show" custom={0}>
          The Deep Dive · A Portfolio
        </motion.p>
        <motion.h1 className="hero-name" variants={fadeUp} initial="hidden" animate="show" custom={1}>
          Bryan Zhu
        </motion.h1>
        <motion.p className="hero-tagline" variants={fadeUp} initial="hidden" animate="show" custom={2}>
          CS @ Waterloo — building at the intersection of{' '}
          <em>AI&thinsp;/&thinsp;ML</em> and <em>finance</em>.
          <br />
          Grab a mask. The good stuff is below the surface.
        </motion.p>
        <motion.div className="hero-cta-row" variants={fadeUp} initial="hidden" animate="show" custom={3}>
          <button className="btn-primary" type="button" onClick={scrollToProjects}>
            Dive to the projects
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a className="btn-ghost" href="/Bryan_Zhu_Resume.pdf" download>
            Download resume
          </a>
        </motion.div>
      </div>

      {/* water band + rolling wave threshold */}
      <div className="hero-water" aria-hidden="true">
        <div className="hero-water__sparkle" />
      </div>
      <OscillatingWave />

      {/* the message in a bottle, floating on the surface */}
      <motion.button
        className="hero-bottle"
        type="button"
        onClick={() => setBottleOpen(true)}
        aria-label="Open the message in a bottle"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="hero-bottle__bob">
          <BottleSvg />
        </span>
        <span className="hero-bottle__hint">psst — open me</span>
      </motion.button>

      {/* scroll cue */}
      <div className="hero-scroll-cue" aria-hidden="true">
        <span>scroll to dive</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* message-in-a-bottle popup */}
      <AnimatePresence>
        {bottleOpen && (
          <motion.div
            className="bottle-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setBottleOpen(false)}
          >
            <motion.div
              className="bottle-letter"
              role="dialog"
              aria-modal="true"
              aria-label="A message from Bryan"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 40, rotate: -3, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <button
                className="bottle-letter__close"
                type="button"
                onClick={() => setBottleOpen(false)}
                aria-label="Close message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
              <p className="bottle-letter__eyebrow">A message washed ashore</p>
              <p className="bottle-letter__body">
                Hey — I&rsquo;m Bryan. I study CS at the University of Waterloo, lead AR/VR gesture
                recognition at Waterloo Reality Labs, and spend most weekends at hackathons turning
                caffeine into demos. I like hard problems, elegant systems, and sea turtles.
              </p>
              <p className="bottle-letter__sign">— B</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
