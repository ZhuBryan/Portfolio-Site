import './DriftLayer.css';

/**
 * Ambient drift — faint bioluminescent motes rising slowly behind a section.
 * Sits at z-index:-1 (above the section's gradient, below its content) and is
 * pointer-events:none, so it adds life to the deeper sections without touching
 * layout or interactivity. Deterministic so positions are stable.
 */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
const MOTES = (() => {
  const r = seeded(97);
  return Array.from({ length: 20 }, () => ({
    left: r() * 100,
    size: 2 + r() * 5,
    dur: 15 + r() * 16,
    delay: -r() * 32,
    dx: (r() * 2 - 1) * 44,
  }));
})();

export default function DriftLayer() {
  return (
    <div className="drift" aria-hidden="true">
      {MOTES.map((m, i) => (
        <span
          key={i}
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
            ['--dx' as string]: `${m.dx}px`,
          }}
        />
      ))}
    </div>
  );
}
