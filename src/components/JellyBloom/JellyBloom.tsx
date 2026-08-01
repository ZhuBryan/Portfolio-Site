import './JellyBloom.css';

/** Bell + four trailing tentacles; pulse/sway are driven entirely by CSS. */
function JellyfishGlyph() {
  return (
    <g>
      <path className="jb-bell" d="M-18 0 C-18 -16 18 -16 18 0 C11 4 -11 4 -18 0 Z" />
      <path className="jb-t jb-t1" fill="none" strokeWidth="2" strokeLinecap="round" d="M-13 3 C-15 12 -10 16 -12 24" />
      <path className="jb-t jb-t2" fill="none" strokeWidth="2" strokeLinecap="round" d="M-4 4 C-5 13 -2 17 -3 26" />
      <path className="jb-t jb-t3" fill="none" strokeWidth="2" strokeLinecap="round" d="M4 4 C5 13 2 17 3 26" />
      <path className="jb-t jb-t4" fill="none" strokeWidth="2" strokeLinecap="round" d="M13 3 C15 12 10 16 12 24" />
    </g>
  );
}

interface JellyBloomProps {
  /** Fixed position, near the surface — this creature drifts in place, it
   * does not patrol across the section. */
  left: string;
  top: string;
  tint?: string;
  scale?: number;
  delay?: number;
}

/**
 * A single jellyfish that pulses and sways gently in place near the surface.
 * Pure CSS, no patrol animation, small local drift only (a few px), so it
 * never reads as "swimming across" or "deep in the water" — just a bit of
 * ambient life near the top of a section.
 */
export default function JellyBloom({
  left,
  top,
  tint = 'rgba(210, 248, 252, 0.4)',
  scale = 1,
  delay = 0,
}: JellyBloomProps) {
  return (
    <div className="jelly-bloom" style={{ left, top, animationDelay: `${delay}s` }} aria-hidden="true">
      <svg
        viewBox="-24 -20 48 56"
        width={48 * scale}
        height={56 * scale}
        fill={tint}
        stroke={tint}
        style={{ overflow: 'visible' }}
      >
        <JellyfishGlyph />
      </svg>
    </div>
  );
}
