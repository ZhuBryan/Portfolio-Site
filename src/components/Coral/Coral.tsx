import './Coral.css';

/* ─────────────────────────────────────────────────────────────────────────
   Coral — a crafted reef band along the bottom edge of a section. Instead of
   flat silhouettes we render distinct SPECIES as small gradient-filled SVG
   groups: staghorn (forking branches), sea fans (a veined lattice), brain
   coral (grooved dome), tube sponges (clustered pipes), anemones (waving
   tentacle crown) and kelp (tall swaying blades).

   Three DEPTH PLANES stack back → front. The back plane is pushed down, scaled
   up, blurred and DESATURATED (a cooler, dimmer version of the reef palette);
   the front plane is crisp, saturated and small. Every organism sways from its
   ROOTED BASE (transform-origin bottom) with a slow, staggered delay so the
   whole reef breathes rather than pulsing in unison.

   Pure decoration: aria-hidden, pointer-events:none, animation gated off under
   prefers-reduced-motion. Cards stay fully readable above it (z-index 1).
   ───────────────────────────────────────────────────────────────────────── */

// Reef palette — coral pinks/orange, magenta, lilac, teal. Depth planes tint
// toward the deep lagoon via CSS filter (saturation/brightness), so these are
// the FRONT-plane (full-saturation) colours.
const C = {
  coral: '#ff6f61',
  blush: '#ff9ec0',
  magenta: '#e6539e',
  amber: '#ffab4d',
  lilac: '#c9a2e8',
  teal: '#2fbf8f',
};

type SwayProps = { delay: number; sway?: number };

// ── Staghorn coral: a forking branch cluster ────────────────────────────────
function Staghorn({ delay, sway = 2.4 }: SwayProps) {
  return (
    <g
      className="coral-organism"
      style={{ animationDelay: `${delay.toFixed(2)}s`, ['--sway' as string]: `${sway}deg` }}
    >
      <path
        fill="url(#coral-staghorn)"
        d="M28 96 L27 58 Q25 48 18 43 Q11 38 13 30 Q19 34 23 40 Q22 30 27 22 Q31 30 30 40 Q35 33 41 30 Q41 39 34 45 Q30 49 30 58 L31 96 Z M27 46 Q22 42 20 36 Q25 38 28 43 Z"
      />
      <path
        fill="url(#coral-staghorn)"
        opacity="0.9"
        d="M40 96 L40 66 Q39 58 45 53 Q51 48 50 41 Q45 45 42 50 Q43 42 39 36 Q36 43 37 51 Q33 47 28 46 Q29 53 34 57 Q39 60 39 66 L38 96 Z"
      />
    </g>
  );
}

// ── Sea fan: a rounded blade with an internal lattice of veins ──────────────
function SeaFan({ delay, sway = 3 }: SwayProps) {
  return (
    <g
      className="coral-organism"
      style={{ animationDelay: `${delay.toFixed(2)}s`, ['--sway' as string]: `${sway}deg` }}
    >
      <path d="M33 96 L33 60" stroke="url(#coral-fan)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path
        fill="url(#coral-fan)"
        d="M33 62 Q10 54 12 32 Q13 16 33 12 Q53 16 54 32 Q56 54 33 62 Z"
      />
      <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" fill="none" strokeLinecap="round">
        <path d="M33 60 L33 15" />
        <path d="M33 56 Q22 50 19 34" />
        <path d="M33 56 Q44 50 47 34" />
        <path d="M33 48 Q24 44 21 30" />
        <path d="M33 48 Q42 44 45 30" />
        <path d="M33 38 Q26 34 24 24" />
        <path d="M33 38 Q40 34 42 24" />
        <path d="M22 44 Q28 42 33 42 Q38 42 44 44" />
        <path d="M25 32 Q29 31 33 31 Q37 31 41 32" />
      </g>
    </g>
  );
}

