import './OscillatingWave.css';

/**
 * The rolling threshold between sky and sea at the bottom of the hero.
 *
 * Construction notes (this is the part that keeps the frame seamless):
 *  - One wave period spans x = 0..1440. The SVG draws the SAME period twice
 *    (0..1440 and 1440..2880) and the layer is exactly 200% wide, so the
 *    translateX(-50%) loop wraps onto an identical copy — no visible seam.
 *  - The white foam crest is a stroked path INSIDE the same SVG, sharing the
 *    same transform as the water fill, so foam and water can never drift
 *    apart or mismatch the frame.
 *  - preserveAspectRatio="none" stretches each layer to the container, so
 *    the band always spans the full viewport width at any screen size.
 */
const CREST =
  'M0,80 C120,34 240,34 360,80 C480,126 600,126 720,80 C840,34 960,34 1080,80 C1200,126 1320,126 1440,80 ' +
  'C1560,34 1680,34 1800,80 C1920,126 2040,126 2160,80 C2280,34 2400,34 2520,80 C2640,126 2760,126 2880,80';

function WaveLayer({ className, foam }: { className: string; foam?: boolean }) {
  return (
    <div className={`osc-wave__layer ${className}`}>
      <svg
        viewBox="0 0 2880 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d={`${CREST} L2880,180 L0,180 Z`} className="osc-wave__fill" />
        {foam && <path d={CREST} className="osc-wave__foam" />}
      </svg>
    </div>
  );
}

export default function OscillatingWave() {
  return (
    <div className="osc-wave" aria-hidden="true">
      <WaveLayer className="osc-wave__layer--back" />
      <WaveLayer className="osc-wave__layer--mid" />
      <WaveLayer className="osc-wave__layer--front" foam />
    </div>
  );
}
