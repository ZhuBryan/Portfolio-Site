import { useEffect, useState } from 'react';
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
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.09 * i, duration: 0.7, ease: [0.23, 0.86, 0.39, 0.96] },
  }),
};

const STATS = [
  { value: '4.0', label: 'GPA @ Waterloo' },
  { value: 'AR/VR', label: 'Lead @ Reality Labs' },
  { value: '10+', label: 'hackathons' },
];

const MailIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M3.5 7l8.5 6 8.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LinkedInIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.25 8.25h4.5V23H.25V8.25zM8.5 8.25h4.31v2.02h.06c.6-1.14 2.07-2.34 4.26-2.34 4.55 0 5.39 3 5.39 6.89V23h-4.5v-7.1c0-1.69-.03-3.87-2.36-3.87-2.36 0-2.72 1.84-2.72 3.75V23H8.5V8.25z" />
  </svg>
);

const GitHubIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.05.78 2.13v3.16c0 .31.2.66.8.55A11.52 11.52 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const ResumeIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export default function Hero() {
  const [bottleOpen, setBottleOpen] = useState(false);
  // Portrait: attempt to load /images/portrait.jpg; if it 404s we swap to a
  // tasteful "BZ" initials placeholder that keeps the exact same layout.
  // To activate the real photo: drop portrait.jpg into public/images/.
  const [portraitFailed, setPortraitFailed] = useState(false);

  // Close the letter on Escape while it is open.
  useEffect(() => {
    if (!bottleOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBottleOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bottleOpen]);

  return (
    <section className="hero" id="hero">
      <div className="hero-sun" aria-hidden="true" />
      <div className="hero-cloud hero-cloud--a" aria-hidden="true" />
      <div className="hero-cloud hero-cloud--b" aria-hidden="true" />

      <div className="hero-ui">
        {/* Portrait slot — sits right of the copy on desktop, above it on
            mobile. Loads /images/portrait.jpg; onError falls back to a "BZ"
            initials placeholder with identical framing. */}
        <motion.div
          className="hero-portrait"
          initial={{ opacity: 0, y: 18, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-portrait__frame">
            {portraitFailed ? (
              <div className="hero-portrait__fallback" aria-label="Bryan Zhu">
                <span>BZ</span>
              </div>
            ) : (
              <img
                className="hero-portrait__img"
                src="/images/portrait.jpg"
                alt="Bryan Zhu"
                onError={() => setPortraitFailed(true)}
              />
            )}
          </div>
        </motion.div>

        <div className="hero-copy">
        <motion.p className="hero-eyebrow" variants={fadeUp} initial="hidden" animate="show" custom={0}>
          Bryan Zhu · Portfolio
        </motion.p>
        <motion.h1 className="hero-name" variants={fadeUp} initial="hidden" animate="show" custom={1}>
          Bryan Zhu
        </motion.h1>
        <motion.p className="hero-tagline" variants={fadeUp} initial="hidden" animate="show" custom={2}>
          CS student at Waterloo. I build <em>AI&thinsp;/&thinsp;ML</em> systems for problems in{' '}
          <em>finance</em> and security, lead gesture recognition for AR/VR at Waterloo Reality Labs,
          and spend a lot of weekends at hackathons.
        </motion.p>

        <motion.div className="hero-stats" variants={fadeUp} initial="hidden" animate="show" custom={3}>
          {STATS.map((s) => (
            <span className="hero-stat" key={s.label}>
              <strong>{s.value}</strong> {s.label}
            </span>
          ))}
        </motion.div>

        <motion.div className="hero-links" variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <a
            className="hero-link"
            href="https://github.com/ZhuBryan"
            target="_blank"
            rel="noopener noreferrer"
          >
            {GitHubIcon}
            <span>GitHub</span>
          </a>
          <a
            className="hero-link"
            href="https://linkedin.com/in/bryan-zhu101"
            target="_blank"
            rel="noopener noreferrer"
          >
            {LinkedInIcon}
            <span>LinkedIn</span>
          </a>
          <a className="hero-link" href="mailto:b88zhu@uwaterloo.ca">
            {MailIcon}
            <span>b88zhu@uwaterloo.ca</span>
          </a>
          <a className="hero-link" href="/Bryan_Zhu_Resume.pdf" download>
            {ResumeIcon}
            <span>Resume</span>
          </a>
        </motion.div>
        </div>
      </div>

      <div className="hero-water" aria-hidden="true">
        <div className="hero-water__sparkle" />
      </div>
      <OscillatingWave />

      <motion.button
        className="hero-bottle"
        type="button"
        onClick={() => setBottleOpen(true)}
        aria-label="Open the message in a bottle"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="hero-bottle__bob">
          <BottleSvg />
        </span>
        <span className="hero-bottle__hint">psst, open me</span>
      </motion.button>

      <div className="hero-scroll-cue" aria-hidden="true">
        <span>scroll to the projects</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

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
                You opened the bottle, so here&rsquo;s the version that doesn&rsquo;t fit on a resume:
                I&rsquo;m the person who trained a model to spot deforestation from orbit, then spent
                a weekend teaching a browser extension to gently talk you out of an impulse buy. Most
                days it&rsquo;s AR/VR gesture recognition at Waterloo Reality Labs; most weekends it&rsquo;s
                whatever a hackathon throws at me, honeypots, rental-map AI, robots that argue with
                each other over a shared bus. If any of that sounds like your kind of problem, send a
                message back my way.
              </p>
              <p className="bottle-letter__sign">B</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
