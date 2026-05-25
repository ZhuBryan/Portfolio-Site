import type { CSSProperties } from 'react';
import type { Project, TagTone } from '../../data/projects';

const TAG_TONE_CLASS: Record<TagTone, string> = {
  teal: 'tag tag-teal',
  amber: 'tag tag-amber',
  blue: 'tag tag-blue',
  purple: 'tag tag-purple',
};

interface CoralCardProps {
  project: Project;
  /** Position in the grid — used to stagger sway + polyp pulse cadence. */
  index: number;
  onSelect: (project: Project) => void;
}

/**
 * `--project-accent` and `--coral-stagger` are read by Projects.css to
 *   1. drive the per-card hover ignite glow color
 *   2. offset each card's sway + polyp pulse so the reef doesn't breathe
 *      in lockstep (creates the organic out-of-sync effect)
 */
type CoralCardStyle = CSSProperties & {
  '--project-accent'?: string;
  '--coral-stagger'?: string;
};

export default function CoralCard({ project, index, onSelect }: CoralCardProps) {
  const { Coral, name, description, tags, accentColor, borderColor } = project;

  const cardStyle: CoralCardStyle = {
    '--project-accent': accentColor,
    '--coral-stagger': `${(index * 0.83) % 4}s`,
  };

  return (
    <button
      type="button"
      className="coral-card"
      onClick={() => onSelect(project)}
      aria-label={`Open details for ${name}`}
      style={cardStyle}
    >
      <div className="coral-stem-wrap">
        <Coral />
      </div>
      <div className="coral-body" style={{ borderColor }}>
        <div className="coral-top" style={{ background: accentColor, opacity: 0.7 }} />
        <div className="pname">{name}</div>
        <div className="pdesc">{description}</div>
        <div className="tags">
          {tags.map((t) => (
            <span key={t.label} className={TAG_TONE_CLASS[t.tone]}>
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
