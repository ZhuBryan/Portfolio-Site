import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './TurtleMascot3D.css';

/* ──────────────────────────────────────────────────────────────────────────
   Cursor tracking — done at the WINDOW level, not through R3F's event
   system. (`eventSource={document.body}` normalized the pointer against the
   whole page height, so creature tracking broke the moment the user
   scrolled.) One passive listener feeds a shared NDC vector that every
   creature reads each frame, regardless of where the canvas sits on the
   page.
   ────────────────────────────────────────────────────────────────────────── */
const cursorNDC = new THREE.Vector2(0, 0);
let cursorListenerBound = false;
function bindCursorListener() {
  if (cursorListenerBound || typeof window === 'undefined') return;
  cursorListenerBound = true;
  window.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      cursorNDC.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    },
    { passive: true }
  );
}

/** Cursor position in world units on the z=0 plane. */
function cursorWorld(viewport: { width: number; height: number }): [number, number] {
  return [(cursorNDC.x * viewport.width) / 2, (cursorNDC.y * viewport.height) / 2];
}

/* ──────────────────────────────────────────────────────────────────────────
   Palette — tropical lagoon
   ────────────────────────────────────────────────────────────────────────── */
const COL_SHELL_TOP = '#2ebd85';
const COL_SHELL_RIM = '#0f7a55';
const COL_SKIN = '#45d6a3';
const COL_GLOW = '#3ee6c0';

const COL_MANTA_TOP = '#2d6fb0';
const COL_MANTA_UNDER = '#bfe8ff';
const COL_MANTA_STRIPE = '#ffe08a';

const COL_CLOWN_BODY = '#ff8a3c';
const COL_CLOWN_BAND = '#fff8ef';
const COL_CLOWN_FIN = '#f4702a';

const COL_SQUID_MANTLE = '#ff7a88';
const COL_SQUID_TENTACLE = '#ffa0b0';
const COL_SQUID_GLOW = '#ffd1dc';

const COL_SHARK_BODY = '#5e8fb8';
const COL_SHARK_BELLY = '#ddeff7';

const COL_JELLY = '#b5a2f2';
const COL_JELLY_CORE = '#7ff0d4';

const COL_SAND = '#f0dca8';
const COL_CORAL_RED = '#ff6f61';
const COL_CORAL_PINK = '#ff9ec0';
const COL_CORAL_MAGENTA = '#e6539e';
const COL_CORAL_ORANGE = '#ffab4d';
const COL_CORAL_LAVENDER = '#c9a2e8';
const COL_SEAWEED = '#2fbf8f';

/* ──────────────────────────────────────────────────────────────────────────
   Goofy Eyes (pure 2D — the personality of the whole reef)
   ────────────────────────────────────────────────────────────────────────── */
const GoofyEyes: React.FC<{ scale?: number; position?: [number, number, number] }> = ({
  scale = 1,
  position = [0, 0, 0],
}) => (
  <group position={position} scale={scale}>
    <group position={[-0.25, 0.1, 0]}>
      <mesh>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.02, 0.01]} scale={0.4}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>
    </group>
    <group position={[0.25, 0.15, 0]}>
      <mesh scale={0.8}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.02, 0.01]} scale={0.32}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>
    </group>
  </group>
);

/* ──────────────────────────────────────────────────────────────────────────
   Sun-dust — bright drifting motes catching the light
   ────────────────────────────────────────────────────────────────────────── */
