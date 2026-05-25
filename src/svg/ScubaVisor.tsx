/**
 * Cinematic scuba/VR visor — dual lens cutouts via SVG <mask> so the lens
 * areas are truly transparent. When this is scaled up to fill the viewport,
 * the dark rubber rim covers the screen and the two lens "holes" become
 * giant windows through which the underwater layer shows through.
 *
 * The viewBox aspect ratio is intentionally wide (400×220, ~1.82:1) so the
 * visor extends past the screen edges before the lens cutouts dominate.
 */
export default function ScubaVisor() {
  return (
    <svg
      viewBox="0 0 400 220"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        {/* white = opaque, black = transparent — so the lens regions punch out */}
        <mask id="visor-cutout">
          <rect width="400" height="220" fill="white" />
          <ellipse cx="120" cy="112" rx="78" ry="62" fill="black" />
          <ellipse cx="280" cy="112" rx="78" ry="62" fill="black" />
        </mask>

        {/* Soft inner shadow on the rubber sealing */}
        <radialGradient id="visor-body" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#0a1424" />
          <stop offset="55%" stopColor="#06101c" />
          <stop offset="100%" stopColor="#020812" />
        </radialGradient>

        {/* Bioluminescent rim glow */}
        <linearGradient id="visor-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ecba0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1aaf7a" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Visor body with two transparent lens cutouts */}
      <g mask="url(#visor-cutout)">
        <path
          d="M 18,110 C 18,42 96,18 200,18 C 304,18 382,42 382,110 C 382,178 312,202 200,202 C 88,202 18,178 18,110 Z"
          fill="url(#visor-body)"
        />
        {/* Subtle highlight along the top edge */}
        <path
          d="M 60,32 C 110,22 170,18 200,18 C 240,18 295,24 340,34"
          fill="none"
          stroke="rgba(78,203,160,0.18)"
          strokeWidth="1.5"
        />
      </g>

      {/* Bioluminescent rim around each lens */}
      <ellipse
        cx="120"
        cy="112"
        rx="78"
        ry="62"
        fill="none"
        stroke="url(#visor-rim)"
        strokeWidth="2"
      />
      <ellipse
        cx="280"
        cy="112"
        rx="78"
        ry="62"
        fill="none"
        stroke="url(#visor-rim)"
        strokeWidth="2"
      />

      {/* Lens inner glow — subtle teal cast */}
      <ellipse cx="120" cy="112" rx="76" ry="60" fill="rgba(78,203,160,0.04)" />
      <ellipse cx="280" cy="112" rx="76" ry="60" fill="rgba(78,203,160,0.04)" />

      {/* Bridge between lenses */}
      <line
        x1="200"
        y1="92"
        x2="200"
        y2="132"
        stroke="rgba(78,203,160,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="200" cy="112" r="3" fill="#4ecba0" opacity="0.7" />

      {/* HUD labels inside lenses (visible only while small) */}
      <text
        x="120"
        y="118"
        textAnchor="middle"
        fill="rgba(78,203,160,0.55)"
        fontSize="13"
        fontFamily="ui-monospace, monospace"
        letterSpacing="3"
      >
        AR
      </text>
      <text
        x="280"
        y="118"
        textAnchor="middle"
        fill="rgba(78,203,160,0.55)"
        fontSize="13"
        fontFamily="ui-monospace, monospace"
        letterSpacing="3"
      >
        ML
      </text>

      {/* Strap clips on the sides */}
      <rect x="0" y="98" width="22" height="28" rx="3" fill="#040a14" />
      <rect x="378" y="98" width="22" height="28" rx="3" fill="#040a14" />
      <line
        x1="6"
        y1="105"
        x2="16"
        y2="105"
        stroke="rgba(78,203,160,0.4)"
        strokeWidth="1"
      />
      <line
        x1="6"
        y1="119"
        x2="16"
        y2="119"
        stroke="rgba(78,203,160,0.4)"
        strokeWidth="1"
      />
      <line
        x1="384"
        y1="105"
        x2="394"
        y2="105"
        stroke="rgba(78,203,160,0.4)"
        strokeWidth="1"
      />
      <line
        x1="384"
        y1="119"
        x2="394"
        y2="119"
        stroke="rgba(78,203,160,0.4)"
        strokeWidth="1"
      />

      {/* Faint outer rim halo */}
      <path
        d="M 18,110 C 18,42 96,18 200,18 C 304,18 382,42 382,110 C 382,178 312,202 200,202 C 88,202 18,178 18,110 Z"
        fill="none"
        stroke="rgba(78,203,160,0.35)"
        strokeWidth="1.2"
      />
    </svg>
  );
}
