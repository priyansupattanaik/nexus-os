import { useEffect, useState } from "react";
import { useSystemStore } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { HeartPulse, Power } from "lucide-react";

export default function BioRegulator() {
  const { isBioActive, setBioActive } = useSystemStore();
  const [phase, setPhase] = useState("READY");

  useEffect(() => {
    if (!isBioActive) {
      setPhase("READY");
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % 10000;
      if (elapsed < 4000) setPhase("INHALE");
      else if (elapsed < 7000) setPhase("HOLD");
      else setPhase("EXHALE");
    }, 100);
    return () => clearInterval(interval);
  }, [isBioActive]);

  return (
    <GlassCard title="Bio-Sync" icon={<HeartPulse />}>
      <div className="flex flex-col h-full p-4 items-center justify-center relative overflow-hidden">
        {isBioActive && (
          <div
            className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${phase === "INHALE" ? "bg-blue-500" : phase === "HOLD" ? "bg-purple-500" : "bg-green-500"}`}
          />
        )}

        <div className="z-10 text-center mb-4">
          {isBioActive ? (
            <>
              <div className="text-2xl font-bold text-white tracking-widest animate-pulse">
                {phase}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                SYNC WITH CORE
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500">
              STRESS DETECTED?
              <br />
              INITIATE PROTOCOL.
            </div>
          )}
        </div>

        <button
          onClick={() => setBioActive(!isBioActive)}
          className={`tech-button w-full z-10 ${isBioActive ? "border-red-500/50 text-red-500 hover:bg-red-500/10" : ""}`}
        >
          <Power className="w-3 h-3" /> {isBioActive ? "TERMINATE" : "START"}
        </button>
      </div>
    </GlassCard>
  );
}
