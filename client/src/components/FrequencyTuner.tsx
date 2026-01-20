import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Radio, StopCircle, PlayCircle } from "lucide-react";

const PRESETS = [
  { name: "Deep Focus", base: 400, beat: 40, color: "blue" },
  { name: "Relaxation", base: 200, beat: 10, color: "emerald" },
  { name: "Deep Sleep", base: 100, beat: 4, color: "violet" },
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
    <GlassCard title="Binaural Tuner" icon={<Radio />}>
      <div className="flex flex-col h-full p-5 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => (activePreset === p.name ? stop() : play(p))}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-300 group ${activePreset === p.name ? "bg-white text-black border-white shadow-lg shadow-white/10" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
          >
            <span className="text-xs font-bold uppercase tracking-wide">
              {p.name}
            </span>
            {activePreset === p.name ? (
              <StopCircle className="w-4 h-4 text-red-500" />
            ) : (
              <PlayCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
            )}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
