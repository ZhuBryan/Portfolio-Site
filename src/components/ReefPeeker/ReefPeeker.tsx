import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { usePeekerBehavior, MAX_TILT, MAX_PUPIL, type PeekerLook } from './peekerBehavior';
import './ReefPeeker.css';

/**
 * ReefPeeker — a shy octopus peeking over the coral at the bottom of the
 * Projects section. Its head looks toward your cursor and the pupils track it,
 * so it genuinely watches you browse. Get too close and it ducks behind the
 * coral; back off and it cautiously resurfaces.
 *
 * Two visuals, identical behaviour (shared usePeekerBehavior):
 *   • a hand-drawn SVG octopus (the always-available fallback), and
 *   • a real 3D GLB model (/models/octopus.glb) rendered in a tiny lazy-loaded
 *     R3F canvas — an own chunk that keeps three out of the main bundle.
 * On mount we HEAD-fetch the GLB; only if it's actually present (and not an
 * SPA index.html) do we swap in the 3D peeker. Absent → the SVG stays, zero
 * breakage.
 *
 * Engine rules shared with the other creatures: rAF loop writing transforms
 * directly (no React state per frame), listeners on the parent section, pauses
 * off-screen, desktop/hover/no-reduced-motion gate, pointer-events none,
 * aria-hidden.
 */

const GATE = '(min-width: 768px) and (hover: hover) and (prefers-reduced-motion: no-preference)';
const MODEL_URL = '/models/octopus.glb';

const Peeker3D = lazy(() => import('./ReefPeeker3D'));

export default function ReefPeeker() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(GATE);
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  if (!enabled) return null;
  return <PeekerSwitch />;
}

/** Renders the SVG peeker until the GLB is confirmed available, then the 3D one. */
function PeekerSwitch() {
  const [has3D, setHas3D] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(MODEL_URL, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') ?? '';
        if (alive && r.ok && !type.includes('text/html')) setHas3D(true);
      })
      .catch(() => {
        /* absent or blocked → keep the SVG fallback */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!has3D) return <PeekerSVG />;
  return (
    <Suspense fallback={<PeekerSVG />}>
      <Peeker3D />
    </Suspense>
  );
}

function PeekerSVG() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const look = useRef<PeekerLook>({ x: 0, y: 0 });

  usePeekerBehavior(wrapRef, look, (l) => {
    const head = headRef.current;
    const pupils = pupilsRef.current;
    if (head) {
      head.style.transform = `rotateY(${(l.x * MAX_TILT).toFixed(2)}deg) rotateX(${(-l.y * MAX_TILT).toFixed(2)}deg)`;
    }
    if (pupils) {
      pupils.style.transform = `translate(${(l.x * MAX_PUPIL).toFixed(2)}px, ${(l.y * MAX_PUPIL).toFixed(2)}px)`;
    }
  });

  return (
    <div ref={wrapRef} className="reef-peeker" aria-hidden="true">
      <svg viewBox="0 0 120 96" width="120" height="96" className="reef-peeker__svg">
        <g ref={headRef} className="reef-peeker__head">
          {/* tentacle tips curling over the coral edge */}
          <path d="M18 96 q-2 -14 6 -18 q10 -5 12 4 q1 6 -5 7 q5 2 4 7z" fill="#b58fd6" />
          <path d="M92 96 q3 -12 -4 -17 q-9 -6 -12 2 q-2 6 4 8 q-6 1 -5 7z" fill="#b58fd6" />
          {/* head dome */}
          <path
            d="M60 12 C36 12 24 32 24 52 C24 76 36 92 42 96 L78 96 C84 92 96 76 96 52 C96 32 84 12 60 12 Z"
            fill="#c9a2e8"
            stroke="#8f5fb8"
            strokeWidth="2.5"
          />
          {/* mottled spots */}
          <g fill="#b58fd6" opacity="0.65">
            <circle cx="44" cy="30" r="3.4" />
            <circle cx="72" cy="24" r="2.6" />
            <circle cx="82" cy="42" r="3" />
            <circle cx="38" cy="48" r="2.4" />
          </g>
          {/* eyes */}
          <g>
            <circle cx="46" cy="58" r="11" fill="#fffdf6" stroke="#8f5fb8" strokeWidth="2" />
            <circle cx="74" cy="58" r="11" fill="#fffdf6" stroke="#8f5fb8" strokeWidth="2" />
            <g ref={pupilsRef}>
              <circle cx="46" cy="59" r="4.6" fill="#241436" />
              <circle cx="74" cy="59" r="4.6" fill="#241436" />
              <circle cx="44.4" cy="57.2" r="1.5" fill="#fff" opacity="0.9" />
              <circle cx="72.4" cy="57.2" r="1.5" fill="#fff" opacity="0.9" />
            </g>
            {/* eyelids — blink via CSS scaleY */}
            <rect className="reef-peeker__lid" x="34" y="46" width="24" height="24" rx="12" fill="#c9a2e8" />
            <rect className="reef-peeker__lid reef-peeker__lid--r" x="62" y="46" width="24" height="24" rx="12" fill="#c9a2e8" />
          </g>
        </g>
      </svg>
    </div>
  );
}
