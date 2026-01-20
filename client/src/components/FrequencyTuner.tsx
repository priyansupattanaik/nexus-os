import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Radio, StopCircle, PlayCircle } from "lucide-react";

const PRESETS = [
  { name: "FOCUS", base: 400, beat: 40 },
  { name: "RELAX", base: 200, beat: 10 },
  { name: "SLEEP", base: 100, beat: 4 },
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
    gain.gain.value = 0.1;
    gain.connect(ctx.destination);
    const oscL = ctx.createOscillator();
    oscL.frequency.value = preset.base;
    const panL = ctx.createStereoPanner();
    panL.pan.value = -1;
    const oscR = ctx.createOscillator();
    oscR.frequency.value = preset.base + preset.beat;
    const panR = ctx.createStereoPanner();
    panR.pan.value = 1;
    oscL.connect(panL).connect(gain);
    oscR.connect(panR).connect(gain);
    oscL.start();
    oscR.start();
    oscillatorsRef.current = [oscL, oscR];
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <GlassCard title="Neural Tuner" icon={<Radio />}>
      <div className="flex flex-col h-full p-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => (activePreset === p.name ? stop() : play(p))}
            className={`flex items-center justify-between text-[10px] border rounded p-2 transition-all ${activePreset === p.name ? "bg-[hsl(var(--primary))] text-black border-[hsl(var(--primary))]" : "border-white/10 text-slate-400 hover:border-white/30 hover:bg-white/5"}`}
          >
            <span>{p.name}</span>
            {activePreset === p.name ? (
              <StopCircle className="w-3 h-3" />
            ) : (
              <PlayCircle className="w-3 h-3" />
            )}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
