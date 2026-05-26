import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import './TurtleMascot3D.css';

/* ──────────────────────────────────────────────────────────────────────────
   Palette — pulled from the rest of the site's deep-sea token set so the
   3D scene reads as part of the same world.
   ────────────────────────────────────────────────────────────────────────── */
const COL_SHELL_TOP = '#1aaf7a';
const COL_SHELL_DARK = '#0d8a5e';
const COL_SHELL_RIM = '#0a5a3e';
const COL_SKIN = '#2bc28d';
const COL_EYE_PUPIL = '#0a1628';
const COL_GLOW = '#4ecba0';

const COL_MANTA_TOP = '#10314f';
const COL_MANTA_UNDER = '#2a5e85';
const COL_MANTA_STRIPE = '#7be8c4';

const COL_ANGLER_BODY = '#1a1430';
const COL_ANGLER_JAW = '#0c0820';
const COL_ANGLER_TEETH = '#e8f4f0';
const COL_LURE = '#ffd84a';

const COL_SQUID_MANTLE = '#7a2452';
const COL_SQUID_TENTACLE = '#b14a86';
const COL_SQUID_GLOW = '#ff7adf';

const COL_SHARK_BODY = '#1d3557';
const COL_SHARK_BELLY = '#456a85';
const COL_SHARK_EYE = '#ff5d5d';

const COL_JELLY = '#9b80e8';
const COL_JELLY_CORE = '#7be8c4';

/* ──────────────────────────────────────────────────────────────────────────
   Streamlined chibi sea-glider turtle.

   Replaces the previous stacked-sphere model. This one uses a flat
   hexagonal shell (6-segment cylinder + flatShading) for a deliberate
   low-poly look, a small boxy head, and paddle flippers that actually
   stroke. Compact silhouette so the surrounding ecosystem isn't pushed
   out of frame.
   ────────────────────────────────────────────────────────────────────────── */
