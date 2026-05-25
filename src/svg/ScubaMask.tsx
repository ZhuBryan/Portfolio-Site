interface ScubaMaskProps {
  width?: number;
  height?: number;
}

/**
 * Scuba mask doubling as a VR goggle (Reality Labs reference).
 * Used as the static preview in the mask-transition section; later this
 * SVG will be reused in the full-viewport scroll-driven animation.
 */
export default function ScubaMask({ width = 120, height = 80 }: ScubaMaskProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="110"
        height="55"
        rx="14"
        fill="none"
        stroke="rgba(78,203,160,0.5)"
        strokeWidth="3"
      />
      <rect
        x="10"
        y="14"
        width="40"
        height="47"
        rx="11"
        fill="rgba(14,180,120,0.08)"
        stroke="rgba(78,203,160,0.3)"
        strokeWidth="1.5"
      />
      <rect
        x="70"
        y="14"
        width="40"
        height="47"
        rx="11"
        fill="rgba(14,180,120,0.08)"
        stroke="rgba(78,203,160,0.3)"
        strokeWidth="1.5"
      />
      <line
        x1="55"
        y1="22"
        x2="65"
        y2="22"
        stroke="rgba(78,203,160,0.4)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="30"
        x2="5"
        y2="30"
        stroke="rgba(78,203,160,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="115"
        y1="30"
        x2="118"
        y2="30"
        stroke="rgba(78,203,160,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse
        cx="30"
        cy="38"
        rx="12"
        ry="9"
        fill="rgba(78,203,160,0.12)"
        stroke="rgba(78,203,160,0.2)"
        strokeWidth="0.5"
      />
      <ellipse
        cx="90"
        cy="38"
        rx="12"
        ry="9"
        fill="rgba(78,203,160,0.12)"
        stroke="rgba(78,203,160,0.2)"
        strokeWidth="0.5"
      />
      <text x="30" y="42" textAnchor="middle" fill="rgba(78,203,160,0.5)" fontSize="8" fontFamily="DM Sans">
        AR
      </text>
      <text x="90" y="42" textAnchor="middle" fill="rgba(78,203,160,0.5)" fontSize="8" fontFamily="DM Sans">
        ML
      </text>
      <circle cx="22" cy="15" r="3" fill="none" stroke="rgba(78,203,160,0.6)" strokeWidth="1" />
      <circle cx="98" cy="15" r="3" fill="none" stroke="rgba(78,203,160,0.6)" strokeWidth="1" />
    </svg>
  );
}
