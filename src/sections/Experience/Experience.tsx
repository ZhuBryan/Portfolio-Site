import { Fragment, type ReactNode } from 'react';
import SectionLabel from '../../components/SectionLabel';
import DepthBar from '../../components/DepthBar';
import ParallaxCoralBackdrop from '../../components/ParallaxCoralBackdrop';
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
      <ParallaxCoralBackdrop tone="amber" density="quiet" />
      <DepthBar ticks={3} opacity={0.7} />
      <SectionLabel>Experience</SectionLabel>

      <div className="timeline">
        {experience.map((entry) => (
          <div className="timeline-item" key={entry.role}>
            <div className="timeline-dot" style={{ background: entry.dotColor }} />
            <div className="timeline-role">{entry.role}</div>
            <div className="timeline-org">{entry.org}</div>
            <ul className="timeline-bullets">
              {entry.bullets.map((bullet, i) => (
                <li key={i}>
                  <span>{renderBulletWithStats(bullet)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