function TurtleProcedural({ isHovered }: { isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const flLeft = useRef<THREE.Mesh>(null);
  const flRight = useRef<THREE.Mesh>(null);
  const blLeft = useRef<THREE.Mesh>(null);
  const blRight = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.06;
      groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.03;
      const yawTarget = state.pointer.x * 0.35;
      const pitchTarget = -state.pointer.y * 0.16;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        yawTarget,
        0.06
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        pitchTarget,
        0.06
      );
    }

    if (headRef.current) {
      const headY = state.pointer.x * 0.3;
      const headX = -state.pointer.y * 0.22;
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, headY, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, headX, 0.1);
    }

    const stroke = Math.sin(t * 2.4);
    const strokeOff = Math.sin(t * 2.4 + Math.PI);
    if (flLeft.current) flLeft.current.rotation.z = 0.25 + stroke * 0.4;
    if (flRight.current) flRight.current.rotation.z = -0.25 - stroke * 0.4;
    if (blLeft.current) blLeft.current.rotation.z = 0.15 + strokeOff * 0.25;
    if (blRight.current) blRight.current.rotation.z = -0.15 - strokeOff * 0.25;
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Hexagonal carapace — 6-segment cylinder + flatShading reads as
          deliberate low-poly geometry rather than a blob. */}
      <mesh position={[0, 0.08, 0]} scale={[1.05, 0.42, 1.3]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.62, 0.78, 1, 6, 1]} />
        <meshStandardMaterial color={COL_SHELL_TOP} roughness={0.55} flatShading />
      </mesh>
      {/* Spine ridge — a thin darker hex strip down the center */}
      <mesh position={[0, 0.32, 0]} scale={[0.4, 0.18, 1.25]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 1, 6, 1]} />
        <meshStandardMaterial color={COL_SHELL_DARK} roughness={0.5} flatShading />
      </mesh>
      {/* Lower rim plate — wider underbelly bevel */}
      <mesh position={[0, -0.12, 0]} scale={[1.12, 0.08, 1.35]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 1, 6, 1]} />
        <meshStandardMaterial color={COL_SHELL_RIM} roughness={0.6} flatShading />
      </mesh>

      {/* Head — rounded rectangle, attached at the shell's front edge */}
      <group ref={headRef} position={[0, 0.04, 0.85]}>
        <mesh scale={[0.34, 0.3, 0.42]}>
          <boxGeometry />
          <meshStandardMaterial color={COL_SKIN} roughness={0.6} flatShading />
        </mesh>
        {/* Eyes — small white sclera with dark pupils */}
        <mesh position={[-0.13, 0.06, 0.2]} scale={0.06}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#e8f4f0" roughness={0.3} />
        </mesh>
        <mesh position={[0.13, 0.06, 0.2]} scale={0.06}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#e8f4f0" roughness={0.3} />
        </mesh>
        <mesh position={[-0.13, 0.06, 0.24]} scale={0.03}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color={COL_EYE_PUPIL} />
        </mesh>
        <mesh position={[0.13, 0.06, 0.24]} scale={0.03}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color={COL_EYE_PUPIL} />
        </mesh>
      </group>

      {/* Front flippers — wide paddle wings angled outward */}
      <mesh
        ref={flLeft}
        position={[-0.78, 0, 0.32]}
        rotation={[0, 0.2, 0.25]}
        scale={[0.7, 0.06, 0.32]}
      >
        <boxGeometry />
        <meshStandardMaterial color={COL_SKIN} roughness={0.6} flatShading />
      </mesh>
      <mesh
        ref={flRight}
        position={[0.78, 0, 0.32]}
        rotation={[0, -0.2, -0.25]}
        scale={[0.7, 0.06, 0.32]}
      >
        <boxGeometry />
        <meshStandardMaterial color={COL_SKIN} roughness={0.6} flatShading />
      </mesh>
      {/* Rear flippers — smaller stabilizers */}
      <mesh
        ref={blLeft}
        position={[-0.6, -0.05, -0.55]}
        rotation={[0, -0.25, 0.15]}
        scale={[0.4, 0.05, 0.24]}
      >
        <boxGeometry />
        <meshStandardMaterial color={COL_SKIN} roughness={0.6} flatShading />
      </mesh>
      <mesh
        ref={blRight}
        position={[0.6, -0.05, -0.55]}
        rotation={[0, 0.25, -0.15]}
        scale={[0.4, 0.05, 0.24]}
      >
        <boxGeometry />
        <meshStandardMaterial color={COL_SKIN} roughness={0.6} flatShading />
      </mesh>

      {/* Tail nub */}
      <mesh position={[0, -0.05, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.25, 6]} />
        <meshStandardMaterial color={COL_SKIN} roughness={0.7} flatShading />
      </mesh>

      {/* Underside bioluminescent ring — pulses brighter on hover */}
      <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.58, 6]} />
        <meshBasicMaterial
          color={COL_GLOW}
          transparent
          opacity={isHovered ? 0.55 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Supporting cast.
   All species read R3F's `state.pointer` directly — one event source,
   zero prop drilling. Per-instance `phase` keeps animation cycles
   desynchronized so nothing looks cloned.
   ────────────────────────────────────────────────────────────────────────── */
interface CreatureProps {
  position: [number, number, number];
  scale?: number;
  phase?: number;
}

/* ── Bioluminescent manta ray — wide diamond, slow majestic wing flap. ─── */
function EcoManta({ position, scale = 1, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);
  const stripeRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;

    if (groupRef.current) {
      // Lean (bank) into the cursor's x — a manta tilts to turn
      const bank = state.pointer.x * 0.35;
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        bank,
        0.04
      );
      // Slight pitch toward cursor y
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -state.pointer.y * 0.18,
        0.05
      );
      // Gentle vertical glide
      groupRef.current.position.y = position[1] + Math.sin(t * 0.9) * 0.15;
    }

    // Slow, deep wing flap
    if (leftWing.current) leftWing.current.rotation.z = 0.05 + Math.sin(t * 1.3) * 0.35;
    if (rightWing.current) rightWing.current.rotation.z = -0.05 - Math.sin(t * 1.3) * 0.35;
    // Stripe brightness pulse
    if (stripeRef.current) {
      stripeRef.current.opacity = 0.55 + Math.sin(t * 1.6) * 0.25;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Central diamond body — squashed cone, 4-sided for sharp silhouette */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.18]}>
        <coneGeometry args={[0.42, 0.9, 4]} />
        <meshStandardMaterial color={COL_MANTA_TOP} roughness={0.45} flatShading />
      </mesh>
      {/* Lighter underbelly — second cone slightly below */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} scale={[0.92, 0.92, 0.1]}>
        <coneGeometry args={[0.42, 0.9, 4]} />
        <meshStandardMaterial color={COL_MANTA_UNDER} roughness={0.55} flatShading />
      </mesh>
      {/* Left wing — pivots at the body */}
      <group position={[-0.42, 0, 0]}>
        <mesh ref={leftWing} position={[-0.45, 0, 0]} scale={[0.95, 0.05, 0.55]}>
          <boxGeometry />
          <meshStandardMaterial color={COL_MANTA_TOP} roughness={0.5} flatShading />
        </mesh>
      </group>
      {/* Right wing */}
      <group position={[0.42, 0, 0]}>
        <mesh ref={rightWing} position={[0.45, 0, 0]} scale={[0.95, 0.05, 0.55]}>
          <boxGeometry />
          <meshStandardMaterial color={COL_MANTA_TOP} roughness={0.5} flatShading />
        </mesh>
      </group>
      {/* Cephalic lobes (head horns) */}
      <mesh position={[-0.1, 0.02, 0.42]} scale={[0.05, 0.05, 0.15]}>
        <boxGeometry />
        <meshStandardMaterial color={COL_MANTA_TOP} flatShading />
      </mesh>
      <mesh position={[0.1, 0.02, 0.42]} scale={[0.05, 0.05, 0.15]}>
        <boxGeometry />
        <meshStandardMaterial color={COL_MANTA_TOP} flatShading />
      </mesh>
      {/* Whip tail */}
      <mesh position={[0, -0.02, -0.55]} scale={[0.025, 0.025, 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color={COL_MANTA_TOP} />
      </mesh>
      {/* Bioluminescent stripe down the spine */}
      <mesh position={[0, 0.06, 0]} scale={[0.06, 0.005, 0.55]}>
        <boxGeometry />
        <meshBasicMaterial ref={stripeRef} color={COL_MANTA_STRIPE} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

/* ── Deep-sea anglerfish — bulky body, gaping toothy jaw, glowing lure. ── */
function EcoAngler({ position, scale = 0.7, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lureRef = useRef<THREE.Mesh>(null);
  const lureMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const antennaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;

    if (groupRef.current) {
      // Predator lock — snappy yaw + small pitch toward cursor
      const yaw = state.pointer.x * 0.55;
      const pitch = -state.pointer.y * 0.3;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, yaw, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pitch, 0.1);
      // Tiny lurking hover
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.06;
    }

    // Antenna sways slowly
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(t * 1.1) * 0.12;
      antennaRef.current.rotation.x = Math.sin(t * 0.8 + 1) * 0.08;
    }
    // Lure flickers and breathes
    if (lureRef.current) {
      const pulse = 0.85 + Math.sin(t * 3.2) * 0.2;
      lureRef.current.scale.setScalar(0.085 * pulse);
    }
    if (lureMatRef.current) {
      lureMatRef.current.opacity = 0.8 + Math.sin(t * 4.5) * 0.18;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Bulbous body — low-poly sphere for the iconic angler shape */}
      <mesh scale={[1, 1.05, 1.25]}>
        <sphereGeometry args={[0.42, 10, 8]} />
        <meshStandardMaterial color={COL_ANGLER_BODY} roughness={0.6} flatShading />
      </mesh>
      {/* Underbite jaw box */}
      <mesh position={[0, -0.18, 0.32]} scale={[0.38, 0.16, 0.28]}>
        <boxGeometry />
        <meshStandardMaterial color={COL_ANGLER_JAW} roughness={0.7} flatShading />
      </mesh>
      {/* Teeth — four tiny upward cones along the jaw line */}
      {[-0.12, -0.04, 0.04, 0.12].map((dx, i) => (
        <mesh key={i} position={[dx, -0.12, 0.46]} scale={[0.025, 0.06, 0.025]}>
          <coneGeometry args={[1, 1, 4]} />
          <meshBasicMaterial color={COL_ANGLER_TEETH} />
        </mesh>
      ))}
      {/* Glowing eyes — small, malevolent */}
      <mesh position={[0.14, 0.08, 0.32]} scale={0.04}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={COL_LURE} />
      </mesh>
      <mesh position={[-0.14, 0.08, 0.32]} scale={0.04}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={COL_LURE} />
      </mesh>
      {/* Antenna with the iconic esca (lure bulb) */}
      <group ref={antennaRef} position={[0, 0.4, 0.18]}>
        <mesh position={[0, 0.25, 0]} scale={[0.018, 0.5, 0.018]}>
          <boxGeometry />
          <meshStandardMaterial color={COL_ANGLER_BODY} />
        </mesh>
        <mesh ref={lureRef} position={[0, 0.52, 0]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial ref={lureMatRef} color={COL_LURE} transparent opacity={0.9} />
        </mesh>
      </group>
      {/* Small dorsal fin */}
      <mesh position={[0, 0.35, -0.1]} rotation={[-0.3, 0, 0]} scale={[0.04, 0.18, 0.2]}>
        <boxGeometry />
        <meshStandardMaterial color={COL_ANGLER_BODY} flatShading />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, 0, -0.55]} scale={[0.05, 0.28, 0.22]}>
        <boxGeometry />
        <meshStandardMaterial color={COL_ANGLER_BODY} flatShading />
      </mesh>
    </group>
  );
}

