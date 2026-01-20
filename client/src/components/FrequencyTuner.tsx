import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { name: "FOCUS", base: 400, beat: 40 }, // Gamma
  { name: "RELAX", base: 200, beat: 10 }, // Alpha
  { name: "SLEEP", base: 100, beat: 4 }, // Theta
];

export default function FrequencyTuner() {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const stop = () => {
    oscillatorsRef.current.forEach((osc) => osc.stop());
    oscillatorsRef.current = [];
    if (audioCtxRef.current) audioCtxRef.current.close();
    audioCtxRef.current = null;
    setActivePreset(null);
  };

  const play = (preset: (typeof PRESETS)[0]) => {
    stop();
    setActivePreset(preset.name);

    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = 0.1; // Low volume
    gain.connect(ctx.destination);

    // Left Ear
    const oscL = ctx.createOscillator();
    oscL.frequency.value = preset.base;
    const panL = ctx.createStereoPanner();
    panL.pan.value = -1;
    oscL.connect(panL).connect(gain);

    // Right Ear
    const oscR = ctx.createOscillator();
    oscR.frequency.value = preset.base + preset.beat;
    const panR = ctx.createStereoPanner();
    panR.pan.value = 1;
    oscR.connect(panR).connect(gain);

    oscL.start();
    oscR.start();
    oscillatorsRef.current = [oscL, oscR];
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <div className="holo-panel flex flex-col p-4 min-h-[160px]">
      <h2 className="text-white font-bold tracking-widest text-[10px] uppercase mb-4">
        Neural Tuner
      </h2>

      <div className="flex-1 grid grid-cols-1 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => (activePreset === p.name ? stop() : play(p))}
            className={`text-[10px] border rounded py-1 transition-all ${activePreset === p.name ? "bg-[var(--nexus-accent)] text-black border-[var(--nexus-accent)]" : "border-white/10 text-gray-400 hover:border-white/30"}`}
          >
            {p.name} <span className="opacity-50 text-[8px]">({p.beat}Hz)</span>
          </button>
        ))}
      </div>
    </div>
  );
}