function SunDust({ count = 140 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      const speed = 0.04 + Math.random() * 0.05;
      const scale = 0.01 + Math.random() * 0.022;
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
        if (dummy.position.y > 5) {
          p.y -= 10;
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
      <meshBasicMaterial color="#fff8df" transparent opacity={0.45} />
    </instancedMesh>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Shared creature props — every creature has a `home` anchor and drifts a
   bounded distance from it toward the cursor, while turning to face it.
   ────────────────────────────────────────────────────────────────────────── */
interface CreatureProps {
  home: [number, number, number];
  scale?: number;
  phase?: number;
}

/* ──────────────────────────────────────────────────────────────────────────
   Turtle — the mascot. Strongest cursor affinity of the school.
   ────────────────────────────────────────────────────────────────────────── */
function TurtleProcedural({ home, scale = 1, isHovered }: CreatureProps & { isHovered: boolean }) {
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
    const [tx, ty] = cursorWorld(state.viewport);
    const g = groupRef.current;
    if (g) {
      // swim toward the cursor, but never further than ~1.8 units from home
      const fx = home[0] + THREE.MathUtils.clamp((tx - home[0]) * 0.4, -1.8, 1.8);
      const fy =
        home[1] +
        THREE.MathUtils.clamp((ty - home[1]) * 0.32, -1.4, 1.4) +
        Math.sin(t * 1.2) * 0.08;
      g.position.x = THREE.MathUtils.lerp(g.position.x, fx, 0.035);
      g.position.y = THREE.MathUtils.lerp(g.position.y, fy, 0.035);
      g.position.z = home[2];

      // face the swim direction + bank into the turn
      const dx = tx - g.position.x;
      const dy = ty - g.position.y;
      g.rotation.y = THREE.MathUtils.lerp(
        g.rotation.y,
        THREE.MathUtils.clamp(dx * 0.22, -0.75, 0.75),
        0.06
      );
      g.rotation.x = THREE.MathUtils.lerp(
        g.rotation.x,
        THREE.MathUtils.clamp(-dy * 0.14, -0.4, 0.4),
        0.06
      );
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -dx * 0.05 + Math.sin(t * 0.9) * 0.03, 0.05);
    }
    if (headRef.current) {
      const dxh = tx - (g?.position.x ?? 0);
      const dyh = ty - (g?.position.y ?? 0);
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        THREE.MathUtils.clamp(dxh * 0.12, -0.5, 0.5),
        0.1
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        THREE.MathUtils.clamp(-dyh * 0.1, -0.35, 0.35),
        0.1
      );
    }
    const stroke = Math.sin(t * 2.4);
    const strokeOff = Math.sin(t * 2.4 + Math.PI);
    if (flLeft.current) flLeft.current.rotation.z = 0.25 + stroke * 0.4;
    if (flRight.current) flRight.current.rotation.z = -0.25 - stroke * 0.4;
    if (blLeft.current) blLeft.current.rotation.z = 0.15 + strokeOff * 0.25;
    if (blRight.current) blRight.current.rotation.z = -0.15 - strokeOff * 0.25;
  });

  return (
    <group ref={groupRef} position={home} scale={scale} dispose={null}>
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
          emissiveIntensity={isHovered ? 1.6 : 0.3}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Manta — glides across the upper water, banking toward the cursor
   ────────────────────────────────────────────────────────────────────────── */
function EcoManta({ home, scale = 1, phase = 0 }: CreatureProps) {
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

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    wingGeo.center();
    wingGeo.rotateX(Math.PI / 2);
    wingGeo.translate(0.7, 0, -0.15);

    return { bodyGeo, wingGeo };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    const [tx, ty] = cursorWorld(state.viewport);
    const g = groupRef.current;
    if (g) {
      const fx = home[0] + THREE.MathUtils.clamp((tx - home[0]) * 0.22, -1.6, 1.6) + Math.sin(t * 0.4) * 0.6;
      const fy = home[1] + THREE.MathUtils.clamp((ty - home[1]) * 0.16, -0.9, 0.9) + Math.sin(t * 0.9) * 0.18;
      g.position.x = THREE.MathUtils.lerp(g.position.x, fx, 0.02);
      g.position.y = THREE.MathUtils.lerp(g.position.y, fy, 0.02);
      const dx = tx - g.position.x;
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, THREE.MathUtils.clamp(-dx * 0.08, -0.4, 0.4), 0.03);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, THREE.MathUtils.clamp(dx * 0.1, -0.5, 0.5), 0.04);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, THREE.MathUtils.clamp(-(ty - g.position.y) * 0.06, -0.3, 0.3), 0.04);
    }
    if (leftWing.current) leftWing.current.rotation.z = 0.05 + Math.sin(t * 1.3) * 0.35;
    if (rightWing.current) rightWing.current.rotation.z = -0.05 - Math.sin(t * 1.3) * 0.35;
    if (stripeRef.current) stripeRef.current.emissiveIntensity = 0.4 + Math.sin(t * 1.6) * 0.8;
  });

  return (
    <group ref={groupRef} position={home} scale={scale}>
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

/* ──────────────────────────────────────────────────────────────────────────
   Clownfish — darty little swimmer, quickest to chase the cursor
   ────────────────────────────────────────────────────────────────────────── */
function EcoClownfish({ home, scale = 0.7, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const finTopRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const bodyPts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const r = Math.sin(t * Math.PI) * (1 - t * 0.25) * 0.42;
      bodyPts.push(new THREE.Vector2(r, (t - 0.5) * 1.1));
    }
    const bodyGeo = new THREE.LatheGeometry(bodyPts, 32);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.scale(0.75, 1, 1);

    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.quadraticCurveTo(0.35, 0.3, 0.55, 0.05);
    finShape.quadraticCurveTo(0.3, -0.12, 0, -0.05);
    const finGeo = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    finGeo.center();

    return { bodyGeo, finGeo };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    const [tx, ty] = cursorWorld(state.viewport);
    const g = groupRef.current;
    if (g) {
      const fx = home[0] + THREE.MathUtils.clamp((tx - home[0]) * 0.3, -1.4, 1.4) + Math.sin(t * 1.6) * 0.14;
      const fy = home[1] + THREE.MathUtils.clamp((ty - home[1]) * 0.26, -1.1, 1.1) + Math.sin(t * 2.1) * 0.1;
      g.position.x = THREE.MathUtils.lerp(g.position.x, fx, 0.08);
      g.position.y = THREE.MathUtils.lerp(g.position.y, fy, 0.08);
      const dx = tx - g.position.x;
      const dy = ty - g.position.y;
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, THREE.MathUtils.clamp(dx * 0.25, -0.9, 0.9), 0.1);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, THREE.MathUtils.clamp(-dy * 0.16, -0.5, 0.5), 0.1);
      g.rotation.z = Math.sin(t * 2.1) * 0.06;
    }
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(t * 6) * 0.5;
    if (finTopRef.current) finTopRef.current.rotation.x = Math.sin(t * 4) * 0.2;
  });

  return (
    <group ref={groupRef} position={home} scale={scale}>
      <mesh geometry={geos.bodyGeo}>
        <meshPhysicalMaterial color={COL_CLOWN_BODY} roughness={0.35} clearcoat={0.4} />
      </mesh>
      {[0.28, -0.05, -0.36].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]} scale={[1 - Math.abs(z) * 0.55, 0.75, 1]}>
          <torusGeometry args={[0.34, 0.055, 12, 32]} />
          <meshPhysicalMaterial color={COL_CLOWN_BAND} roughness={0.4} />
        </mesh>
      ))}
      <mesh ref={finTopRef} geometry={geos.finGeo} position={[0, 0.4, 0]} rotation={[0, Math.PI / 2, 0.4]} scale={0.7}>
        <meshPhysicalMaterial color={COL_CLOWN_FIN} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geos.finGeo} position={[-0.28, -0.05, 0.12]} rotation={[0.3, 0.7, -0.7]} scale={0.5}>
        <meshPhysicalMaterial color={COL_CLOWN_FIN} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geos.finGeo} position={[0.28, -0.05, 0.12]} rotation={[0.3, -0.7, 0.7]} scale={0.5}>
        <meshPhysicalMaterial color={COL_CLOWN_FIN} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={tailRef} geometry={geos.finGeo} position={[0, 0, -0.62]} rotation={[0, Math.PI / 2, Math.PI / 2]} scale={0.8}>
        <meshPhysicalMaterial color={COL_CLOWN_FIN} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      <GoofyEyes position={[0, 0.12, 0.5]} scale={0.32} />
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Squid — jets in place, mantle toward the cursor
   ────────────────────────────────────────────────────────────────────────── */