/* ── Jet-propelled squid — mantle + multi-segment tentacle ribbons. ────── */
function EcoSquid({ position, scale = 0.7, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tentaclesRef = useRef<THREE.Group>(null);
  const finLeftRef = useRef<THREE.Mesh>(null);
  const finRightRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;

    if (groupRef.current) {
      // Reactive turn — points its mantle at the cursor
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        state.pointer.x * 0.45,
        0.08
      );
      // Jet pulse — quick forward bursts every ~1.5s
      const jet = Math.sin(t * 4) * 0.12;
      groupRef.current.position.z = position[2] + jet;
      groupRef.current.position.y = position[1] + Math.sin(t * 1.4) * 0.08;
    }
    // Tentacle ribbon undulation
    if (tentaclesRef.current) {
      tentaclesRef.current.rotation.x = Math.sin(t * 3) * 0.18;
    }
    // Fin ripple
    if (finLeftRef.current) finLeftRef.current.rotation.z = 0.3 + Math.sin(t * 4) * 0.2;
    if (finRightRef.current) finRightRef.current.rotation.z = -0.3 - Math.sin(t * 4) * 0.2;
    // Mantle glow pulses with the jet
    if (glowRef.current) {
      const pulse = 0.75 + Math.sin(t * 4) * 0.2;
      glowRef.current.scale.setScalar(0.18 * pulse);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Mantle — elongated cone pointing forward (+z) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
        <coneGeometry args={[0.26, 0.95, 6]} />
        <meshStandardMaterial color={COL_SQUID_MANTLE} roughness={0.35} flatShading />
      </mesh>
      {/* Mantle hood ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.32]} scale={[1, 1, 0.06]}>
        <torusGeometry args={[0.25, 0.04, 6, 12]} />
        <meshStandardMaterial color={COL_SQUID_TENTACLE} flatShading />
      </mesh>
      {/* Triangular fins on either side of the mantle */}
      <mesh
        ref={finLeftRef}
        position={[-0.18, 0, 0.45]}
        rotation={[0, 0, 0.3]}
        scale={[0.04, 0.18, 0.22]}
      >
        <boxGeometry />
        <meshStandardMaterial color={COL_SQUID_TENTACLE} flatShading />
      </mesh>
      <mesh
        ref={finRightRef}
        position={[0.18, 0, 0.45]}
        rotation={[0, 0, -0.3]}
        scale={[0.04, 0.18, 0.22]}
      >
        <boxGeometry />
        <meshStandardMaterial color={COL_SQUID_TENTACLE} flatShading />
      </mesh>
      {/* Glowing eye */}
      <mesh position={[0.18, 0.06, 0.35]} scale={0.05}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={COL_SQUID_GLOW} />
      </mesh>
      <mesh position={[-0.18, 0.06, 0.35]} scale={0.05}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={COL_SQUID_GLOW} />
      </mesh>
      {/* Tentacle cluster — 6 ribbons fanning out from the rear opening */}
      <group ref={tentaclesRef} position={[0, 0, -0.4]}>
        {[
          [-0.16, 0.04, -0.05],
          [-0.08, -0.08, -0.05],
          [0, 0.06, -0.05],
          [0.08, -0.08, -0.05],
          [0.16, 0.04, -0.05],
          [0, -0.14, -0.05],
        ].map((p, i) => (
          <mesh
            key={i}
            position={p as [number, number, number]}
            rotation={[Math.PI / 2 + (i - 2.5) * 0.05, 0, (i - 2.5) * 0.1]}
            scale={[0.025, 0.55, 0.025]}
          >
            <boxGeometry />
            <meshStandardMaterial color={COL_SQUID_TENTACLE} flatShading />
          </mesh>
        ))}
      </group>
      {/* Inner mantle bioluminescent glow */}
      <mesh ref={glowRef} position={[0, 0, -0.25]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={COL_SQUID_GLOW} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/* ── Apex shark — long sleek silhouette, predator tracking. ────────────── */
function EcoShark({ position, scale = 1, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailBaseRef = useRef<THREE.Group>(null);
  const tailFinRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;

    if (groupRef.current) {
      const yaw = state.pointer.x * 0.55 + Math.PI;
      const pitch = -state.pointer.y * 0.3;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, yaw, 0.12);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pitch, 0.12);
      groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.15;
    }
    if (tailBaseRef.current) tailBaseRef.current.rotation.y = Math.sin(t * 4) * 0.28;
    if (tailFinRef.current) tailFinRef.current.rotation.y = Math.sin(t * 4 + 1.2) * 0.36;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Torso */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.28, 1.45, 6]} />
        <meshStandardMaterial
          color={COL_SHARK_BODY}
          roughness={0.45}
          metalness={0.18}
          flatShading
        />
      </mesh>
      {/* Lighter underbelly */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} scale={[0.82, 0.5, 0.82]}>
        <coneGeometry args={[0.28, 1.45, 6]} />
        <meshStandardMaterial color={COL_SHARK_BELLY} roughness={0.6} flatShading />
      </mesh>
      {/* Dorsal */}
      <mesh position={[0, 0.3, -0.05]} rotation={[-0.45, 0, 0]} scale={[0.05, 0.32, 0.28]}>
        <boxGeometry />
        <meshStandardMaterial color={COL_SHARK_BODY} roughness={0.45} flatShading />
      </mesh>
      {/* Pectoral fins */}
      <mesh
        position={[-0.32, -0.06, 0.22]}
        rotation={[0.1, 0, -0.55]}
        scale={[0.42, 0.04, 0.22]}
      >
        <boxGeometry />
        <meshStandardMaterial color={COL_SHARK_BODY} flatShading />
      </mesh>
      <mesh
        position={[0.32, -0.06, 0.22]}
        rotation={[0.1, 0, 0.55]}
        scale={[0.42, 0.04, 0.22]}
      >
        <boxGeometry />
        <meshStandardMaterial color={COL_SHARK_BODY} flatShading />
      </mesh>
      {/* Predator eyes */}
      <mesh position={[0.15, 0.07, 0.48]} scale={0.032}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={COL_SHARK_EYE} />
      </mesh>
      <mesh position={[-0.15, 0.07, 0.48]} scale={0.032}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={COL_SHARK_EYE} />
      </mesh>
      {/* Tail assembly */}
      <group ref={tailBaseRef} position={[0, 0, -0.74]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.15]} scale={[0.75, 0.4, 0.65]}>
          <coneGeometry args={[0.2, 0.5, 6]} />
          <meshStandardMaterial color={COL_SHARK_BODY} flatShading />
        </mesh>
        <mesh ref={tailFinRef} position={[0, 0, -0.38]} scale={[0.04, 0.48, 0.28]}>
          <boxGeometry />
          <meshStandardMaterial color={COL_SHARK_BODY} flatShading />
        </mesh>
      </group>
    </group>
  );
}

