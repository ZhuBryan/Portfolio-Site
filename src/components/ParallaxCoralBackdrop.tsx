import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import './ParallaxCoralBackdrop.css';

interface ParallaxCoralBackdropProps {
  tone?: 'teal' | 'blue' | 'amber';
  density?: 'quiet' | 'normal';
}

const TONE_CLASS = {
  teal: 'parallax-coral-backdrop--teal',
  blue: 'parallax-coral-backdrop--blue',
  amber: 'parallax-coral-backdrop--amber',
};

export default function ParallaxCoralBackdrop({
  tone = 'teal',
  density = 'normal',
}: ParallaxCoralBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const slowY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [36, -36]);
  const fastY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [68, -68]);
  const driftX = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-10, 10]);

  return (
    <div
      ref={ref}
      className={`parallax-coral-backdrop ${TONE_CLASS[tone]} ${
        density === 'quiet' ? 'parallax-coral-backdrop--quiet' : ''
      }`}
      aria-hidden="true"
    >
      <motion.svg
        className="parallax-coral parallax-coral--left"
        viewBox="0 0 180 240"
        style={{ y: slowY, x: driftX }}
      >
        <path d="M88 240 C88 202 78 176 61 146 C42 112 34 76 50 34" />
        <path d="M88 206 C62 182 38 170 22 142 C12 124 10 104 20 88" />
        <path d="M88 196 C114 172 132 150 134 116 C136 88 124 66 104 50" />
        <path d="M84 168 C106 148 116 126 112 104" />
        <circle cx="50" cy="34" r="10" />
        <circle cx="20" cy="88" r="8" />
        <circle cx="104" cy="50" r="9" />
        <circle cx="112" cy="104" r="6" />
      </motion.svg>

      <motion.svg
        className="parallax-coral parallax-coral--right"
        viewBox="0 0 220 260"
        style={{ y: fastY }}
      >
        <path d="M118 260 C118 216 128 184 150 148 C172 112 178 78 164 36" />
        <path d="M118 224 C95 198 78 174 80 134 C82 104 98 78 122 60" />
        <path d="M120 210 C148 188 174 174 196 146 C210 128 214 108 204 88" />
        <path d="M132 176 C112 154 106 130 116 108" />
        <circle cx="164" cy="36" r="11" />
        <circle cx="122" cy="60" r="8" />
        <circle cx="204" cy="88" r="9" />
        <circle cx="116" cy="108" r="6" />
      </motion.svg>

      <motion.svg
        className="parallax-coral parallax-coral--floor"
        viewBox="0 0 760 160"
        preserveAspectRatio="none"
        style={{ y: slowY }}
      >
        <path d="M0 132 C70 96 118 126 172 82 C214 48 252 70 286 116 C336 76 392 92 438 128 C486 80 530 58 586 98 C636 132 682 104 760 84 L760 160 L0 160 Z" />
      </motion.svg>
    </div>
  );
}
