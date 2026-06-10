import { useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { Project, TagTone } from '../../data/projects';

const TAG_TONE_CLASS: Record<TagTone, string> = {
  teal: 'tag tag-teal',
  amber: 'tag tag-amber',
  blue: 'tag tag-blue',
  purple: 'tag tag-purple',
};

interface CoralCardProps {
  project: Project;
  /** Position in the grid — drives the entrance stagger. */
  index: number;
  onSelect: (project: Project) => void;
}

type AccentStyle = CSSProperties & { '--card-accent'?: string };

export default function CoralCard({ project, index, onSelect }: CoralCardProps) {
  const { name, description, tags, accentColor, imageUrl, thumbnailVideoUrl } = project;
  const [isHovered, setIsHovered] = useState(false);

  const style: AccentStyle = { '--card-accent': accentColor };

  return (
    <motion.button
      type="button"
      className="reef-card"
      style={style}
      onClick={() => onSelect(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Open details for ${name}`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="reef-card__media" aria-hidden="true">
        {project.mediaType === 'video' && isHovered && thumbnailVideoUrl ? (
          <video
            src={thumbnailVideoUrl}
            className="reef-card__video"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : imageUrl ? (
          <img src={imageUrl} alt="" className="reef-card__img" loading="lazy" />
        ) : (
          <div className="reef-card__placeholder">Preview coming soon</div>
        )}
        <span className="reef-card__accent" />
      </div>

      <div className="reef-card__body">
        <div className="reef-card__titlerow">
          <h3 className="reef-card__name">{name}</h3>
          <span className="reef-card__open">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17L17 7M9 7h8v8"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <p className="reef-card__desc">{description}</p>
        <div className="reef-card__tags">
          {tags.map((t) => (
            <span key={t.label} className={TAG_TONE_CLASS[t.tone]}>
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
