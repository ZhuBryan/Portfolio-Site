import { Fragment, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { experience, STAT_OPEN, STAT_CLOSE } from '../../data/experience';
import DriftLayer from '../../components/DriftLayer/DriftLayer';
import BoidsSchool from '../../components/BoidsSchool/BoidsSchool';
import './Experience.css';

/**
 * Splits a bullet string on <stat>…</stat> tokens and yields React nodes
 * with the matched runs rendered as styled stat pills.
 */
function renderBulletWithStats(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  while (cursor < text.length) {
    const start = text.indexOf(STAT_OPEN, cursor);
    if (start === -1) {
      out.push(<Fragment key={index++}>{text.slice(cursor)}</Fragment>);
      break;
    }
    if (start > cursor) {
      out.push(<Fragment key={index++}>{text.slice(cursor, start)}</Fragment>);
    }
    const end = text.indexOf(STAT_CLOSE, start + STAT_OPEN.length);
    if (end === -1) {
      out.push(<Fragment key={index++}>{text.slice(start)}</Fragment>);
      break;
    }
    const inner = text.slice(start + STAT_OPEN.length, end);
    out.push(
      <span key={index++} className="stat-pill">
        {inner}
      </span>
    );
    cursor = end + STAT_CLOSE.length;
  }

  return out;
}

export default function Experience() {
  return (
    <section className="exp-section" id="experience">
      <div className="caustics" aria-hidden="true" />
      <DriftLayer />
      {/* the interactive flocking school swims full-bleed behind the dive-log
          cards (desktop, hover, no-reduced-motion — gated inside the component).
          Click the water to drop food and the school converges. */}
      <BoidsSchool />

      <div className="section-inner">
        <p className="section-label">
          Experience
          <span className="exp-feed-hint">click the water to drop food</span>
        </p>
        <h2 className="section-title">Where I&rsquo;ve worked</h2>
        <p className="section-sub">A couple of roles that shaped how I build.</p>

        <div className="divelog">
          <div className="divelog__line" aria-hidden="true" />

          {experience.map((entry, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            return (
              <motion.div
                className={`divelog-entry divelog-entry--${side}`}
                key={entry.role}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="divelog-entry__anchor" aria-hidden="true">
                  <motion.span
                    className="divelog-dot"
                    style={{ background: entry.dotColor }}
                    initial={{ scale: 0.3, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: i * 0.14 + 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                </div>

                <div className="divelog-card" style={{ ['--entry-glow' as string]: entry.dotColor }}>
                  <div className="divelog-role">{entry.role}</div>
                  <div className="divelog-org">{entry.org}</div>
                  <ul className="divelog-bullets">
                    {entry.bullets.map((bullet, j) => (
                      <li key={j}>
                        <span>{renderBulletWithStats(bullet)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
