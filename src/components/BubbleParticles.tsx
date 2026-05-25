import { useMemo } from 'react';

interface BubbleParticlesProps {
  count?: number;
  /** Restrict particles to a CSS-positioned container; defaults to fill parent. */
  className?: string;
}

interface Bubble {
  size: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

/**
 * Lightweight drifting bubble field. Renders purely with CSS keyframes so it
 * stays GPU-friendly even on lower-end devices. Pure-decorative, so aria-hidden.
 */
export default function BubbleParticles({ count = 8, className }: BubbleParticlesProps) {
  const bubbles = useMemo<Bubble[]>(
    () =>
      Array.from({ length: count }).map(() => ({
        size: 3 + Math.random() * 6,
        left: Math.random() * 100,
        top: 40 + Math.random() * 60,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 5,
      })),
    [count]
  );

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            top: `${b.top}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
