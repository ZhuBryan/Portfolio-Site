import { useEffect, useRef } from 'react';
import './SwimBy.css';

/* ── fish (extracted from the old Descent scene) ──────────────────────────── */
function Fish() {
  return (
    <g>
      <g className="dfish-tail">
        <path d="M2 9C-3 5 -10 3 -15 1C-12 6 -12 12 -15 17C-10 15 -3 13 2 9Z" />
      </g>
      <path d="M16 2C22 -3 30 -2 33 2C27 2 21 3 17 5Z" />
      <path d="M0 9C10 1 26 0 38 4C44 6 47 9 47 9C45 10 43 11 38 13C26 17 10 16 0 9Z" />
      <path className="dfish-pec" d="M22 12C20 17 18 19 15 20C19 18 20 15 21 12Z" />
      <circle cx="41" cy="8" r="1.6" fill="#03252f" />
    </g>
  );
}

const SCHOOL = [
  { x: 14, y: 34, s: 1.1, r: 3 },
  { x: 48, y: 16, s: 0.85, r: -7 },
  { x: 74, y: 44, s: 1, r: 6 },
  { x: 104, y: 24, s: 0.9, r: -4 },
  { x: 132, y: 46, s: 1.05, r: 7 },
  { x: 158, y: 20, s: 0.82, r: -6 },
  { x: 184, y: 38, s: 0.95, r: 5 },
];

/** A school of fish rendered as one static SVG; tails/pec fins wiggle via CSS. */
export function FishSchool({ tint }: { tint: string }) {
  return (
    <svg
      viewBox="-30 -24 340 112"
      width="300"
      height="99"
      aria-hidden="true"
      fill={tint}
      style={{ overflow: 'visible' }}
    >
      {SCHOOL.map((f, i) => (
        <g
          key={i}
          transform={`translate(${f.x} ${f.y}) scale(${f.s}) rotate(${f.r})`}
          style={{ ['--d' as string]: `${(-i * 0.13).toFixed(2)}s` }}
        >
          <Fish />
        </g>
      ))}
    </svg>
  );
}

/* ── jellyfish (bell pulse + trailing tentacle sway) ──────────────────────── */
function Jellyfish() {
  return (
    <g>
      <path className="jelly-bell" d="M-20 0 C-20 -18 20 -18 20 0 C12 5 -12 5 -20 0 Z" />
      <path className="jelly-t jelly-t1" fill="none" strokeWidth="2" strokeLinecap="round" d="M-14 3 C-16 13 -11 18 -13 27" />
      <path className="jelly-t jelly-t2" fill="none" strokeWidth="2" strokeLinecap="round" d="M-5 4 C-6 15 -2 19 -4 29" />
      <path className="jelly-t jelly-t3" fill="none" strokeWidth="2" strokeLinecap="round" d="M5 4 C6 15 2 19 4 29" />
      <path className="jelly-t jelly-t4" fill="none" strokeWidth="2" strokeLinecap="round" d="M14 3 C16 13 11 18 13 27" />
    </g>
  );
}

const JELLY_POS = [
  { x: 44, y: 26, s: 0.9 },
  { x: 150, y: 12, s: 1.05 },
  { x: 232, y: 34, s: 0.82 },
];

/** A small bloom of jellyfish, drifting rather than darting. */
export function JellySchool({ tint }: { tint: string }) {
  return (
    <svg
      viewBox="-30 -24 340 112"
      width="300"
      height="99"
      aria-hidden="true"
      fill={tint}
      stroke={tint}
      style={{ overflow: 'visible' }}
    >
      {JELLY_POS.map((j, i) => (
        <g
          key={i}
          transform={`translate(${j.x} ${j.y}) scale(${j.s})`}
          style={{ ['--d' as string]: `${(-i * 0.45).toFixed(2)}s` }}
        >
          <Jellyfish />
        </g>
      ))}
    </svg>
  );
}

/* ── ray (diamond wings, slow flap) ────────────────────────────────────────── */
function Ray() {
  return (
    <g>
      <path
        className="ray-body"
        d="M-38 0 Q-18 -16 0 -4 Q18 -16 38 0 Q18 8 0 3 Q-18 8 -38 0 Z"
      />
      <path className="ray-tail" fill="none" strokeWidth="2" strokeLinecap="round" d="M0 2 C8 4 18 5 27 3" />
    </g>
  );
}

const RAY_POS = [
  { x: 64, y: 22, s: 1.1 },
  { x: 200, y: 38, s: 0.85 },
];

/** A couple of rays gliding by, wings flapping slower than a fish's tail. */
export function RaySchool({ tint }: { tint: string }) {
  return (
    <svg
      viewBox="-30 -24 340 112"
      width="300"
      height="99"
      aria-hidden="true"
      fill={tint}
      stroke={tint}
      style={{ overflow: 'visible' }}
    >
      {RAY_POS.map((r, i) => (
        <g
          key={i}
          transform={`translate(${r.x} ${r.y}) scale(${r.s})`}
          style={{ ['--d' as string]: `${(-i * 0.5).toFixed(2)}s` }}
        >
          <Ray />
        </g>
      ))}
    </svg>
  );
}

/**
 * A creature patrolling its section — pure CSS animation, zero JS per frame.
 * The wrapper is a full-width strip; inside it a "runner" swims to an inset
 * margin, turns around, and swims back, forever, never leaving the section
 * rectangle. A ResizeObserver keeps the turn point (--patrol-x) in step with
 * the strip width, so nothing ever crosses out or gets clipped.
 * Drop one or two into any section that feels static; `species` picks the
 * silhouette (defaults to the fish school).
 */
interface SwimByProps {
  top: string;
  duration?: number; // seconds per leg (one crossing)
  delay?: number;
  reverse?: boolean;
  tint?: string;
  scale?: number;
  species?: 'fish' | 'jelly' | 'ray';
}

const SPECIES: Record<NonNullable<SwimByProps['species']>, (props: { tint: string }) => JSX.Element> = {
  fish: FishSchool,
  jelly: JellySchool,
  ray: RaySchool,
};

const SCHOOL_W = 300; // FishSchool svg intrinsic width (px); scale only shrinks it
const MARGIN = 24; // inset from each strip edge where the school turns around

export default function SwimBy({
  top,
  duration = 40,
  delay = 0,
  reverse = false,
  tint = 'rgba(6, 44, 60, 0.25)',
  scale = 1,
  species = 'fish',
}: SwimByProps) {
  const Creature = SPECIES[species];
  const stripRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const runner = runnerRef.current;
    if (!strip || !runner) return;
    const measure = () => {
      const patrol = Math.max(0, strip.clientWidth - SCHOOL_W - MARGIN * 2);
      runner.style.setProperty('--patrol-x', `${patrol}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    return () => ro.disconnect();
  }, []);

  // `reverse` just offsets the starting phase by one leg (start going/facing
  // left) via a negative delay applied identically to both animations, so the
  // travel and the facing-flip stay locked together.
  const legDelay = delay + (reverse ? -duration : 0);

  return (
    <div
      ref={stripRef}
      className="swimby"
      style={{ top, animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <div
        ref={runnerRef}
        className="swimby__runner"
        style={{ animationDuration: `${duration}s`, animationDelay: `${legDelay}s` }}
      >
        <div
          className="swimby__flip"
          style={{ animationDuration: `${duration * 2}s`, animationDelay: `${legDelay}s` }}
        >
          <div style={{ transform: `scale(${scale})` }}>
            <Creature tint={tint} />
          </div>
        </div>
      </div>
    </div>
  );
}
