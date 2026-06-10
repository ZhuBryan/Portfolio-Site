import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import './About.css';

/**
 * Three.js + R3F together weigh ~600 KB gzipped — lazy-load the reef so it
 * streams in after first paint. Until the chunk lands the section is just
 * the lagoon gradient, which is exactly what the mask transition needs to
 * crossfade against, so nothing visually breaks while loading.
 */
const TurtleMascot3D = lazy(() => import('../../components/TurtleMascot3D/TurtleMascot3D'));

const STATS = [
  { value: '4.0', label: 'GPA @ Waterloo' },
  { value: 'AR/VR', label: 'Lead @ Reality Labs' },
  { value: '10+', label: 'Hackathons built' },
];

export default function About() {
  return (
    <section className="about-section" id="about">
      {/* live 3D reef — sticky 100vh canvas, so the school stays in frame
          for the entire scroll through the section */}
      <div className="about-canvas" aria-hidden="true">
        <div className="about-canvas__sticky">
          <Suspense fallback={null}>
            <TurtleMascot3D fullBleed height="100%" showHud />
          </Suspense>
        </div>
      </div>

      {/* sun shafts continuing down from the transition */}
      <div className="about-rays" aria-hidden="true" />

      <div className="section-inner about-inner">
        <motion.div
          className="about-panel"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label section-label--ink">Act III · The Deep</p>
          <h2 className="about-title">
            Welcome to <em>the reef</em>.
          </h2>
          <p className="about-copy">
            I&rsquo;m a CS student at the <strong>University of Waterloo</strong> building things at
            the intersection of <strong>AI, machine learning, and finance</strong>. Right now I lead
            AR/VR gesture recognition at <strong>Waterloo Reality Labs</strong>. Obsessive hackathon
            builder — I like hard problems, elegant systems, and the occasional sea turtle.
          </p>
          <div className="about-stats">
            {STATS.map((s) => (
              <div className="about-stat" key={s.label}>
                <span className="about-stat__value">{s.value}</span>
                <span className="about-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="about-hint">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M13 6l-7 7 7 7M6 13h12a4 4 0 004-4V5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            move your cursor — the locals follow it
          </p>
        </motion.div>
      </div>
    </section>
  );
}
