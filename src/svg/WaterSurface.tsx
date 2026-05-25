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
      viewBox="0 0 660 60"
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
      <path
        d="M0,20 C80,5 160,35 240,20 C320,5 400,35 480,18 C560,2 620,30 660,18 L660,60 L0,60 Z"
        fill="url(#water-fill)"
        opacity="0.5"
      >
        <animate
          attributeName="d"
          dur="9s"
          repeatCount="indefinite"
          values="
            M0,20 C80,5 160,35 240,20 C320,5 400,35 480,18 C560,2 620,30 660,18 L660,60 L0,60 Z;
            M0,22 C80,8 160,30 240,22 C320,8 400,32 480,22 C560,8 620,28 660,20 L660,60 L0,60 Z;
            M0,20 C80,5 160,35 240,20 C320,5 400,35 480,18 C560,2 620,30 660,18 L660,60 L0,60 Z"
        />
      </path>
      <path
        d="M0,30 C100,15 200,45 320,28 C440,12 540,38 660,26 L660,60 L0,60 Z"
        fill="#0a2a3a"
        opacity="0.9"
      />
      <path
        d="M0,30 C100,15 200,45 320,28 C440,12 540,38 660,26"
        fill="none"
        stroke="rgba(78,203,160,0.35)"
        strokeWidth="1.5"
      />
      {showScrollHint && (
        <text
          x="50%"
          y="50"
          textAnchor="middle"
          fill="rgba(78,203,160,0.5)"
          fontSize="9"
          fontFamily="DM Sans, sans-serif"
          letterSpacing="3"
        >
          scroll to dive in ↓
        </text>
      )}
    </svg>
  );
}
