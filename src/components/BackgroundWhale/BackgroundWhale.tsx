import './BackgroundWhale.css';

/** Traced from a public-domain whale silhouette (OpenClipart, via
 * freesvg.org/whale-silhouette) for proportions: long torpedo body, small
 * tail fluke at the rear, faint mouth line near the head. */
function WhaleShape() {
  return (
    <g>
      <path d="M-60 0 C-50 -14 0 -16 50 -8 C60 -6 68 -2 72 0 C68 2 60 4 50 6 C0 14 -50 12 -60 0 Z" />
      <path d="M-60 0 L-74 -9 L-67 0 L-74 9 Z" />
      <path
        className="bgw-mouth"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M52 2 C58 3 64 3.4 68 2.6"
      />
    </g>
  );
}

interface BackgroundWhaleProps {
  top: string;
  duration?: number;
  delay?: number;
  tint?: string;
  scale?: number;
}

/**
 * A single large whale silhouette drifting slowly, one-way, across the far
 * background of a section (a couple of minutes per crossing). Deliberately
 * faint and slow so it reads as distant scale, not another foreground
 * creature. Pure CSS, no ResizeObserver: the drift distance is in vw so it
 * scales with the viewport automatically.
 */
export default function BackgroundWhale({
  top,
  duration = 110,
  delay = 0,
  tint = 'rgba(3, 25, 34, 0.1)',
  scale = 1,
}: BackgroundWhaleProps) {
  const w = Math.round(260 * scale);
  const h = Math.round(w * (48 / 180));
  return (
    <div
      className="bg-whale"
      style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <svg viewBox="-90 -24 180 48" width={w} height={h} fill={tint} stroke={tint} style={{ overflow: 'visible' }}>
        <WhaleShape />
      </svg>
    </div>
  );
}
