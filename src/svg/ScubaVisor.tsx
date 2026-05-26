/**
 * Cinematic single-lens dive mask.
 *
 * Important: this used to be a dual-lens visor (two cutouts at 30% / 70%
 * of the width). When that design was scaled up to engulf the viewport,
 * the two lens centers spread apart faster than the screen and the user
 * only ever saw the dark rubber between the lenses — they never actually
 * looked "through" the mask.
 *
 * This redesign uses ONE big oval lens centered in the SVG. As the
 * visor scales up, the lens itself becomes the window, and the rubber
 * rim covers the screen edges — the exact feeling of putting a dive
 * mask onto your face.
 */
export default function ScubaVisor() {
  return (
    <svg
      viewBox="0 0 480 240"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        {/* One big lens cutout — frameless dive mask silhouette. */}
        <mask id="visor-cutout">
          <rect width="480" height="240" fill="white" />
          <ellipse cx="240" cy="120" rx="200" ry="94" fill="black" />
        </mask>

        {/* Rubber body shading */}
        <radialGradient id="visor-body" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#0a1424" />
          <stop offset="55%" stopColor="#050d18" />
          <stop offset="100%" stopColor="#01060e" />
        </radialGradient>

        {/* Bioluminescent rim gradient */}
        <linearGradient id="visor-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7be8c4" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#4ecba0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1aaf7a" stopOpacity="0.25" />
        </linearGradient>

        {/* Soft inner glow on the lens window */}
        <radialGradient id="lens-haze" cx="50%" cy="48%" r="65%">
          <stop offset="0%" stopColor="rgba(123,232,196,0.04)" />
          <stop offset="100%" stopColor="rgba(123,232,196,0)" />
        </radialGradient>
      </defs>

      {/* Rubber body with the single lens cutout */}
      <g mask="url(#visor-cutout)">
        <path
          d="M 6,120 C 6,38 96,8 240,8 C 384,8 474,38 474,120 C 474,202 384,232 240,232 C 96,232 6,202 6,120 Z"
          fill="url(#visor-body)"
        />
        {/* Top highlight — light bouncing off the rubber */}
        <path
          d="M 70,28 C 130,18 190,12 240,12 C 290,12 350,18 410,30"
          fill="none"
          stroke="rgba(123,232,196,0.22)"
          strokeWidth="1.5"
        />
        {/* Dark inner shadow ring — gives the rubber depth around the lens */}
        <ellipse
          cx="240"
          cy="120"
          rx="208"
          ry="100"
          fill="none"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="8"
        />
        {/* Bottom seal highlight */}
        <path
          d="M 80,210 C 140,222 200,228 240,228 C 280,228 340,222 400,210"
          fill="none"
          stroke="rgba(78,203,160,0.12)"
          strokeWidth="1"
        />
      </g>

      {/* Bioluminescent rim around the lens (glows even at big scales) */}
      <ellipse
        cx="240"
        cy="120"
        rx="200"
        ry="94"
        fill="none"
        stroke="url(#visor-rim)"
        strokeWidth="1.8"
      />
      {/* Very faint inner lens tint */}
      <ellipse cx="240" cy="120" rx="198" ry="92" fill="url(#lens-haze)" />

      {/* HUD reticle inside the lens */}
      <line
        x1="240"
        y1="40"
        x2="240"
        y2="56"
        stroke="rgba(123,232,196,0.55)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="240"
        y1="184"
        x2="240"
        y2="200"
        stroke="rgba(123,232,196,0.55)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="120"
        x2="62"
        y2="120"
        stroke="rgba(123,232,196,0.55)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="418"
        y1="120"
        x2="434"
        y2="120"
        stroke="rgba(123,232,196,0.55)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="240" cy="120" r="3" fill="#7be8c4" opacity="0.85" />
      <circle cx="240" cy="120" r="9" fill="none" stroke="rgba(123,232,196,0.4)" strokeWidth="0.6" />

      {/* AR / ML lens labels — only visible while the mask is small */}
      <text
        x="84"
        y="124"
        textAnchor="middle"
        fill="rgba(123,232,196,0.55)"
        fontSize="11"
        fontFamily="ui-monospace, monospace"
        letterSpacing="3"
      >
        AR
      </text>
      <text
        x="396"
        y="124"
        textAnchor="middle"
        fill="rgba(123,232,196,0.55)"
        fontSize="11"
        fontFamily="ui-monospace, monospace"
        letterSpacing="3"
      >
        ML
      </text>

      {/* Strap clips */}
      <rect x="0" y="106" width="14" height="28" rx="2.5" fill="#040a14" />
      <rect x="466" y="106" width="14" height="28" rx="2.5" fill="#040a14" />
      <line x1="3" y1="113" x2="11" y2="113" stroke="rgba(78,203,160,0.4)" strokeWidth="1" />
      <line x1="3" y1="127" x2="11" y2="127" stroke="rgba(78,203,160,0.4)" strokeWidth="1" />
      <line x1="469" y1="113" x2="477" y2="113" stroke="rgba(78,203,160,0.4)" strokeWidth="1" />
      <line x1="469" y1="127" x2="477" y2="127" stroke="rgba(78,203,160,0.4)" strokeWidth="1" />

      {/* Outer halo */}
      <path
        d="M 6,120 C 6,38 96,8 240,8 C 384,8 474,38 474,120 C 474,202 384,232 240,232 C 96,232 6,202 6,120 Z"
        fill="none"
        stroke="rgba(123,232,196,0.32)"
        strokeWidth="1"
      />
    </svg>
  );
}
