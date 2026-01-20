import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Float,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";

function NeuralCore() {
  const coreRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    // Core Pulse
    const t = state.clock.getElapsedTime();
    const pulse = Math.sin(t * 2) * 0.1 + 1; // Pulse between 0.9 and 1.1
    coreRef.current.scale.set(pulse, pulse, pulse);
    coreRef.current.rotation.y += delta * 0.2;

    // Ring Rotations (Different speeds/axes)
    ring1Ref.current.rotation.x += delta * 0.5;
    ring1Ref.current.rotation.y += delta * 0.3;

    ring2Ref.current.rotation.x -= delta * 0.3;
    ring2Ref.current.rotation.z += delta * 0.4;

    ring3Ref.current.rotation.y -= delta * 0.6;
    ring3Ref.current.rotation.x += delta * 0.2;
  });

  return (
    <group scale={[1.5, 1.5, 1.5]}>
      {/* Central Nucleus */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#2563eb"
            emissiveIntensity={2}
            wireframe={true}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Inner Glow */}
        <mesh>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshBasicMaterial color="#60a5fa" />
        </mesh>
      </Float>

      {/* Orbital Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#60a5fa"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Orbital Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.3, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#60a5fa"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Orbital Ring 3 (Vertical) */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.8, 0.03, 16, 100]} />
        <meshStandardMaterial
          color="#bfdbfe"
          emissive="#93c5fd"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function CoreScene() {
  return (
    <div className="w-full h-full min-h-[500px] bg-black/0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />

        {/* Lighting */}
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

        {/* The Construct */}
        <NeuralCore />

        {/* Environment */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
