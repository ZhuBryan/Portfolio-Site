import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { usePeekerBehavior, type PeekerLook } from './peekerBehavior';

/**
 * ReefPeeker3D — the real 3D octopus. Lazy-loaded as its own chunk so three /
 * @react-three never touch the main bundle. Mirrors the SVG peeker's behaviour
 * exactly (shared usePeekerBehavior): looks toward the cursor, idle-bobs, and
 * ducks behind the coral via the wrapper's `is-hiding` translate.
 *
 * Model: "Octopus" by jeremy (poly.pizza), CC-BY 3.0.
 * (public/models/octopus.glb)
 */

const MODEL_URL = '/models/octopus.glb';
useGLTF.preload(MODEL_URL);

const DEG = Math.PI / 180;
// The GLB's face points down +X (screen right) natively; -90° brings it
// around to +Z so it looks at the viewer, and the tracking yaw swings
// around that.
const MODEL_YAW = -Math.PI / 2;

function OctopusModel({ look }: { look: React.MutableRefObject<PeekerLook> }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  // Clone and normalize scale via the un-posed geometry bounding box: measure
  // each mesh's geometry.boundingBox × its world matrix and union them. Box3
  // .setFromObject() over-counts node scale on some (rigged) exports; this
  // model is OBJ-derived and probably unrigged, so a plain box would be fine —
  // but the per-geometry method is robust either way.
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry) {
        m.frustumCulled = false;
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        tmp.copy(m.geometry.boundingBox as THREE.Box3).applyMatrix4(m.matrixWorld);
        box.union(tmp);
      }
    });
    const dims = box.getSize(new THREE.Vector3());
    const maxd = Math.max(dims.x, dims.y, dims.z) || 1;
    const s = 2.4 / maxd; // target ~2.4 world units for the largest dimension
    clone.scale.setScalar(s);
    // recenter so the bounding-box centre sits on the group origin
    clone.position.sub(box.getCenter(new THREE.Vector3()).multiplyScalar(s));
    return clone;
  }, [scene]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.getElapsedTime();
    const lx = look.current.x; // -1..1
    const ly = look.current.y; // -1..1
    // Rotate to look at the cursor. Amplified well past the SVG's subtle tilt —
    // a round cartoon model needs a big obvious head-turn to read as tracking.
    const targetY = MODEL_YAW + lx * 48 * DEG;
    const targetX = -ly * 24 * DEG;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.14);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.14);
    // lean slightly toward the cursor + gentle idle bob
    g.position.x = THREE.MathUtils.lerp(g.position.x, lx * 0.28, 0.1);
    g.position.y = Math.sin(t * 1.2) * 0.07;
  });

  return (
    <group ref={groupRef} rotation={[0, MODEL_YAW, 0]}>
      <primitive object={model} />
    </group>
  );
}

export default function ReefPeeker3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const look = useRef<PeekerLook>({ x: 0, y: 0 });
  usePeekerBehavior(wrapRef, look);

  return (
    <div ref={wrapRef} className="reef-peeker reef-peeker--3d" aria-hidden="true">
      <Canvas
        className="reef-peeker__canvas"
        camera={{ position: [0, 0, 4], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* bright, even lighting so the bigger model pops against the deep bg */}
        <ambientLight intensity={1.35} color="#ffffff" />
        <directionalLight position={[2, 4, 3]} intensity={1.95} color="#fff4e0" />
        <directionalLight position={[-3, 1, -2]} intensity={0.75} color="#bde8ff" />
        <Suspense fallback={null}>
          <OctopusModel look={look} />
        </Suspense>
      </Canvas>
    </div>
  );
}
