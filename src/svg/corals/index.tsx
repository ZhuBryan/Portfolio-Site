/**
 * Each coral is a unique organic shape that "grows" up out of the card.
 * They share the same 120×64 viewBox and bottom anchor point (60,64) so
 * they all slot consistently above their CoralCard body.
 *
 * Visual layering:
 *   - The <svg> root carries `organic-coral` which applies the global
 *     #underwater-current displacement filter + gentle sway animation.
 *   - The most prominent buds carry `coral-polyp` + `pulse-slow|pulse-fast`
 *     so they shimmer at slightly offset cadences. Smaller side polyps just
 *     get `coral-polyp` and read as ambient sparkles.
 */

const ORGANIC = 'organic-coral';
const POLYP = 'coral-polyp';
const PULSE_SLOW = `${POLYP} pulse-slow`;
const PULSE_FAST = `${POLYP} pulse-fast`;

export function VantageCoral() {
  return (
    <svg
      width="120"
      height="64"
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      className={ORGANIC}
      aria-hidden="true"
    >
      <path
        d="M60,64 C60,52 58,44 54,36 C50,28 44,24 44,16 C44,10 47,6 50,4"
        fill="none"
        stroke="#1aaf7a"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M60,64 C60,52 62,42 66,34 C70,26 76,22 74,14 C73,10 70,7 68,5"
        fill="none"
        stroke="#1aaf7a"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M60,64 C60,56 60,46 60,36"
        fill="none"
        stroke="#0d8a5e"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <ellipse cx="50" cy="4" rx="5" ry="4" fill="#1aaf7a" opacity="0.85" className={PULSE_SLOW} />
      <ellipse cx="68" cy="5" rx="4" ry="3.5" fill="#1aaf7a" opacity="0.7" className={PULSE_FAST} />
      <ellipse cx="44" cy="16" rx="4" ry="3" fill="#0d8a5e" opacity="0.6" className={POLYP} />
      <ellipse cx="74" cy="14" rx="3.5" ry="3" fill="#0d8a5e" opacity="0.5" className={POLYP} />
      <circle cx="54" cy="36" r="2.5" fill="#4ecba0" opacity="0.55" className={POLYP} />
      <circle cx="66" cy="34" r="2" fill="#4ecba0" opacity="0.45" className={POLYP} />
    </svg>
  );
}

export function HoneyKeyCoral() {
  return (
    <svg
      width="120"
      height="64"
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      className={ORGANIC}
      aria-hidden="true"
    >
      <path
        d="M60,64 L60,30"
        fill="none"
        stroke="#b87820"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M60,44 L50,32 L44,20 M44,20 C42,16 40,12 42,9 C44,6 47,6 49,8"
        fill="none"
        stroke="#c8a830"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M60,38 L70,26 L76,14 M76,14 C78,10 80,8 78,5 C76,3 73,4 72,7"
        fill="none"
        stroke="#c8a830"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <ellipse cx="42" cy="9" rx="4.5" ry="3.5" fill="#c8a830" opacity="0.8" className={PULSE_SLOW} />
      <ellipse cx="72" cy="7" rx="4" ry="3.5" fill="#c8a830" opacity="0.65" className={PULSE_FAST} />
      <circle cx="44" cy="20" r="2" fill="#e0c060" opacity="0.5" className={POLYP} />
      <circle cx="76" cy="14" r="2" fill="#e0c060" opacity="0.5" className={POLYP} />
    </svg>
  );
}

export function InvestHerCoral() {
  return (
    <svg
      width="120"
      height="64"
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      className={ORGANIC}
      aria-hidden="true"
    >
      <path
        d="M60,64 C60,56 58,48 56,40 C54,32 52,26 54,18 C55,12 58,8 60,6"
        fill="none"
        stroke="#5070c0"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M60,64 C60,56 64,46 68,38 C72,30 76,24 74,16 C73,11 70,7 68,5"
        fill="none"
        stroke="#6080c8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M58,40 C54,36 46,36 42,32 C40,30 40,26 43,24"
        fill="none"
        stroke="#6080c8"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M64,32 C68,28 76,28 80,24 C82,22 82,18 79,16"
        fill="none"
        stroke="#5070c0"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.45"
      />
      <ellipse cx="60" cy="6" rx="5" ry="4" fill="#6080c8" opacity="0.8" className={PULSE_SLOW} />
      <ellipse cx="68" cy="5" rx="4" ry="3.5" fill="#5070c0" opacity="0.65" className={PULSE_FAST} />
      <ellipse cx="43" cy="24" rx="3.5" ry="3" fill="#6080c8" opacity="0.6" className={POLYP} />
      <ellipse cx="79" cy="16" rx="3.5" ry="3" fill="#5070c0" opacity="0.55" className={POLYP} />
    </svg>
  );
}

export function InstrumentCoral() {
  return (
    <svg
      width="120"
      height="64"
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      className={ORGANIC}
      aria-hidden="true"
    >
      <path
        d="M60,64 L60,28"
        fill="none"
        stroke="#8050a8"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M60,48 C56,42 48,40 44,34 C41,29 42,24 45,21"
        fill="none"
        stroke="#a060c8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M60,42 C64,36 72,34 76,28 C79,23 78,18 75,15"
        fill="none"
        stroke="#9050b8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M60,34 C56,28 52,22 54,14 C55,9 58,6 60,4"
        fill="none"
        stroke="#b070d8"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      <ellipse cx="45" cy="21" rx="4.5" ry="3.5" fill="#a060c8" opacity="0.8" className={PULSE_SLOW} />
      <ellipse cx="75" cy="15" rx="4" ry="3.5" fill="#9050b8" opacity="0.75" className={PULSE_FAST} />
      <ellipse cx="60" cy="4" rx="4" ry="3.5" fill="#b070d8" opacity="0.7" className={PULSE_SLOW} />
      <circle cx="44" cy="34" r="2.5" fill="#c090e0" opacity="0.5" className={POLYP} />
      <circle cx="76" cy="28" r="2.5" fill="#c090e0" opacity="0.45" className={POLYP} />
    </svg>
  );
}

/**
 * BoxBots Skee-ball — a "circuit fan" coral evoking branching wires + nodes,
 * referencing the multi-Arduino I2C system.
 */
export function BoxBotsCoral() {
  return (
    <svg
      width="120"
      height="64"
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      className={ORGANIC}
      aria-hidden="true"
    >
      <path
        d="M60,64 L60,36"
        fill="none"
        stroke="#0d8a5e"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M60,46 L50,38 L42,30 L36,18"
        fill="none"
        stroke="#1aaf7a"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M60,46 L70,38 L78,30 L84,18"
        fill="none"
        stroke="#1aaf7a"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M60,36 L60,10"
        fill="none"
        stroke="#4ecba0"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="36" cy="18" r="3.5" fill="#1aaf7a" opacity="0.9" className={PULSE_SLOW} />
      <circle cx="84" cy="18" r="3.5" fill="#1aaf7a" opacity="0.9" className={PULSE_FAST} />
      <circle cx="60" cy="10" r="4" fill="#4ecba0" opacity="0.85" className={PULSE_SLOW} />
      <circle cx="42" cy="30" r="2" fill="#4ecba0" opacity="0.55" className={POLYP} />
      <circle cx="78" cy="30" r="2" fill="#4ecba0" opacity="0.55" className={POLYP} />
    </svg>
  );
}
