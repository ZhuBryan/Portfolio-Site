import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import './TurtleMascot3D.css';

/* ──────────────────────────────────────────────────────────────────────────
   Palette — mirrors the existing 2D illustration so the 3D mascot reads as
   the same character.
   ────────────────────────────────────────────────────────────────────────── */
const COL_SHELL_TOP = '#1aaf7a';
const COL_SHELL_BOTTOM = '#0d8a5e';
const COL_SKIN = '#1aaf7a';
const COL_BELLY = '#0d8a5e';
const COL_EYE_WHITE = '#e8f4f0';
const COL_EYE_PUPIL = '#0a1628';
const COL_GLOW = '#4ecba0';

/* ──────────────────────────────────────────────────────────────────────────
   Turtle — built from primitives. Looks charming, ships zero external
   assets, and stays under ~1 KB of geometry instructions.

   To upgrade to a real .glb later:
     1. Drop sea_turtle.glb in /public/models/
     2. Replace <TurtleProcedural /> with <primitive object={useGLTF('/models/sea_turtle.glb').scene} />
   ────────────────────────────────────────────────────────────────────────── */
function TurtleProcedural({ isHovered }: { isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const frontLeftFin = useRef<THREE.Mesh>(null);
  const frontRightFin = useRef<THREE.Mesh>(null);
  const backLeftFin = useRef<THREE.Mesh>(null);
  const backRightFin = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Idle swim drift on the whole turtle
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.08;
      groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.04;
      // Whole-body cursor follow — gentle so it doesn't whip around
      const targetY = state.pointer.x * 0.45;
      const targetX = -state.pointer.y * 0.18;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        0.06
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        0.06
      );
    }

    // Head tracks an extra bit beyond the body so the gaze leads
    if (headRef.current) {
      const headTargetY = state.pointer.x * 0.35;
      const headTargetX = -state.pointer.y * 0.25;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        headTargetY,
        0.1
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        headTargetX,
        0.1
      );
    }

    // Flipper paddle — alternating front pair, opposite back pair
    const stroke = Math.sin(t * 2.2);
    const strokeOff = Math.sin(t * 2.2 + Math.PI);
    if (frontLeftFin.current) frontLeftFin.current.rotation.z = 0.35 + stroke * 0.45;
    if (frontRightFin.current) frontRightFin.current.rotation.z = -0.35 - stroke * 0.45;
    if (backLeftFin.current) backLeftFin.current.rotation.z = 0.25 + strokeOff * 0.3;
    if (backRightFin.current) backRightFin.current.rotation.z = -0.25 - strokeOff * 0.3;
  });

  return (
    <group ref={groupRef} dispose={null}>
      {/* Shell — flattened sphere, top */}
      <mesh position={[0, 0.18, 0]} scale={[1.15, 0.55, 1.4]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={COL_SHELL_TOP} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Shell ridge — subtle darker top stripe */}
      <mesh position={[0, 0.7, 0]} scale={[0.4, 0.18, 1.35]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={COL_SHELL_BOTTOM} roughness={0.5} />
      </mesh>
      {/* Belly / under-shell — flatter bottom dome */}
      <mesh position={[0, -0.05, 0]} scale={[1.05, 0.28, 1.25]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={COL_BELLY} roughness={0.7} />
      </mesh>

      {/* Head group — rotates independently to track gaze */}
      <group ref={headRef} position={[0, 0.05, 1.32]}>
        <mesh>
          <sphereGeometry args={[0.42, 24, 20]} />
          <meshStandardMaterial color={COL_SKIN} roughness={0.6} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.18, 0.08, 0.32]}>
          <sphereGeometry args={[0.085, 16, 12]} />
          <meshStandardMaterial color={COL_EYE_WHITE} roughness={0.3} />
        </mesh>
        <mesh position={[0.18, 0.08, 0.32]}>
          <sphereGeometry args={[0.085, 16, 12]} />
          <meshStandardMaterial color={COL_EYE_WHITE} roughness={0.3} />
        </mesh>
        <mesh position={[-0.18, 0.08, 0.4]}>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshStandardMaterial color={COL_EYE_PUPIL} roughness={0.1} />
        </mesh>
        <mesh position={[0.18, 0.08, 0.4]}>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshStandardMaterial color={COL_EYE_PUPIL} roughness={0.1} />
        </mesh>
      </group>

      {/* Flippers — squashed spheres, attached at the shell's four corners */}
      <mesh
        ref={frontLeftFin}
        position={[-0.95, 0.05, 0.55]}
        rotation={[0, 0.25, 0.35]}
        scale={[0.7, 0.18, 0.4]}
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={COL_SKIN} roughness={0.6} />
      </mesh>
      <mesh
        ref={frontRightFin}
        position={[0.95, 0.05, 0.55]}
        rotation={[0, -0.25, -0.35]}
        scale={[0.7, 0.18, 0.4]}
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={COL_SKIN} roughness={0.6} />
      </mesh>
      <mesh
        ref={backLeftFin}
        position={[-0.78, 0, -0.65]}
        rotation={[0, -0.3, 0.25]}
        scale={[0.5, 0.15, 0.3]}
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={COL_SKIN} roughness={0.6} />
      </mesh>
      <mesh
        ref={backRightFin}
        position={[0.78, 0, -0.65]}
        rotation={[0, 0.3, -0.25]}
        scale={[0.5, 0.15, 0.3]}
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={COL_SKIN} roughness={0.6} />
      </mesh>

      {/* Tail — tiny pointed cone */}
      <mesh position={[0, 0, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.35, 12]} />
        <meshStandardMaterial color={COL_SKIN} roughness={0.7} />
      </mesh>

      {/* Bioluminescent halo — only visible on hover */}
      <mesh>
        <sphereGeometry args={[1.55, 24, 16]} />
        <meshBasicMaterial
          color={COL_GLOW}
          transparent
          opacity={isHovered ? 0.16 : 0}
          wireframe
        />
      </mesh>
    </group>
  );
}

interface TurtleMascot3DProps {
  /** Compact height for inline use (e.g. About sidebar). */
  height?: number;
  /** Show the small HUD readout below the scene. */
  showHud?: boolean;
}

/**
 * Main scene wrapper. Captures hover state at the Canvas level so the
 * underlying turtle component can toggle its glow without re-mounting.
 */
export default function TurtleMascot3D({ height = 220, showHud = false }: TurtleMascot3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="turtle3d"
      style={{ height }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0.6, 4.2], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Cinematic underwater lighting — no Environment HDR, keeps bundle slim */}
        <ambientLight intensity={0.45} color="#a8d4c4" />
        <directionalLight position={[3, 6, 4]} intensity={1.3} color="#7dcfb0" castShadow />
        <pointLight position={[-3, -2, -3]} intensity={0.7} color={COL_GLOW} />
        <pointLight position={[2, -1.5, 3]} intensity={0.5} color="#0d8a5e" />

        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
            <TurtleProcedural isHovered={isHovered} />
          </Float>
        </Suspense>
      </Canvas>

      {showHud && (
        <div className="turtle3d__hud" aria-hidden="true">
          <span className="turtle3d__hud-label">Mascot Engine · live</span>
          <span className="turtle3d__hud-status">
            {isHovered ? 'tracking · calibrating' : 'idle · drifting'}
          </span>
        </div>
      )}
    </div>
  );
}
