import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { useSystemStore } from "@/lib/store";

function SentientOrb() {
  const points = useRef<THREE.Points>(null);
  const { mode } = useSystemStore();

  // State-based configurations
  const config = useMemo(() => {
    switch (mode) {
      case "LISTENING":
        return { color: "#ff3333", speed: 2.5, scale: 1.2 }; // Red/Fast
      case "PROCESSING":
        return { color: "#aa00ff", speed: 0.5, scale: 0.8 }; // Purple/Slow
      case "SUCCESS":
        return { color: "#00ff9d", speed: 3.0, scale: 1.5 }; // Green/Explosive
      case "ERROR":
        return { color: "#ff0000", speed: 0.2, scale: 0.5 }; // Red/Dead
      default:
        return { color: "#00f3ff", speed: 0.15, scale: 1.0 }; // Cyan/Idle
    }
  }, [mode]);

  // Generate particles
  const sphere = useMemo(() => {
    const temp = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.2 + Math.random() * 0.2;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      temp[i * 3] = x;
      temp[i * 3 + 1] = y;
      temp[i * 3 + 2] = z;
    }
    return temp;
  }, []);

  // Material Ref for color lerping
  const matRef = useRef<THREE.PointsMaterial>(null);

  useFrame((state) => {
    if (!points.current || !matRef.current) return;

    // Smooth transition for rotation speed
    points.current.rotation.y += config.speed * 0.01;
    points.current.rotation.z += config.speed * 0.005;

    // Breathing/Pulse Effect
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * (mode === "LISTENING" ? 4 : 1.5)) * 0.05;

    // Smoothly lerp scale
    points.current.scale.lerp(
      new THREE.Vector3(
        config.scale * pulse,
        config.scale * pulse,
        config.scale * pulse,
      ),
      0.1,
    );

    // Smoothly lerp color
    const targetColor = new THREE.Color(config.color);
    matRef.current.color.lerp(targetColor, 0.05);
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={points} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          ref={matRef}
          transparent
          color="#00f3ff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Core Glow */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

export default function CoreScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <SentientOrb />
      </Float>
    </Canvas>
  );
}
