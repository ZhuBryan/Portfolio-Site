interface WaterSurfaceProps {
  showScrollHint?: boolean;
}

/**
 * The waterline at the bottom of the hero. Three stacked paths simulate
 * gentle wave depth, with an optional "scroll to dive in" hint baked in.
 */
export default function WaterSurface({ showScrollHint = true }: WaterSurfaceProps) {
  return (
    <svg
      className="water-surface"
      viewBox="0 0 660 120"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="water-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2a3a" stopOpacity="0" />
          <stop offset="100%" stopColor="#0a2a3a" stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Background large wave */}
      <path
        d="M0,40 C110,80 220,-20 330,40 C440,100 550,0 660,40 L660,120 L0,120 Z"
        fill="url(#water-fill)"
        opacity="0.6"
      >
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="
            M0,40 C110,80 220,-20 330,40 C440,100 550,0 660,40 L660,120 L0,120 Z;
            M0,50 C110,-10 220,90 330,50 C440,-10 550,90 660,50 L660,120 L0,120 Z;
            M0,40 C110,80 220,-20 330,40 C440,100 550,0 660,40 L660,120 L0,120 Z
          "
        />
      </path>
      {/* Foreground crisp cartoon wave */}
      <path
        d="M0,60 C130,120 200,-10 330,60 C460,130 530,-10 660,60 L660,120 L0,120 Z"
        fill="#0a2a3a"
        opacity="0.9"
      />
      {/* White foam crest line */}
      <path
        d="M0,60 C130,120 200,-10 330,60 C460,130 530,-10 660,60"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      {showScrollHint && (
        <text
          x="50%"
          y="100"
          textAnchor="middle"
          fill="rgba(78,203,160,0.8)"
          fontSize="12"
          fontFamily="DM Sans, sans-serif"
          fontStyle="italic"
          fontWeight="bold"
          letterSpacing="2"
        >
          scroll to dive in ↓
        </text>
      )}
    </svg>
  );
}