/* ── Ambient jellyfish — slow drifter, no tracking, just atmosphere. ──── */
function EcoJelly({ position, scale = 0.55, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.25;
      groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.08;
    }
    if (coreRef.current) {
      const pulse = 0.85 + Math.sin(t * 2.2) * 0.18;
      coreRef.current.scale.setScalar(0.2 * pulse);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={COL_JELLY}
          roughness={0.2}
          transparent
          opacity={0.45}
          emissive={COL_JELLY}
          emissiveIntensity={0.35}
          flatShading
        />
      </mesh>
      <mesh ref={coreRef} position={[0, 0.12, 0]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshBasicMaterial color={COL_JELLY_CORE} />
      </mesh>
      {[-0.16, -0.05, 0.05, 0.16].map((dx, i) => (
        <mesh key={i} position={[dx, -0.35, 0]} scale={[0.012, 0.55, 0.012]}>
          <cylinderGeometry args={[1, 1, 1, 6]} />
          <meshBasicMaterial color={COL_JELLY_CORE} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

interface TurtleMascot3DProps {
  /** Pixel height of the canvas container. */
  height?: number;
  /** Show the small HUD readout overlay. */
  showHud?: boolean;
  /** Show the supporting marine ecosystem around the turtle. */
  ecosystem?: boolean;
}

/**
 * Scene wrapper.
 *
 * The ecosystem is opt-out-able for places that want a tighter solo
 * portrait of the turtle. When on, the camera pulls back and the FOV
 * widens so the supporting cast fits cleanly in the frame.
 *
 * Frame-fit math: at fov 42, z = 7.0 you see ~5.4 units of height and
 * ~5.4 units of width at z = 0 in a square container. All creature
 * positions stay inside ±2.4 / ±1.6 so nothing clips at the edges.
 */
export default function TurtleMascot3D({
  height = 360,
  showHud = false,
  ecosystem = true,
}: TurtleMascot3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="turtle3d"
      style={{ height }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0.3, ecosystem ? 7.0 : 4.2], fov: ecosystem ? 42 : 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} color="#a8d4c4" />
        <directionalLight position={[3, 6, 4]} intensity={1.3} color="#7dcfb0" castShadow />
        <pointLight position={[-3, -2, -3]} intensity={0.7} color={COL_GLOW} />
        <pointLight position={[2, -1.5, 3]} intensity={0.5} color="#0d8a5e" />
        {/* A warm rim light from below — picks out the manta / shark
            silhouettes against the dark background */}
        <pointLight position={[0, -3, 1]} intensity={0.4} color="#ffb84d" />

        <Suspense fallback={null}>
          {/* Centerpiece turtle — compact scale (0.85) so it anchors but
              doesn't crowd the frame. */}
          <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.45}>
            <group scale={ecosystem ? 0.85 : 1.05} position={[0, ecosystem ? -0.1 : 0, 0.3]}>
              <TurtleProcedural isHovered={isHovered} />
            </group>
          </Float>

          {ecosystem && (
            <>
              {/* Manta — soars across the upper-right at mid depth */}
              <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.4}>
                <EcoManta position={[1.6, 1.3, -0.6]} scale={0.95} phase={0} />
              </Float>

              {/* Anglerfish — lurks in the lower-left, predator eyes on you */}
              <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
                <EcoAngler position={[-1.9, -1.1, -0.4]} scale={0.7} phase={2.3} />
              </Float>

              {/* Squid — jets along the upper-left, tentacles trailing */}
              <Float speed={2.0} rotationIntensity={0.2} floatIntensity={0.35}>
                <EcoSquid position={[-2.1, 1.1, -0.5]} scale={0.75} phase={4.1} />
              </Float>

              {/* Shark — patrols the deep background plane */}
              <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.25}>
                <EcoShark position={[1.4, -1.0, -1.8]} scale={0.9} phase={5.5} />
              </Float>

              {/* Jelly — slow drifter, deep right, atmosphere only */}
              <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.15}>
                <EcoJelly position={[2.3, 0.1, 0.4]} scale={0.55} phase={1.7} />
              </Float>
            </>
          )}
        </Suspense>
      </Canvas>

      {showHud && (
        <div className="turtle3d__hud" aria-hidden="true">
          <span className="turtle3d__hud-label">
            {ecosystem ? 'Reef matrix · live' : 'Mascot engine · live'}
          </span>
          <span className="turtle3d__hud-status">
            {isHovered
              ? ecosystem
                ? 'tracking · 5 species linked'
                : 'tracking · calibrating'
              : 'idle · drifting'}
          </span>
        </div>
      )}
    </div>
  );
}
