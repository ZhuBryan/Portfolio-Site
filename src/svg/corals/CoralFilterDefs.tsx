/**
 * Global SVG filter definitions for the coral reef.
 *
 * Renders once at the top of the Projects section as a zero-sized hidden
 * SVG. Every coral SVG references these filters by id via CSS
 * (`filter: url(#underwater-current)`), so we pay for the filter graph once
 * and reuse it across all 5 corals.
 *
 * Two filters:
 *   #underwater-current — feTurbulence → feDisplacementMap with SMIL
 *     animations on both `baseFrequency` and `scale`. This is what makes
 *     the coral edges actually *ripple* over time instead of just sitting
 *     under a static distortion field.
 *   #coral-bloom — soft Gaussian blur + merge for the bioluminescent halo
 *     glow on hover/active corals.
 */
export default function CoralFilterDefs() {
  return (
    <svg className="coral-filter-defs" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="underwater-current"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.016 0.038"
            numOctaves="2"
            seed="3"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="22s"
              values="0.014 0.034; 0.022 0.048; 0.012 0.032; 0.018 0.042; 0.014 0.034"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          >
            <animate
              attributeName="scale"
              dur="7s"
              values="5; 9; 6.5; 10; 5"
              keyTimes="0; 0.25; 0.5; 0.75; 1"
              repeatCount="indefinite"
            />
          </feDisplacementMap>
        </filter>

        <filter id="coral-bloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
