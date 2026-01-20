import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

function SentientOrb() {
  const points = useRef<THREE.Points>(null);

  // Generate 2000 random particles in a sphere
  const sphere = useMemo(() => {
    const temp = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.2 + Math.random() * 0.2; // Radius with slight jitter

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      temp[i * 3] = x;
      temp[i * 3 + 1] = y;
      temp[i * 3 + 2] = z;
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!points.current) return;

    // Rotate the entire system
    points.current.rotation.y = state.clock.elapsedTime * 0.1;
    points.current.rotation.z = state.clock.elapsedTime * 0.05;

    // Pulse effect (Breathing)
    const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    points.current.scale.set(scale, scale, scale);
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={points} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00f3ff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Inner Energy Core */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.82, 32, 32]} />
        <meshBasicMaterial
          color="#00f3ff"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}

export default function CoreScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
      <ambientLight intensity={0.5} />
      {/* Floating Animation for the whole container */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <SentientOrb />
      </Float>
    </Canvas>
  );
}
