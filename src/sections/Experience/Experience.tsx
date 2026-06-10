import { Fragment, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { experience, STAT_OPEN, STAT_CLOSE } from '../../data/experience';
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
      <div className="section-inner">
        <p className="section-label">Act V · The Currents</p>
        <h2 className="section-title">Experience</h2>
        <p className="section-sub">Where the diving has taken me so far.</p>

        <div className="timeline">
          {experience.map((entry, i) => (
            <motion.div
              className="timeline-item"
              key={entry.role}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="timeline-dot" style={{ background: entry.dotColor }} />
              <div className="timeline-card">
                <div className="timeline-role">{entry.role}</div>
                <div className="timeline-org">{entry.org}</div>
                <ul className="timeline-bullets">
                  {entry.bullets.map((bullet, j) => (
                    <li key={j}>
                      <span>{renderBulletWithStats(bullet)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
