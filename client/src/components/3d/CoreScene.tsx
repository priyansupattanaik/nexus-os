import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Environment,
  Float,
  Stars,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

function Tesseract() {
  const mesh = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current || !core.current) return;

    // Slow, hypnotic rotation
    mesh.current.rotation.x = state.clock.elapsedTime * 0.2;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.25;

    // Counter-rotation for the inner core
    core.current.rotation.x = -state.clock.elapsedTime * 0.4;
    core.current.rotation.z = state.clock.elapsedTime * 0.1;

    // Breathing scale effect
    const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.02;
    mesh.current.scale.set(scale, scale, scale);
  });

  return (
    <group>
      {/* Outer Glass Cube */}
      <mesh ref={mesh}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        {/* High-quality glass shader */}
        <MeshTransmissionMaterial
          backside
          samples={4} // Quality
          thickness={0.5} // Thickness of the glass
          chromaticAberration={0.1} // Prism effect (rainbow edges)
          anisotropy={0.1}
          distortion={0.1} // Slight warp
          distortionScale={0.1}
          temporalDistortion={0.2}
          iridescence={0.5}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          roughness={0.1} // Smooth but not perfect
          clearcoat={1}
          color={"#eef2ff"} // Slight blue tint
        />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh ref={core}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          emissive="#0A84FF" // iOS Blue Glow
          emissiveIntensity={4}
          toneMapped={false}
          color="#000000"
        />
      </mesh>
    </group>
  );
}

export default function CoreScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      {/* Lighting environment */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0A84FF" />

      {/* Studio lighting reflection for the glass */}
      <Environment preset="city" />

      {/* Floating Animation Wrapper */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Tesseract />
      </Float>

      {/* Background Particles */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <Sparkles
        count={50}
        scale={5}
        size={2}
        speed={0.4}
        opacity={0.5}
        color="#0A84FF"
      />
    </Canvas>
  );
}