// ── Brain coral: a grooved dome sitting low on the floor ────────────────────
function BrainCoral({ delay, sway = 1.2 }: SwayProps) {
  return (
    <g
      className="coral-organism"
      style={{ animationDelay: `${delay.toFixed(2)}s`, ['--sway' as string]: `${sway}deg` }}
    >
      <path
        fill="url(#coral-brain)"
        d="M6 96 Q4 70 20 60 Q34 52 48 60 Q64 70 62 96 Z"
      />
      <g stroke="rgba(120,20,60,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M14 92 Q18 80 12 72" />
        <path d="M24 94 Q20 82 28 74 Q34 68 30 62" />
        <path d="M38 94 Q42 82 36 74 Q31 68 37 62" />
        <path d="M48 92 Q46 80 52 72" />
        <path d="M18 66 Q24 64 30 66" />
        <path d="M38 66 Q44 64 50 66" />
      </g>
    </g>
  );
}

// ── Tube sponges: a cluster of pipes with open mouths ───────────────────────
function TubeSponge({ delay, sway = 1.8 }: SwayProps) {
  return (
    <g
      className="coral-organism"
      style={{ animationDelay: `${delay.toFixed(2)}s`, ['--sway' as string]: `${sway}deg` }}
    >
      <path fill="url(#coral-tube)" d="M14 96 L15 46 Q15 40 21 40 Q27 40 27 46 L26 96 Z" />
      <path fill="url(#coral-tube)" opacity="0.92" d="M26 96 L27 34 Q27 28 33 28 Q39 28 39 34 L38 96 Z" />
      <path fill="url(#coral-tube)" opacity="0.85" d="M38 96 L39 52 Q39 46 45 46 Q51 46 51 52 L50 96 Z" />
      <ellipse cx="21" cy="45" rx="4.4" ry="1.8" fill="rgba(90,20,50,0.55)" />
      <ellipse cx="33" cy="33" rx="4.6" ry="1.9" fill="rgba(90,20,50,0.55)" />
      <ellipse cx="45" cy="51" rx="4.4" ry="1.8" fill="rgba(90,20,50,0.55)" />
    </g>
  );
}

// ── Anemone: a squat base with a crown of waving tentacles ──────────────────
function Anemone({ delay, sway = 3.6 }: SwayProps) {
  const tentacles = [-30, -20, -10, 0, 10, 20, 30];
  return (
    <g
      className="coral-organism"
      style={{ animationDelay: `${delay.toFixed(2)}s`, ['--sway' as string]: `${sway}deg` }}
    >
      <path fill="url(#coral-anem)" d="M22 96 Q20 72 33 66 Q46 72 44 96 Z" />
      <g stroke="url(#coral-anem)" strokeWidth="3" fill="none" strokeLinecap="round">
        {tentacles.map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const tx = 33 + Math.sin(rad) * 22;
          const ty = 66 - Math.cos(rad) * 22;
          const cx = 33 + Math.sin(rad) * 11;
          const cy = 62 - Math.cos(rad) * 11;
          return <path key={i} d={`M33 66 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`} />;
        })}
      </g>
      {tentacles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const tx = 33 + Math.sin(rad) * 22;
        const ty = 66 - Math.cos(rad) * 22;
        return <circle key={`t${i}`} cx={tx} cy={ty} r="1.8" fill={C.blush} />;
      })}
    </g>
  );
}

// ── Kelp: tall paired blades that sway from the holdfast ─────────────────────
function Kelp({ delay, sway = 4.5 }: SwayProps) {
  return (
    <g
      className="coral-organism"
      style={{ animationDelay: `${delay.toFixed(2)}s`, ['--sway' as string]: `${sway}deg` }}
    >
      <path
        fill="url(#coral-kelp)"
        d="M28 96 Q22 66 30 40 Q34 26 30 10 Q37 24 35 42 Q33 66 34 96 Z"
      />
      <path
        fill="url(#coral-kelp)"
        opacity="0.85"
        d="M36 96 Q40 68 34 46 Q30 30 36 16 Q34 32 40 48 Q45 70 42 96 Z"
      />
    </g>
  );
}

const ORGANISMS = { staghorn: Staghorn, fan: SeaFan, brain: BrainCoral, tube: TubeSponge, anemone: Anemone, kelp: Kelp };
type Species = keyof typeof ORGANISMS;

interface Cluster {
  species: Species;
  left: number; // % across the width
  scale: number;
  delay: number;
  sway?: number;
}

interface PlaneProps {
  className: string; // depth-tint class
  translateY: number;
  clusters: Cluster[];
}

