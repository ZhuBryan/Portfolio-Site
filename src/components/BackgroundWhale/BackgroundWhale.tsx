import './BackgroundWhale.css';

/** Real path data from a public-domain cartoon whale (OpenClipart, "Small
 * whale" by lemmling, via freesvg.org/lemmling-small-whale), recentered to
 * local coordinates and reduced to a single-tint silhouette (dropped the
 * original's shading/highlight layers, kept the body + eye). */
function WhaleShape() {
  return (
    <g transform="translate(-212.23 -503.19)">
      <g transform="matrix(1.1464 0 0 1.1464 -42.499 -79.329)">
        <path d="m343.65 566.1c8.39 0 11.58-11.25 11.58-11.25s11.57-44.99-34.73-44.99c-34.73 0-55 48.66-77.54 43.34-6.83-1.61 11.66-14.95 11.66-14.95s-16.68-2.41-21.27 1.63c-0.05-11.76-4.62-24.03-4.62-24.03s-20.73 50.25 23.98 50.25h36.31s-3.49 16.92 25.81 0h28.82z" />
        <path
          d="m200 489.86a12.5 12.5 0 1 1 -25 0 12.5 12.5 0 1 1 25 0z"
          fill="#03252f"
          transform="matrix(-.46305 0 0 .44996 410.15 328.37)"
        />
      </g>
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
  const w = Math.round(220 * scale);
  const h = Math.round(w * (77.1 / 155.99));
  return (
    <div
      className="bg-whale"
      style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 155.99 77.1" width={w} height={h} fill={tint} style={{ overflow: 'visible' }}>
        <WhaleShape />
      </svg>
    </div>
  );
}
