import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Project, TagTone } from '../../data/projects';

/** Kick off playback, swallowing the promise rejection browsers throw when a
 *  play() is interrupted (e.g. a fast mouseleave before it resolves). */
function safePlay(el: HTMLVideoElement | null) {
  if (!el) return;
  const p = el.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

const TAG_TONE_CLASS: Record<TagTone, string> = {
  teal: 'tag tag-teal',
  amber: 'tag tag-amber',
  blue: 'tag tag-blue',
  purple: 'tag tag-purple',
};

interface FlagshipCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

type AccentStyle = CSSProperties & {
  '--card-accent'?: string;
  '--tilt-x'?: string;
  '--tilt-y'?: string;
  '--glow-x'?: string;
  '--glow-y'?: string;
};

/**
 * The large horizontal "exhibit" — thumbnail on one side, copy + metrics + tags
 * on the other. Reuses the CoralCard 3D-tilt idiom (pointer-driven rotate)
 * but at flagship scale. Tilt is disabled under reduced-motion.
 */
export default function FlagshipCard({ project, onSelect }: FlagshipCardProps) {
  const { name, description, tagline, tags, accentColor, imageUrl, metrics, video } = project;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const [videoOn, setVideoOn] = useState(false);

  // Hover-preview: play the clip on enter, reset it on leave. Only active when
  // the project actually defines a `video` src — otherwise this is inert.
  const handleEnter = () => {
    if (!video) return;
    setVideoOn(true);
    safePlay(videoRef.current);
  };
  const handleLeave = () => {
    reset();
    if (!video) return;
    setVideoOn(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  const handleMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 6,
      ry: (px - 0.5) * 6,
      gx: px * 100,
      gy: py * 100,
    });
  };

  const reset = () => setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });

  const style: AccentStyle = {
    '--card-accent': accentColor,
    '--tilt-x': `${tilt.rx}deg`,
    '--tilt-y': `${tilt.ry}deg`,
    '--glow-x': `${tilt.gx}%`,
    '--glow-y': `${tilt.gy}%`,
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      className="flagship-card"
      style={style}
      onClick={() => onSelect(project)}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      aria-label={`Open details for ${name}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="flagship-card__glow" aria-hidden="true" />

      <div className="flagship-card__media" aria-hidden="true">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="flagship-card__img" loading="lazy" />
        ) : (
          <div className="reef-card__placeholder">Preview coming soon</div>
        )}
        {video && (
          <video
            ref={videoRef}
            className="flagship-card__video"
            style={{ opacity: videoOn ? 1 : 0 }}
            src={video}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
        <span className="flagship-card__flag">Flagship exhibit</span>
      </div>

      <div className="flagship-card__body">
        <div className="flagship-card__titlerow">
          <h3 className="flagship-card__name">{name}</h3>
          <span className="reef-card__open">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

        {tagline && <p className="flagship-card__tagline">{tagline}</p>}
        <p className="flagship-card__desc">{description}</p>

        {metrics && metrics.length > 0 && (
          <div className="flagship-card__metrics">
            {metrics.map((m) => (
              <div key={m.label} className="metric">
                <span className="metric__value">{m.value}</span>
                <span className="metric__label">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flagship-card__tags">
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
