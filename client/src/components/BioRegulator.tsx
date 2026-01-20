import { useEffect, useState } from "react";
import { useSystemStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function BioRegulator() {
  const { isBioActive, setBioActive } = useSystemStore();
  const [phase, setPhase] = useState("READY");

  useEffect(() => {
    if (!isBioActive) {
      setPhase("READY");
      return;
    }

    // Sync with CoreScene logic (10s cycle)
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
    <div className="holo-panel flex flex-col items-center justify-center p-4 min-h-[160px] relative overflow-hidden group">
      <div
        className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${phase === "INHALE" ? "bg-blue-500" : phase === "HOLD" ? "bg-purple-500" : phase === "EXHALE" ? "bg-green-500" : "bg-transparent"}`}
      />

      <h2 className="text-[var(--nexus-secondary)] font-bold tracking-widest text-[10px] uppercase mb-4 z-10">
        Bio-Regulator
      </h2>

      <div className="flex-1 flex items-center justify-center z-10">
        {isBioActive ? (
          <div className="text-center">
            <p className="text-2xl font-bold text-white tracking-widest animate-pulse">
              {phase}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">SYNC WITH CORE</p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center">
            STRESS DETECTED?
            <br />
            INITIATE PROTOCOL.
          </p>
        )}
      </div>

      <Button
        onClick={() => setBioActive(!isBioActive)}
        className={`mt-3 w-full h-8 text-[10px] uppercase tracking-wider ${isBioActive ? "bg-red-500/20 text-red-400 border-red-500/50" : "holo-button"}`}
      >
        {isBioActive ? "Terminate" : "Start Sequence"}
      </Button>
    </div>
  );
}