function EcoSquid({ home, scale = 0.7, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mantleRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const tentaclesRef = useRef<THREE.Group>(null);
  const finLeftRef = useRef<THREE.Mesh>(null);
  const finRightRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const geos = useMemo(() => {
    const mantlePts = [
      new THREE.Vector2(0.02, -0.9),
      new THREE.Vector2(0.28, -0.6),
      new THREE.Vector2(0.35, -0.1),
      new THREE.Vector2(0.28, 0.45),
      new THREE.Vector2(0.16, 0.85),
    ];
    const mantleGeo = new THREE.LatheGeometry(mantlePts, 32);
    mantleGeo.rotateX(Math.PI / 2);
    const headGeo = new THREE.SphereGeometry(0.22, 20, 20);
    return { mantleGeo, headGeo };
  }, []);

  const tentacles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        offsetX: (i - 3.5) * 0.06,
        offsetZ: (i % 2 === 0 ? 1 : -1) * 0.02,
        length: 0.6 + (i % 3) * 0.12,
        bend: (i - 3.5) * 0.08,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    const [tx, ty] = cursorWorld(state.viewport);
    const g = groupRef.current;
    if (g) {
      const jet = Math.sin(t * 4) * 0.12;
      const fx = home[0] + THREE.MathUtils.clamp((tx - home[0]) * 0.18, -1.0, 1.0);
      const fy = home[1] + THREE.MathUtils.clamp((ty - home[1]) * 0.15, -0.8, 0.8) + Math.sin(t * 1.4) * 0.08;
      g.position.x = THREE.MathUtils.lerp(g.position.x, fx, 0.05);
      g.position.y = THREE.MathUtils.lerp(g.position.y, fy, 0.05);
      g.position.z = home[2] + jet;
      const dx = tx - g.position.x;
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, THREE.MathUtils.clamp(dx * 0.18, -0.7, 0.7), 0.06);
      g.rotation.x = THREE.MathUtils.lerp(
        g.rotation.x,
        THREE.MathUtils.clamp(-(ty - g.position.y) * 0.1, -0.35, 0.35),
        0.06
      );
    }
    if (tentaclesRef.current) tentaclesRef.current.rotation.x = Math.sin(t * 3) * 0.18;
    if (finLeftRef.current) finLeftRef.current.rotation.z = 0.3 + Math.sin(t * 4) * 0.2;
    if (finRightRef.current) finRightRef.current.rotation.z = -0.3 - Math.sin(t * 4) * 0.2;
    if (glowRef.current) glowRef.current.scale.setScalar(0.18 * (0.75 + Math.sin(t * 4) * 0.2));
    if (mantleRef.current) mantleRef.current.rotation.z = Math.sin(t * 0.6) * 0.06;
    if (headRef.current) headRef.current.rotation.x = Math.sin(t * 0.7) * 0.03;
  });

  return (
    <group ref={groupRef} position={home} scale={scale}>
      <mesh ref={mantleRef} geometry={geos.mantleGeo} position={[0, 0.1, 0.05]} scale={[0.9, 1.15, 0.9]}>
        <meshPhysicalMaterial color={COL_SQUID_MANTLE} roughness={0.28} clearcoat={0.45} />
      </mesh>
      <group ref={headRef} position={[0, 0.18, 0.3]}>
        <mesh geometry={geos.headGeo}>
          <meshPhysicalMaterial color={COL_SQUID_TENTACLE} roughness={0.35} />
        </mesh>
        <GoofyEyes position={[0, 0.05, 0.18]} scale={0.22} />
      </group>
      <mesh ref={finLeftRef} position={[-0.22, 0.22, 0.28]} rotation={[0.1, 0, 0.5]} scale={[0.02, 0.22, 0.34]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial color={COL_SQUID_TENTACLE} roughness={0.4} />
      </mesh>
      <mesh ref={finRightRef} position={[0.22, 0.22, 0.28]} rotation={[0.1, 0, -0.5]} scale={[0.02, 0.22, 0.34]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial color={COL_SQUID_TENTACLE} roughness={0.4} />
      </mesh>
      <group ref={tentaclesRef} position={[0, -0.12, -0.28]}>
        {tentacles.map((tentacle, i) => (
          <mesh
            key={i}
            position={[tentacle.offsetX, -0.1, tentacle.offsetZ]}
            rotation={[Math.PI / 2 + tentacle.bend, 0, tentacle.bend * 1.5]}
            scale={[0.02, tentacle.length, 0.02]}
          >
            <cylinderGeometry args={[1, 0.12, 1, 8]} />
            <meshPhysicalMaterial color={COL_SQUID_TENTACLE} roughness={0.45} />
          </mesh>
        ))}
      </group>
      <mesh ref={glowRef} position={[0, -0.04, -0.2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={COL_SQUID_GLOW} emissive={COL_SQUID_GLOW} emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Reef shark — patrols the background, nose toward the cursor
   ────────────────────────────────────────────────────────────────────────── */
function EcoShark({ home, scale = 1, phase = 0 }: CreatureProps) {
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

    const finGeo = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    finGeo.center();

    return { bodyGeo, finGeo };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    const [tx, ty] = cursorWorld(state.viewport);
    const g = groupRef.current;
    if (g) {
      // slow patrol left-right across its home range
      const patrol = Math.sin(t * 0.25) * 1.6;
      g.position.x = THREE.MathUtils.lerp(g.position.x, home[0] + patrol, 0.02);
      g.position.y = home[1] + Math.sin(t * 0.7) * 0.15;
      const dx = tx - g.position.x;
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, THREE.MathUtils.clamp(dx * 0.14, -0.8, 0.8), 0.05);
      g.rotation.x = THREE.MathUtils.lerp(
        g.rotation.x,
        THREE.MathUtils.clamp(-(ty - g.position.y) * 0.06, -0.3, 0.3),
        0.05
      );
    }
    if (tailBaseRef.current) tailBaseRef.current.rotation.y = Math.sin(t * 4) * 0.28;
    if (tailFinRef.current) tailFinRef.current.rotation.y = Math.sin(t * 4 + 1.2) * 0.36;
  });

  return (
    <group ref={groupRef} position={home} scale={scale}>
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

/* ──────────────────────────────────────────────────────────────────────────
   Jellyfish — drifts vertically, mostly ignores the cursor (it's a jelly)
   ────────────────────────────────────────────────────────────────────────── */
function EcoJelly({ home, scale = 0.55, phase = 0 }: CreatureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (groupRef.current) {
      groupRef.current.position.y = home[1] + Math.sin(t * 1.2) * 0.25;
      groupRef.current.position.x = home[0] + Math.sin(t * 0.4) * 0.2;
      groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.2 * (0.85 + Math.sin(t * 2.2) * 0.18));
    }
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = 0.8 + Math.sin(t * 2.2) * 0.7;
    }
  });

  return (
    <group ref={groupRef} position={home} scale={scale}>
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
   CORAL — the reef floor. All procedural, gently swaying in the current.
   ────────────────────────────────────────────────────────────────────────── */
const BRANCH_LAYOUT = [
  { pos: [0, 0.8, 0], rot: 0.55, len: 0.55, tips: 2 },
  { pos: [0.04, 0.7, 0.04], rot: -0.7, len: 0.62, tips: 2 },
  { pos: [-0.03, 0.86, -0.04], rot: 0.1, len: 0.5, tips: 1 },
] as const;

function BranchCoral({
  position,
  color,
  scale = 1,
  phase = 0,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (ref.current) ref.current.rotation.z = Math.sin(t * 0.8) * 0.045;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {/* trunk */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.07, 0.13, 0.95, 8]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {BRANCH_LAYOUT.map((b, i) => (
        <group key={i} position={b.pos as unknown as [number, number, number]} rotation={[0, 0, b.rot]}>
          <mesh position={[0, b.len / 2, 0]}>
            <cylinderGeometry args={[0.045, 0.07, b.len, 8]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          {Array.from({ length: b.tips }).map((_, j) => (
            <group
              key={j}
              position={[0, b.len * 0.92, 0]}
              rotation={[0, 0, (j === 0 ? 1 : -1) * 0.55]}
            >
              <mesh position={[0, 0.16, 0]}>
                <cylinderGeometry args={[0.028, 0.045, 0.34, 8]} />
                <meshStandardMaterial color={color} roughness={0.75} />
              </mesh>
              <mesh position={[0, 0.34, 0]}>
                <sphereGeometry args={[0.05, 10, 10]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={color}
                  emissiveIntensity={0.5}
                  roughness={0.5}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

const TUBE_LAYOUT = [
  { x: -0.16, z: 0.02, h: 0.55 },
  { x: -0.05, z: -0.07, h: 0.78 },
  { x: 0.07, z: 0.05, h: 0.62 },
  { x: 0.18, z: -0.03, h: 0.45 },
  { x: 0.0, z: 0.12, h: 0.38 },
] as const;

function TubeCoral({
  position,
  color,
  scale = 1,
  phase = 0,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (ref.current) ref.current.rotation.z = Math.sin(t * 0.7) * 0.03;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {TUBE_LAYOUT.map((tube, i) => (
        <group key={i} position={[tube.x, 0, tube.z]}>
          <mesh position={[0, tube.h / 2, 0]}>
            <cylinderGeometry args={[0.075, 0.05, tube.h, 10, 1, true]} />
            <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, tube.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.07, 0.018, 8, 16]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FanCoral({
  position,
  color,
  scale = 1,
  phase = 0,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    if (ref.current) ref.current.rotation.z = Math.sin(t * 0.9) * 0.09;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.24, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* the fan blade — half disc standing upright */}
      <mesh position={[0, 0.62, 0]}>
        <circleGeometry args={[0.55, 28, 0, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.65} side={THREE.DoubleSide} transparent opacity={0.92} />
      </mesh>
      {/* vein lines via thin rings */}
      <mesh position={[0, 0.62, 0.005]}>
        <ringGeometry args={[0.32, 0.34, 24, 1, 0, Math.PI]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function BrainCoral({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  return (
    <mesh position={position} scale={[scale, scale * 0.62, scale]}>
      <sphereGeometry args={[0.42, 20, 14]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function Seaweed({
  position,
  scale = 1,
  phase = 0,
}: {
  position: [number, number, number];
  scale?: number;
  phase?: number;
}) {
  const refs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + phase;
    refs.forEach((r, i) => {
      if (r.current) r.current.rotation.z = Math.sin(t * 1.1 + i * 0.9) * 0.16;
    });
  });
  const blades = [
    { x: -0.1, h: 1.1 },
    { x: 0.04, h: 1.5 },
    { x: 0.16, h: 0.9 },
  ];
  return (
    <group position={position} scale={scale}>
      {blades.map((b, i) => (
        <group key={i} ref={refs[i]} position={[b.x, 0, 0]}>
          <mesh position={[0, b.h / 2, 0]}>
            <coneGeometry args={[0.05, b.h, 6]} />
            <meshStandardMaterial color={COL_SEAWEED} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   ReefScene — positions everything as FRACTIONS of the visible viewport so
   nothing ever sits outside the frame, on any screen size. The About copy
   panel occupies the left half, so the school skews right.
   ────────────────────────────────────────────────────────────────────────── */
function ReefScene({ fullBleed, isHovered }: { fullBleed: boolean; isHovered: boolean }) {
  const { viewport } = useThree();
  const w = viewport.width;
  const h = viewport.height;

  // seabed line, slightly above the bottom edge
  const floor = -h / 2 + 0.18;

  const homes = fullBleed
    ? {
        turtle: [w * 0.18, h * 0.06, 0] as [number, number, number],
        manta: [-w * 0.04, h * 0.3, -1.5] as [number, number, number],
        clown: [w * 0.3, -h * 0.16, 0.6] as [number, number, number],
        squid: [w * 0.36, h * 0.14, -0.8] as [number, number, number],
        shark: [-w * 0.16, -h * 0.02, -3] as [number, number, number],
        jelly: [w * 0.41, -h * 0.05, -0.4] as [number, number, number],
      }
    : {
        turtle: [0, h * 0.05, 0] as [number, number, number],
        manta: [w * 0.22, h * 0.26, -1.5] as [number, number, number],
        clown: [-w * 0.24, -h * 0.18, 0.4] as [number, number, number],
        squid: [-w * 0.26, h * 0.2, -0.8] as [number, number, number],
        shark: [w * 0.1, -h * 0.05, -3] as [number, number, number],
        jelly: [w * 0.3, -h * 0.06, -0.4] as [number, number, number],
      };

  return (
    <>
      <SunDust count={fullBleed ? 170 : 110} />

      <TurtleProcedural home={homes.turtle} scale={0.95} isHovered={isHovered} />

      <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.3}>
        <EcoManta home={homes.manta} scale={0.95} phase={0} />
      </Float>

      <EcoClownfish home={homes.clown} scale={0.8} phase={2.3} />

      <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.3}>
        <EcoSquid home={homes.squid} scale={0.75} phase={4.1} />
      </Float>

      <EcoShark home={homes.shark} scale={0.95} phase={5.5} />

      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.15}>
        <EcoJelly home={homes.jelly} scale={0.55} phase={1.7} />
      </Float>

      {/* ── the reef floor: sand mounds + coral clusters + seaweed ─────── */}
      <group>
        {/* sand bed spanning the width */}
        <mesh position={[0, floor - 0.85, -0.6]} scale={[w * 0.75, 0.95, 3.2]}>
          <sphereGeometry args={[1, 28, 18]} />
          <meshStandardMaterial color={COL_SAND} roughness={1} />
        </mesh>
        <mesh position={[-w * 0.34, floor - 0.7, -1.2]} scale={[w * 0.3, 0.7, 2.4]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#e8cf96" roughness={1} />
        </mesh>

        {/* left cluster — peeks out from under the About panel */}
        <group position={[-w * 0.33, floor, -0.4]}>
          <BranchCoral position={[0, 0, 0]} color={COL_CORAL_RED} scale={1.15} phase={0.4} />
          <TubeCoral position={[0.75, 0, 0.3]} color={COL_CORAL_ORANGE} scale={0.95} phase={1.2} />
          <Seaweed position={[-0.7, 0, -0.2]} scale={0.9} phase={2.1} />
        </group>

        {/* center cluster */}
        <group position={[-w * 0.04, floor, -0.9]}>
          <FanCoral position={[0, 0, 0]} color={COL_CORAL_MAGENTA} scale={1.25} phase={0.9} />
          <BrainCoral position={[0.7, 0.12, 0.3]} color={COL_CORAL_LAVENDER} scale={1.1} />
          <Seaweed position={[-0.6, 0, 0.2]} scale={1.1} phase={0.2} />
        </group>

        {/* right cluster — under the turtle's patch of water */}
        <group position={[w * 0.27, floor, -0.3]}>
          <BranchCoral position={[0, 0, 0]} color={COL_CORAL_PINK} scale={1.3} phase={1.7} />
          <FanCoral position={[0.9, 0, -0.4]} color={COL_CORAL_ORANGE} scale={0.9} phase={2.6} />
          <TubeCoral position={[-0.8, 0, 0.25]} color={COL_CORAL_RED} scale={0.85} phase={0.6} />
          <BrainCoral position={[1.5, 0.1, 0.2]} color={COL_CORAL_MAGENTA} scale={0.85} />
        </group>
      </group>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Post Processing — gentle bloom; the scene is bright so keep the
   threshold high or everything washes out.
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
      <Bloom luminanceThreshold={0.75} luminanceSmoothing={0.9} intensity={0.7} />
    </EffectComposer>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────────────────────── */
interface TurtleMascot3DProps {
  height?: number | string;
  showHud?: boolean;
  /** Full-bleed section background mode: transparent, borderless, school
      skewed right so the layered About copy stays clear. */
  fullBleed?: boolean;
}

export default function TurtleMascot3D({
  height = 360,
  showHud = false,
  fullBleed = false,
}: TurtleMascot3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    bindCursorListener();
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={`turtle3d ${fullBleed ? 'turtle3d--fullbleed' : ''}`}
      style={{ height }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0.1, 9], fov: 45 }}
        dpr={isMobile ? [1, 1.15] : [1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Sunlit water: warm key light from above, bright cool fill */}
        <ambientLight intensity={0.85} color="#dffaf5" />
        <directionalLight position={[2, 8, 4]} intensity={1.6} color="#fff4d6" />
        <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#9be8ff" />
        <pointLight position={[3, -2, 3]} intensity={0.4} color="#ffd1a3" />

        <Suspense fallback={null}>
          <ReefScene fullBleed={fullBleed} isHovered={isHovered} />
          <PostProcessingWrapper />
        </Suspense>
      </Canvas>

      {showHud && (
        <div className="turtle3d__hud" aria-hidden="true">
          <span className="turtle3d__hud-label">Reef · live</span>
          <span className="turtle3d__hud-status">the locals follow your cursor</span>
        </div>
      )}
    </div>
  );
}
