import { useEffect, type MutableRefObject, type RefObject } from 'react';

/**
 * Shared engine for the ReefPeeker octopus — used by BOTH the SVG fallback and
 * the lazy-loaded 3D model, so the two visuals behave identically: the head
 * looks toward the cursor, and getting too close makes it duck behind the coral
 * (the wrapper's `is-hiding` translate), then it cautiously resurfaces.
 *
 * The hook owns a single rAF that eases a -1..1 look vector, toggles the hide
 * state, and pauses off-screen / on hidden tabs. It writes the eased look into
 * a shared ref (read by R3F's useFrame for the 3D model) and calls the optional
 * onFrame callback (used by the SVG version to write its head/pupil transforms).
 * No three/R3F imports live here, so importing it from the main bundle keeps
 * three out of the main chunk.
 */

export interface PeekerLook {
  x: number; // -1..1 horizontal look direction
  y: number; // -1..1 vertical look direction
}

export const MAX_TILT = 14; // deg (SVG head tilt magnitude)
export const MAX_PUPIL = 3.2; // px (SVG pupil offset)

const DUCK_AT = 140; // cursor closer than this → hide (roomier now the octopus is bigger)
const CALM_AT = 210; // cursor farther than this → start the resurface timer
const RESURFACE_MS = 1100;

export function usePeekerBehavior(
  wrapRef: RefObject<HTMLDivElement>,
  look: MutableRefObject<PeekerLook>,
  onFrame?: (look: PeekerLook) => void
) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const section = wrap?.closest('section');
    if (!wrap || !section) return;

    // targets (set by pointer events) and current values (eased in the loop)
    let tx = 0, ty = 0; // -1..1 look direction
    let cx = 0, cy = 0;
    let hidden = false;
    let resurfaceTimer = 0;

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const px = r.left + r.width / 2;
      const py = r.top + r.height * 0.55;
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      // look direction. Saturate far out (~700px) — the cursor usually roams
      // well away from the octopus's corner, and a short range pinned the
      // look at ±1 constantly, which read as "not tracking at all".
      tx = Math.max(-1, Math.min(1, dx / 700));
      ty = Math.max(-1, Math.min(1, dy / 700));

      const d = Math.hypot(dx, dy);
      if (!hidden && d < DUCK_AT) {
        hidden = true;
        wrap.classList.add('is-hiding');
        window.clearTimeout(resurfaceTimer);
      } else if (hidden && d > CALM_AT) {
        window.clearTimeout(resurfaceTimer);
        resurfaceTimer = window.setTimeout(() => {
          hidden = false;
          wrap.classList.remove('is-hiding');
        }, RESURFACE_MS);
      }
    };
    section.addEventListener('mousemove', onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);

    let raf = 0;
    const step = () => {
      raf = requestAnimationFrame(step);
      if (!visible || document.hidden) return;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      look.current.x = cx;
      look.current.y = cy;
      onFrame?.(look.current);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      section.removeEventListener('mousemove', onMove);
      window.clearTimeout(resurfaceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
