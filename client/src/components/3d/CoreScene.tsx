import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { useSystemStore } from "@/lib/store";

function SentientOrb() {
  const points = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const { mode, isBioActive, isOverclockActive, overclockProgress } =
    useSystemStore();

  // Particle Generation
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

  useFrame((state) => {
    if (!points.current || !matRef.current) return;
    const t = state.clock.elapsedTime;

    // --- LOGIC TREE ---
    if (isBioActive) {
      // BREATHING MODE (4-7-8 Rhythm Simulation)
      // Cycle: 19s (4 in, 7 hold, 8 out).
      // Simplified: Sin wave with distinct phases
      const cycle = t % 10; // 10s cycle for visual simplicity
      let scale = 1;
      let color = new THREE.Color("#00f3ff"); // Default Cyan

      if (cycle < 4) {
        // Inhale (Expand)
        scale = 1 + (cycle / 4) * 0.5;
        color.set("#00f3ff");
      } else if (cycle < 7) {
        // Hold (Static Large)
        scale = 1.5;
        color.set("#7000ff"); // Purple
      } else {
        // Exhale (Contract)
        scale = 1.5 - ((cycle - 7) / 3) * 0.5;
        color.set("#00ff9d"); // Green
      }

      points.current.rotation.y += 0.002;
      points.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);
      matRef.current.color.lerp(color, 0.05);
    } else if (isOverclockActive) {
      // OVERCLOCK MODE (Timer)
      // Color shifts Green -> Yellow -> Red based on progress (0 to 1)
      // Rotation speeds up

      const safeColor = new THREE.Color("#00ff00");
      const dangerColor = new THREE.Color("#ff0000");
      const currentColor = safeColor.lerp(dangerColor, overclockProgress);

      const speed = 0.2 + overclockProgress * 2.0; // Gets chaotic

      points.current.rotation.y += speed * 0.01;
      points.current.rotation.z += speed * 0.01;

      const jitter = 1 + Math.random() * overclockProgress * 0.2;
      points.current.scale.set(jitter, jitter, jitter);
      matRef.current.color.lerp(currentColor, 0.1);
    } else {
      // STANDARD AI MODE
      let config = { color: "#00f3ff", speed: 0.15, scale: 1.0 };
      if (mode === "LISTENING")
        config = { color: "#ff3333", speed: 2.0, scale: 1.2 };
      if (mode === "PROCESSING")
        config = { color: "#aa00ff", speed: 0.5, scale: 0.8 };
      if (mode === "SUCCESS")
        config = { color: "#00ff9d", speed: 3.0, scale: 1.5 };
      if (mode === "ERROR")
        config = { color: "#ff0000", speed: 0.2, scale: 0.5 };

      points.current.rotation.y += config.speed * 0.01;
      points.current.rotation.z += config.speed * 0.005;

      const pulse = 1 + Math.sin(t * (mode === "LISTENING" ? 4 : 1.5)) * 0.05;
      points.current.scale.lerp(
        new THREE.Vector3(
          config.scale * pulse,
          config.scale * pulse,
          config.scale * pulse,
        ),
        0.1,
      );
      matRef.current.color.lerp(new THREE.Color(config.color), 0.05);
    }
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
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
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
