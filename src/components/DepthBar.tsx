interface DepthBarProps {
  ticks?: number;
  opacity?: number;
}

export default function DepthBar({ ticks = 4, opacity = 1 }: DepthBarProps) {
  return (
    <div className="depth-bar" style={{ opacity }} aria-hidden="true">
      {Array.from({ length: ticks }).map((_, i) => (
        <div key={i} className="depth-tick" />
      ))}
    </div>
  );
}
