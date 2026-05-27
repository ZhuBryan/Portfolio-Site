import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './TurtleMascot3D.css';

/* ──────────────────────────────────────────────────────────────────────────
   Palette
   ────────────────────────────────────────────────────────────────────────── */
const COL_SHELL_TOP = '#1aaf7a';
const COL_SHELL_RIM = '#0a5a3e';
const COL_SKIN = '#2bc28d';
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

const COL_JELLY = '#9b80e8';
const COL_JELLY_CORE = '#7be8c4';

/* ──────────────────────────────────────────────────────────────────────────
   Goofy Eyes Component
   ────────────────────────────────────────────────────────────────────────── */
const GoofyEyes: React.FC<{ scale?: number; position?: [number, number, number] }> = ({ scale = 1, position = [0, 0, 0] }) => (
  <group position={position} scale={scale}>
    {/* Left Eye: Slightly larger, looks slightly derpy */}
    <mesh position={[-0.2, 0.1, 0]} scale={1.2}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
      <mesh position={[0, 0, 0.12]} scale={0.35}>
        <sphereGeometry />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </mesh>
    
    {/* Right Eye: Smaller, offset */}
    <mesh position={[0.2, 0.15, 0.05]} scale={0.9}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
      <mesh position={[0, 0, 0.12]} scale={0.4}>
        <sphereGeometry />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </mesh>
  </group>
);

/* ──────────────────────────────────────────────────────────────────────────
   Glowing Message in a Bottle
   ────────────────────────────────────────────────────────────────────────── */
