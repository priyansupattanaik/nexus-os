import { useState, useRef, useEffect } from "react";
import { StopCircle, PlayCircle, Radio } from "lucide-react";

const PRESETS = [
  { name: "Deep Focus", base: 400, beat: 40 },
  { name: "Relaxation", base: 200, beat: 10 },
  { name: "Deep Sleep", base: 100, beat: 4 },
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
    <div className="zenith-card h-full flex flex-col p-6 gap-4 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
        <Radio className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Binaural Tuner
        </span>
      </div>

      {PRESETS.map((p) => (
        <button
          key={p.name}
          onClick={() => (activePreset === p.name ? stop() : play(p))}
          className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border transition-all duration-200 group ${
            activePreset === p.name
              ? "bg-sky-50 border-sky-200 text-sky-700 shadow-sm"
              : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
          }`}
        >
          <span className="text-sm font-bold uppercase tracking-wide">
            {p.name}
          </span>
          {activePreset === p.name ? (
            <StopCircle className="w-5 h-5 text-rose-500" />
          ) : (
            <PlayCircle className="w-5 h-5 text-gray-300 group-hover:text-sky-500" />
          )}
        </button>
      ))}
    </div>
  );
}
