import { Suspense, lazy } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import type { PointerEvent } from 'react';
import SectionLabel from '../../components/SectionLabel';
import BubbleParticles from '../../components/BubbleParticles';
import ParallaxCoralBackdrop from '../../components/ParallaxCoralBackdrop';
import Turtle from '../../svg/Turtle';
import MessageBottleIcon from '../../svg/MessageBottleIcon';
import './About.css';

/**
 * Three.js + R3F together weigh ~600 KB gzipped. We lazy-load the 3D mascot
 * so it streams in after the initial paint instead of blocking it. The 2D
 * SVG turtle is the Suspense fallback so the section always has *something*
 * in that slot, even before the chunk arrives.
 */
const TurtleMascot3D = lazy(() => import('../../components/TurtleMascot3D/TurtleMascot3D'));

export default function About() {
  const shouldReduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 18, mass: 0.35 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 18, mass: 0.35 });
  const turtleX = useTransform(springX, [-1, 1], shouldReduceMotion ? [0, 0] : [-6, 6]);
  const turtleY = useTransform(springY, [-1, 1], shouldReduceMotion ? [0, 0] : [-4, 4]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    pointerX.set(Math.max(-1, Math.min(1, (event.clientX - centerX) / (rect.width / 2))));
    pointerY.set(Math.max(-1, Math.min(1, (event.clientY - centerY) / (rect.height / 2))));
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      className="about-section"
      id="about"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <ParallaxCoralBackdrop tone="teal" density="quiet" />
      <BubbleParticles count={6} />
      <SectionLabel>About</SectionLabel>
      <div className="about-inner">
        <div className="about-text">
          <p>
            CS student at <span>Waterloo</span> (4.0 GPA) who builds things at the intersection
            of <span>AI, machine learning, and finance</span>. Currently leading AR/VR gesture
            recognition at <span>Waterloo Reality Labs</span>. Obsessive hackathon builder — I
            like hard problems, elegant systems, and the occasional turtle.
          </p>
          <button className="msg-bottle" type="button">
            <MessageBottleIcon />
            message in a bottle →
          </button>
        </div>
        <motion.div
          className="about-turtle3d"
          style={{ x: turtleX, y: turtleY }}
          aria-hidden="true"
        >
          <Suspense
            fallback={
              <div className="about-turtle-fallback">
                <Turtle size={120} />
              </div>
            }
          >
            <TurtleMascot3D height={220} showHud />
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
}
