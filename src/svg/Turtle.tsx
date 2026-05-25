interface TurtleProps {
  size?: number;
}

/**
 * Friendly turtle mascot. Clean-line illustration that should feel charming
 * without being cartoonish. Used in About + Contact sections.
 */
export default function Turtle({ size = 64 }: TurtleProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="32" cy="34" rx="16" ry="12" fill="#1aaf7a" opacity="0.85" />
      <ellipse cx="32" cy="33" rx="12" ry="9" fill="#0d8a5e" />
      <path d="M22,26 C20,20 16,18 14,22 C12,26 16,30 20,28" fill="#1aaf7a" />
      <path d="M42,26 C44,20 48,18 50,22 C52,26 48,30 44,28" fill="#1aaf7a" />
      <path d="M22,40 C20,44 17,46 16,44 C15,42 18,38 21,38" fill="#1aaf7a" />
      <path d="M42,40 C44,44 47,46 48,44 C49,42 46,38 43,38" fill="#1aaf7a" />
      <ellipse cx="32" cy="26" rx="7" ry="6" fill="#1aaf7a" />
      <ellipse cx="32" cy="26" rx="5" ry="4" fill="#0d8a5e" />
      <circle cx="29" cy="24" r="1.5" fill="#e8f4f0" />
      <circle cx="35" cy="24" r="1.5" fill="#e8f4f0" />
      <circle cx="29" cy="24" r="0.7" fill="#0a1628" />
      <circle cx="35" cy="24" r="0.7" fill="#0a1628" />
      <path d="M32,46 C31,49 31,52 32,52 C33,52 33,49 32,46" fill="#1aaf7a" />
      <path
        d="M24,33 L26,31 M28,31 L30,29 M34,29 L36,31 M38,31 L40,33"
        stroke="#0d8a5e"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