const GlowingBottle: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
      <group position={position} rotation={[0, 0, 0.4]}>
        {/* Glass Bottle Body */}
        <mesh>
          <cylinderGeometry args={[0.1, 0.15, 0.6, 12]} />
          <meshPhysicalMaterial 
            transmission={0.9} 
            opacity={1} 
            transparent
            roughness={0.1} 
            ior={1.5} 
            thickness={0.5} 
            color="#88ccff" 
          />
        </mesh>
        {/* Cork */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        {/* Glowing Message Scroll Inside */}
        <mesh position={[0, -0.1, 0]} rotation={[0.2, 0, 0.1]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#ffea00" emissive="#ffdd00" emissiveIntensity={2.5} />
        </mesh>
      </group>
    </Float>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   Procedural Coral Cluster
   ────────────────────────────────────────────────────────────────────────── */
const ReefCoral: React.FC<{ position: [number, number, number]; scale: number }> = ({ position, scale }) => {
  return (
    <group position={position} scale={scale}>
      {/* Neon Tube Sponges */}
      <mesh position={[-0.4, 0.4, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.08, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#ff007f" emissive="#ff0055" emissiveIntensity={0.8} flatShading />
      </mesh>
      <mesh position={[0.2, 0.6, -0.2]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.1, 0.06, 1.2, 8]} />
        <meshStandardMaterial color="#7209b7" emissive="#4361ee" emissiveIntensity={0.9} flatShading />
      </mesh>
      
      {/* Dense Brain Coral Base */}
      <mesh position={[0, 0.1, 0.2]} scale={[1, 0.6, 1]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#4ecba0" emissive="#00f5d4" emissiveIntensity={0.3} flatShading />
      </mesh>
    </group>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   Marine Snow
   ────────────────────────────────────────────────────────────────────────── */
function MarineSnow({ count = 150 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 12;
      const speed = 0.05 + Math.random() * 0.05;
      const scale = 0.01 + Math.random() * 0.02;
      const offset = Math.random() * Math.PI * 2;
      temp.push({ x, y, z, speed, scale, offset });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      particles.forEach((p, i) => {
        const drift = Math.sin(time * 0.5 + p.offset) * 0.3;
        dummy.position.set(p.x + drift, p.y + time * p.speed, p.z);
        if (dummy.position.y > 6) {
          p.y -= 12;
        }
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
    </instancedMesh>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Turtle
   ────────────────────────────────────────────────────────────────────────── */
function TurtleProcedural({ isHovered }: { isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const flLeft = useRef<THREE.Mesh>(null);
  const flRight = useRef<THREE.Mesh>(null);
  const blLeft = useRef<THREE.Mesh>(null);
  const blRight = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const shellShape = new THREE.Shape();
    shellShape.moveTo(0, 1.2);
    shellShape.bezierCurveTo(0.6, 1.2, 0.9, 0.4, 0.7, -0.6);
    shellShape.bezierCurveTo(0.5, -1.2, 0.2, -1.4, 0, -1.4);
    shellShape.bezierCurveTo(-0.2, -1.4, -0.5, -1.2, -0.7, -0.6);
    shellShape.bezierCurveTo(-0.9, 0.4, -0.6, 1.2, 0, 1.2);

    const shellGeo = new THREE.ExtrudeGeometry(shellShape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.1,
    });
    shellGeo.center();
    shellGeo.rotateX(Math.PI / 2);

    const flipperShape = new THREE.Shape();
    flipperShape.moveTo(0, 0);
    flipperShape.bezierCurveTo(0.4, 0.1, 0.6, 0.6, 0.8, 1.4);
    flipperShape.bezierCurveTo(0.9, 1.6, 0.7, 1.7, 0.5, 1.6);
    flipperShape.bezierCurveTo(0.2, 1.1, -0.1, 0.5, -0.2, 0);

    const flipperGeo = new THREE.ExtrudeGeometry(flipperShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    flipperGeo.center();
    flipperGeo.translate(0, -0.7, 0);

    return { shellGeo, flipperGeo };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.06;
      groupRef.current.rotation.z = Math.sin(t * 0.9) * 0.03;
      const yawTarget = state.pointer.x * 0.35;
      const pitchTarget = -state.pointer.y * 0.16;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, yawTarget, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pitchTarget, 0.06);
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
      <mesh geometry={geos.shellGeo} scale={[0.7, 0.8, 0.7]} position={[0, 0.1, 0]}>
        <meshPhysicalMaterial color={COL_SHELL_TOP} roughness={0.4} clearcoat={0.3} />
      </mesh>
      <mesh geometry={geos.shellGeo} scale={[0.65, 0.2, 0.65]} position={[0, -0.05, 0]}>
        <meshPhysicalMaterial color={COL_SHELL_RIM} roughness={0.6} clearcoat={0.1} />
      </mesh>
      <group ref={headRef} position={[0, 0.04, 0.85]}>
        <mesh scale={[0.3, 0.25, 0.4]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial color={COL_SKIN} roughness={0.5} clearcoat={0.3} />
        </mesh>
        <GoofyEyes position={[0, 0.15, 0.2]} scale={0.4} />
      </group>
      <mesh ref={flLeft} geometry={geos.flipperGeo} position={[-0.6, 0, 0.3]} rotation={[0, 0.2, 0.2]} scale={[0.7, 0.7, 0.7]}>
        <meshPhysicalMaterial color={COL_SKIN} roughness={0.5} clearcoat={0.2} />
      </mesh>
      <mesh ref={flRight} geometry={geos.flipperGeo} position={[0.6, 0, 0.3]} rotation={[0, -0.2, -0.2]} scale={[-0.7, 0.7, 0.7]}>
        <meshPhysicalMaterial color={COL_SKIN} roughness={0.5} clearcoat={0.2} />
      </mesh>
      <mesh ref={blLeft} geometry={geos.flipperGeo} position={[-0.45, -0.05, -0.55]} rotation={[0, -0.2, 0.1]} scale={[0.35, 0.35, 0.35]}>
        <meshPhysicalMaterial color={COL_SKIN} roughness={0.5} clearcoat={0.2} />
      </mesh>
      <mesh ref={blRight} geometry={geos.flipperGeo} position={[0.45, -0.05, -0.55]} rotation={[0, 0.2, -0.1]} scale={[-0.35, 0.35, 0.35]}>
        <meshPhysicalMaterial color={COL_SKIN} roughness={0.5} clearcoat={0.2} />
      </mesh>
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshStandardMaterial
          color={COL_GLOW}
          emissive={COL_GLOW}
          emissiveIntensity={isHovered ? 2.0 : 0.4}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Creatures
   ────────────────────────────────────────────────────────────────────────── */
interface CreatureProps {
  position: [number, number, number];
  scale?: number;
  phase?: number;
}

function EcoManta({ position, scale = 1, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);
  const stripeRef = useRef<THREE.MeshStandardMaterial>(null);

  const geos = useMemo(() => {
    const bodyPts = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      bodyPts.push(new THREE.Vector2(Math.sin(t * Math.PI) * 0.4, (t - 0.5) * 1.8));
    }
    const bodyGeo = new THREE.LatheGeometry(bodyPts, 32);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.scale(1, 0.2, 1);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.5);
    wingShape.quadraticCurveTo(1.2, 0.2, 1.5, -0.2);
    wingShape.quadraticCurveTo(0.8, -0.6, 0, -0.8);
    wingShape.lineTo(0, 0.5);

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    wingGeo.center();
    wingGeo.rotateX(Math.PI / 2);
    wingGeo.translate(0.7, 0, -0.15);

    return { bodyGeo, wingGeo };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (groupRef.current) {
      const bank = state.pointer.x * 0.35;
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, bank, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -state.pointer.y * 0.18, 0.05);
      groupRef.current.position.y = position[1] + Math.sin(t * 0.9) * 0.15;
    }
    if (leftWing.current) leftWing.current.rotation.z = 0.05 + Math.sin(t * 1.3) * 0.35;
    if (rightWing.current) rightWing.current.rotation.z = -0.05 - Math.sin(t * 1.3) * 0.35;
    if (stripeRef.current) stripeRef.current.emissiveIntensity = 0.5 + Math.sin(t * 1.6) * 1.5;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh geometry={geos.bodyGeo}>
        <meshPhysicalMaterial color={COL_MANTA_TOP} roughness={0.4} clearcoat={0.2} />
      </mesh>
      <mesh geometry={geos.bodyGeo} scale={[0.95, 0.95, 0.95]} position={[0, -0.02, 0]}>
        <meshPhysicalMaterial color={COL_MANTA_UNDER} roughness={0.5} />
      </mesh>
      <group position={[-0.1, 0, 0]}>
        <mesh ref={leftWing} geometry={geos.wingGeo} scale={[-1, 1, 1]}>
          <meshPhysicalMaterial color={COL_MANTA_TOP} roughness={0.4} clearcoat={0.2} />
        </mesh>
      </group>
      <group position={[0.1, 0, 0]}>
        <mesh ref={rightWing} geometry={geos.wingGeo}>
          <meshPhysicalMaterial color={COL_MANTA_TOP} roughness={0.4} clearcoat={0.2} />
        </mesh>
      </group>
      <mesh position={[0, 0.04, 0]} scale={[0.06, 0.005, 0.55]}>
        <boxGeometry />
        <meshStandardMaterial ref={stripeRef} color={COL_MANTA_STRIPE} emissive={COL_MANTA_STRIPE} />
      </mesh>
      <GoofyEyes position={[0, 0.1, 0.7]} scale={0.2} />
    </group>
  );
}

function EcoAngler({ position, scale = 0.7, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lureRef = useRef<THREE.Mesh>(null);
  const lureMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const antennaRef = useRef<THREE.Group>(null);

  const geos = useMemo(() => {
    const bodyPts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const r = Math.sin(t * Math.PI) * (1 - t * 0.5) * 0.6; 
      bodyPts.push(new THREE.Vector2(r, (t - 0.5) * 1.4));
    }
    const bodyGeo = new THREE.LatheGeometry(bodyPts, 32);
    bodyGeo.rotateX(Math.PI / 2);
    return { bodyGeo };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (groupRef.current) {
      const yaw = state.pointer.x * 0.55;
      const pitch = -state.pointer.y * 0.3;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, yaw, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pitch, 0.1);
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.06;
    }
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(t * 1.1) * 0.12;
      antennaRef.current.rotation.x = Math.sin(t * 0.8 + 1) * 0.08;
    }
    if (lureRef.current) {
      lureRef.current.scale.setScalar(0.085 * (0.85 + Math.sin(t * 3.2) * 0.2));
    }
    if (lureMatRef.current) {
      lureMatRef.current.emissiveIntensity = 1.5 + Math.sin(t * 4.5) * 1.5;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh geometry={geos.bodyGeo}>
        <meshPhysicalMaterial color={COL_ANGLER_BODY} roughness={0.6} clearcoat={0.1} />
      </mesh>
      <mesh position={[0, -0.18, 0.32]} scale={[0.45, 0.2, 0.35]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial color={COL_ANGLER_JAW} roughness={0.7} />
      </mesh>
      {[-0.15, -0.05, 0.05, 0.15].map((dx, i) => (
        <mesh key={i} position={[dx, -0.12, 0.52]} scale={[0.02, 0.08, 0.02]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshBasicMaterial color={COL_ANGLER_TEETH} />
        </mesh>
      ))}
      <GoofyEyes position={[0, 0.25, 0.35]} scale={0.4} />
      <group ref={antennaRef} position={[0, 0.45, 0.25]}>
        <mesh position={[0, 0.25, 0]} scale={[0.015, 0.5, 0.015]}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial color={COL_ANGLER_BODY} />
        </mesh>
        <mesh ref={lureRef} position={[0, 0.55, 0]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial ref={lureMatRef} color={COL_LURE} emissive={COL_LURE} />
        </mesh>
      </group>
      <mesh position={[0, 0, -0.65]} scale={[0.04, 0.35, 0.25]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial color={COL_ANGLER_BODY} roughness={0.6} />
      </mesh>
    </group>
  );
}

function EcoSquid({ position, scale = 0.7, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tentaclesRef = useRef<THREE.Group>(null);
  const finLeftRef = useRef<THREE.Mesh>(null);
  const finRightRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const mantlePts = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      mantlePts.push(new THREE.Vector2(Math.sin(Math.acos(t - 1)) * 0.26, (t - 0.5) * 0.95));
    }
    const mantleGeo = new THREE.LatheGeometry(mantlePts, 32);
    mantleGeo.rotateX(Math.PI / 2);
    return { mantleGeo };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.pointer.x * 0.45, 0.08);
      const jet = Math.sin(t * 4) * 0.12;
      groupRef.current.position.z = position[2] + jet;
      groupRef.current.position.y = position[1] + Math.sin(t * 1.4) * 0.08;
    }
    if (tentaclesRef.current) tentaclesRef.current.rotation.x = Math.sin(t * 3) * 0.18;
    if (finLeftRef.current) finLeftRef.current.rotation.z = 0.3 + Math.sin(t * 4) * 0.2;
    if (finRightRef.current) finRightRef.current.rotation.z = -0.3 - Math.sin(t * 4) * 0.2;
    if (glowRef.current) glowRef.current.scale.setScalar(0.18 * (0.75 + Math.sin(t * 4) * 0.2));
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh geometry={geos.mantleGeo} position={[0, 0, 0.1]}>
        <meshPhysicalMaterial color={COL_SQUID_MANTLE} roughness={0.3} clearcoat={0.4} />
      </mesh>
      <mesh ref={finLeftRef} position={[-0.15, 0, 0.45]} rotation={[0, 0, 0.3]} scale={[0.02, 0.25, 0.3]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial color={COL_SQUID_TENTACLE} roughness={0.4} />
      </mesh>
      <mesh ref={finRightRef} position={[0.15, 0, 0.45]} rotation={[0, 0, -0.3]} scale={[0.02, 0.25, 0.3]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial color={COL_SQUID_TENTACLE} roughness={0.4} />
      </mesh>
      
      <GoofyEyes position={[0, 0.15, 0.2]} scale={0.3} />
      
      <group ref={tentaclesRef} position={[0, 0, -0.4]}>
        {[[-0.16, 0.04], [-0.08, -0.08], [0, 0.06], [0.08, -0.08], [0.16, 0.04], [0, -0.14]].map((p, i) => (
          <mesh key={i} position={[p[0], p[1], -0.2]} rotation={[Math.PI / 2 + (i - 2.5) * 0.05, 0, (i - 2.5) * 0.1]} scale={[0.025, 0.55, 0.025]}>
            <cylinderGeometry args={[1, 0.2, 1, 8]} />
            <meshPhysicalMaterial color={COL_SQUID_TENTACLE} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <mesh ref={glowRef} position={[0, 0, -0.25]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={COL_SQUID_GLOW} emissive={COL_SQUID_GLOW} emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

function EcoShark({ position, scale = 1, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailBaseRef = useRef<THREE.Group>(null);
  const tailFinRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const bodyPts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const r = Math.sin(t * Math.PI) * (1 - Math.pow(t - 0.5, 2)) * 0.35; 
      bodyPts.push(new THREE.Vector2(r, (t - 0.5) * 1.8));
    }
    const bodyGeo = new THREE.LatheGeometry(bodyPts, 32);
    bodyGeo.rotateX(Math.PI / 2);

    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.quadraticCurveTo(0.5, 0.2, 0.8, -0.5);
    finShape.lineTo(0, -0.1);
    
    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
    finGeo.center();

    return { bodyGeo, finGeo };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (groupRef.current) {
      // FIX: Removed "+ Math.PI" to correct the backward-facing issue
      const yaw = state.pointer.x * 0.55;
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
      <mesh geometry={geos.bodyGeo}>
        <meshPhysicalMaterial color={COL_SHARK_BODY} roughness={0.3} clearcoat={0.5} metalness={0.2} />
      </mesh>
      <mesh geometry={geos.bodyGeo} scale={[0.9, 0.9, 0.9]} position={[0, -0.05, 0]}>
        <meshPhysicalMaterial color={COL_SHARK_BELLY} roughness={0.4} clearcoat={0.3} />
      </mesh>
      <mesh geometry={geos.finGeo} position={[0, 0.28, 0.1]} rotation={[0.2, 0, 0]} scale={0.4}>
        <meshPhysicalMaterial color={COL_SHARK_BODY} roughness={0.3} clearcoat={0.5} />
      </mesh>
      <mesh geometry={geos.finGeo} position={[-0.25, -0.1, 0.3]} rotation={[0.4, 0, Math.PI / 2.5]} scale={0.5}>
        <meshPhysicalMaterial color={COL_SHARK_BODY} roughness={0.3} clearcoat={0.5} />
      </mesh>
      <mesh geometry={geos.finGeo} position={[0.25, -0.1, 0.3]} rotation={[0.4, 0, -Math.PI / 2.5]} scale={[-0.5, 0.5, 0.5]}>
        <meshPhysicalMaterial color={COL_SHARK_BODY} roughness={0.3} clearcoat={0.5} />
      </mesh>
      
      <GoofyEyes position={[0, 0.15, 0.65]} scale={0.25} />
      
      <group ref={tailBaseRef} position={[0, 0, -0.8]}>
        <mesh geometry={geos.finGeo} ref={tailFinRef} position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} scale={0.6}>
          <meshPhysicalMaterial color={COL_SHARK_BODY} roughness={0.3} clearcoat={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function EcoJelly({ position, scale = 0.55, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.25;
      groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.2 * (0.85 + Math.sin(t * 2.2) * 0.18));
    }
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = 1 + Math.sin(t * 2.2) * 1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={COL_JELLY}
          roughness={0.1}
          transmission={0.9}
          thickness={0.5}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={coreRef} position={[0, 0.15, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial ref={coreMatRef} color={COL_JELLY_CORE} emissive={COL_JELLY_CORE} />
      </mesh>
      <GoofyEyes position={[0, 0.3, 0.4]} scale={0.3} />
      {[-0.16, -0.05, 0.05, 0.16].map((dx, i) => (
        <mesh key={i} position={[dx, -0.35, 0]} scale={[0.015, 0.55, 0.015]}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshPhysicalMaterial color={COL_JELLY_CORE} transmission={0.5} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Post Processing & Effects Wrapper
   ────────────────────────────────────────────────────────────────────────── */
function PostProcessingWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) return null;

  return (
    <EffectComposer multisampling={4}>
      <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.5} />
      {/* Removed DepthOfField for crisp high-fidelity look */}
    </EffectComposer>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────────────────────── */
interface TurtleMascot3DProps {
  height?: number;
  showHud?: boolean;
  ecosystem?: boolean;
}

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
        <pointLight position={[0, -3, 1]} intensity={0.4} color="#ffb84d" />

        <Environment preset="night" />

        <Suspense fallback={null}>
          {ecosystem && (
            <>
              {/* Added Glowing Message in a Bottle sitting on the wave surface */}
              <GlowingBottle position={[1.5, 2.5, -2]} />
            </>
          )}

          <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.45}>
            <group scale={ecosystem ? 0.85 : 1.05} position={[0, ecosystem ? -0.1 : 0, 0.3]}>
              <TurtleProcedural isHovered={isHovered} />
            </group>
          </Float>

          {ecosystem && (
            <>
              <MarineSnow count={200} />
              
              <ReefCoral position={[-1.5, -1.2, -1]} scale={0.8} />
              <ReefCoral position={[1.8, -1.5, -1.5]} scale={1.2} />

              <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.4}>
                <EcoManta position={[1.6, 1.3, -0.6]} scale={0.95} phase={0} />
              </Float>

              <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
                <EcoAngler position={[-1.9, -1.1, -0.4]} scale={0.7} phase={2.3} />
              </Float>

              <Float speed={2.0} rotationIntensity={0.2} floatIntensity={0.35}>
                <EcoSquid position={[-2.1, 1.1, -0.5]} scale={0.75} phase={4.1} />
              </Float>

              <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.25}>
                <EcoShark position={[1.4, -1.0, -1.8]} scale={0.9} phase={5.5} />
              </Float>

              <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.15}>
                <EcoJelly position={[2.3, 0.1, 0.4]} scale={0.55} phase={1.7} />
              </Float>
            </>
          )}

          <PostProcessingWrapper />
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
