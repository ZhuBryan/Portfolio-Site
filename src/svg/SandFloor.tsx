/**
 * Soft undulating sand baseline that sits at the bottom of the projects
 * section. Stretches to fill its container width.
 */
export default function SandFloor() {
  return (
    <svg
      width="100%"
      height="18"
      viewBox="0 0 600 18"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', left: 0, top: 0 }}
      aria-hidden="true"
    >
      <path
        d="M0,10 C40,4 80,14 120,8 C160,2 200,12 240,7 C280,2 320,11 360,6 C400,1 440,12 480,7 C520,2 560,10 600,6 L600,18 L0,18 Z"
        fill="#0a1e30"
        opacity="0.8"
      />
    </svg>
  );
}
