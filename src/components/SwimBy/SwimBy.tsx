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

/* ── round tropical fish (chunkier body, dorsal hump) ──────────────────────
   Traced from a public-domain tropical-fish silhouette (OpenClipart, via
   freesvg.org/fish-black-silhouette) for proportions: rounder body, raised
   dorsal fin, blunter nose than the slim minnow shape above. */
function RoundFish() {
  return (
    <g>
      <path className="rf-tail" d="M-14 0 L-25 -9 L-25 9 Z" />
      <path d="M-14 0 C-14 -11 -3 -15 8 -14 C17 -13 22 -6 23 0 C22 6 17 13 8 14 C-3 15 -14 11 -14 0 Z" />
      <path className="rf-dorsal" d="M1 -14 C5 -20 12 -20 14 -15 C10 -14 5 -13 1 -14 Z" />
      <circle cx="15" cy="-4" r="1.6" fill="#03252f" />
    </g>
  );
}

const ROUNDFISH_POS = [
  { x: 20, y: 30, s: 1, r: 4 },
  { x: 60, y: 14, s: 0.8, r: -6 },
  { x: 100, y: 40, s: 0.95, r: 5 },
  { x: 140, y: 20, s: 0.85, r: -4 },
];

export function RoundFishSchool({ tint }: { tint: string }) {
  return (
    <svg
      viewBox="-30 -24 340 112"
      width="300"
      height="99"
      aria-hidden="true"
      fill={tint}
      style={{ overflow: 'visible' }}
    >
      {ROUNDFISH_POS.map((f, i) => (
        <g
          key={i}
          transform={`translate(${f.x} ${f.y}) scale(${f.s}) rotate(${f.r})`}
          style={{ ['--d' as string]: `${(-i * 0.16).toFixed(2)}s` }}
        >
          <RoundFish />
        </g>
      ))}
    </svg>
  );
}

/* ── ray / manta (diamond wings, trailing tail) ────────────────────────────
   Traced from a public-domain manta ray engraving (Wikimedia Commons, via
   freesvg.org/devilfish) for proportions: wide flat diamond body with a
   center front notch, thin tapering tail off the rear. */
function Ray() {
  return (
    <g>
      <path d="M-42 2 L-6 -15 L0 -8 L6 -15 L42 2 Q20 10 0 7 Q-20 10 -42 2 Z" />
      <path className="ray-tail" d="M-3 6 L3 6 L1 46 L-1 46 Z" />
    </g>
  );
}

const RAY_POS = [
  { x: 60, y: 24, s: 1 },
  { x: 190, y: 40, s: 0.8 },
];

export function RaySchool({ tint }: { tint: string }) {
  return (
    <svg
      viewBox="-30 -24 340 112"
      width="300"
      height="99"
      aria-hidden="true"
      fill={tint}
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

/* ── shrimp (segmented body, tail fan, trailing antenna) ───────────────────
   Traced from an 1885 public-domain scientific plate (F.J. Bell, via
   freesvg.org/commonprawn) for proportions: curved segmented body, fan
   tail, a single long trailing antenna off the head. */
function Shrimp() {
  return (
    <g>
      <path d="M16 -4 Q-2 -18 -18 -8 Q-14 0 -18 8 Q0 10 16 4 Q20 0 16 -4 Z" />
      <path className="shrimp-tail" d="M-18 -8 L-30 -13 L-21 -4 Z" />
      <path className="shrimp-tail" d="M-18 0 L-32 0 L-20 3 Z" />
      <path className="shrimp-tail" d="M-18 6 L-28 12 L-19 3 Z" />
      <circle cx="15" cy="-2" r="1.3" fill="#03252f" />
      <path
        className="shrimp-antenna"
        fill="none"
        strokeWidth="1.3"
        strokeLinecap="round"
        d="M15 -6 C22 -12 28 -10 34 -16"
      />
    </g>
  );
}

const SHRIMP_POS = [
  { x: 30, y: 20, s: 0.9 },
  { x: 90, y: 34, s: 0.75 },
];

export function ShrimpSchool({ tint }: { tint: string }) {
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
      {SHRIMP_POS.map((s, i) => (
        <g
          key={i}
          transform={`translate(${s.x} ${s.y}) scale(${s.s})`}
          style={{ ['--d' as string]: `${(-i * 0.3).toFixed(2)}s` }}
        >
          <Shrimp />
        </g>
      ))}
    </svg>
  );
}

/**
 * A school of creatures patrolling its section — pure CSS animation, zero JS
 * per frame. The wrapper is a full-width strip; inside it a "runner" swims to
 * an inset margin, turns around, and swims back, forever, never leaving the
 * section rectangle. A ResizeObserver keeps the turn point (--patrol-x) in
 * step with the strip width, so nothing ever crosses out or gets clipped.
 * Drop one or two into any section that feels static; `species` picks the
 * silhouette (defaults to the slim fish school).
 */
interface SwimByProps {
  top: string;
  duration?: number; // seconds per leg (one crossing)
  delay?: number;
  reverse?: boolean;
  tint?: string;
  scale?: number;
  species?: 'fish' | 'roundfish' | 'ray' | 'shrimp';
}

const SPECIES: Record<NonNullable<SwimByProps['species']>, (props: { tint: string }) => JSX.Element> = {
  fish: FishSchool,
  roundfish: RoundFishSchool,
  ray: RaySchool,
  shrimp: ShrimpSchool,
};

const SCHOOL_W = 300; // school svg intrinsic width (px); scale only shrinks it
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