// One depth plane: an SVG canvas of rooted organisms across the width.
function CoralPlane({ className, translateY, clusters }: PlaneProps) {
  return (
    <svg
      className={`coral-plane ${className}`}
      viewBox="0 0 1000 100"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{ transform: `translateY(${translateY}px)` }}
    >
      <defs>
        <linearGradient id="coral-staghorn" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.magenta} />
          <stop offset="100%" stopColor={C.coral} />
        </linearGradient>
        <linearGradient id="coral-fan" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.magenta} />
          <stop offset="100%" stopColor={C.blush} />
        </linearGradient>
        <radialGradient id="coral-brain" cx="50%" cy="90%" r="80%">
          <stop offset="0%" stopColor={C.blush} />
          <stop offset="100%" stopColor={C.coral} />
        </radialGradient>
        <linearGradient id="coral-tube" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.coral} />
          <stop offset="100%" stopColor={C.amber} />
        </linearGradient>
        <linearGradient id="coral-anem" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.lilac} />
          <stop offset="100%" stopColor={C.blush} />
        </linearGradient>
        <linearGradient id="coral-kelp" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1c8f6a" />
          <stop offset="100%" stopColor={C.teal} />
        </linearGradient>
        <filter id="coral-mottle" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComponentTransfer in="g" result="a">
            <feFuncA type="linear" slope="0.14" intercept="0" />
          </feComponentTransfer>
          <feComposite in="a" in2="SourceGraphic" operator="in" result="tex" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="tex" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#coral-mottle)">
        {clusters.map((cl, i) => {
          const Shape = ORGANISMS[cl.species];
          const x = (cl.left / 100) * 1000;
          const s = cl.scale;
          return (
            <g key={i} transform={`translate(${x.toFixed(1)}, 100) scale(${s.toFixed(2)}) translate(-33, -96)`}>
              <Shape delay={cl.delay} sway={cl.sway} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default function Coral() {
  const back: Cluster[] = [
    { species: 'brain', left: 8, scale: 1.5, delay: 0, sway: 1 },
    { species: 'fan', left: 26, scale: 1.7, delay: 1.4, sway: 2 },
    { species: 'kelp', left: 44, scale: 1.9, delay: 0.6, sway: 3.2 },
    { species: 'staghorn', left: 63, scale: 1.6, delay: 2.1, sway: 1.8 },
    { species: 'fan', left: 82, scale: 1.7, delay: 0.9, sway: 2 },
    { species: 'brain', left: 95, scale: 1.5, delay: 1.7, sway: 1 },
  ];

  const mid: Cluster[] = [
    { species: 'tube', left: 4, scale: 1.15, delay: 1.1, sway: 1.6 },
    { species: 'anemone', left: 18, scale: 1.05, delay: 0.3, sway: 3.2 },
    { species: 'staghorn', left: 33, scale: 1.2, delay: 2.0, sway: 2 },
    { species: 'kelp', left: 50, scale: 1.25, delay: 0.7, sway: 3.8 },
    { species: 'fan', left: 66, scale: 1.15, delay: 1.6, sway: 2.4 },
    { species: 'tube', left: 80, scale: 1.1, delay: 0.5, sway: 1.6 },
    { species: 'anemone', left: 93, scale: 1.05, delay: 2.3, sway: 3.2 },
  ];

  const front: Cluster[] = [
    { species: 'anemone', left: 10, scale: 0.82, delay: 0.4, sway: 4 },
    { species: 'staghorn', left: 24, scale: 0.9, delay: 1.3, sway: 2.6 },
    { species: 'brain', left: 40, scale: 0.85, delay: 0.2, sway: 1.4 },
    { species: 'tube', left: 56, scale: 0.88, delay: 1.9, sway: 2 },
    { species: 'anemone', left: 72, scale: 0.82, delay: 0.9, sway: 4.2 },
    { species: 'staghorn', left: 88, scale: 0.9, delay: 1.5, sway: 2.6 },
  ];

  return (
    <div className="coral-row" aria-hidden="true">
      <CoralPlane className="coral-plane--back" translateY={14} clusters={back} />
      <CoralPlane className="coral-plane--mid" translateY={6} clusters={mid} />
      <CoralPlane className="coral-plane--front" translateY={0} clusters={front} />
    </div>
  );
}
