import { useEffect, useState } from "react";
import { useSystemStore } from "@/lib/store";
import { Power } from "lucide-react";

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
    <div className="flex flex-col h-full p-5 items-center justify-center relative overflow-hidden bg-black/20">
      {/* Breathing Circle */}
      <div
        className={`absolute w-40 h-40 rounded-full border-2 transition-all duration-[4000ms] ease-in-out ${
          isBioActive
            ? phase === "INHALE"
              ? "scale-150 border-blue-400/50 bg-blue-400/10"
              : phase === "HOLD"
                ? "scale-150 border-violet-400/50 bg-violet-400/10"
                : "scale-75 border-emerald-400/50 bg-emerald-400/10"
            : "scale-100 border-white/5 opacity-50"
        }`}
      />

      <div className="z-10 text-center mb-8">
        {isBioActive ? (
          <>
            <div className="text-3xl font-bold text-white tracking-widest drop-shadow-lg">
              {phase}
            </div>
            <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">
              Follow the rhythm
            </div>
          </>
        ) : (
          <div className="text-xs font-medium text-slate-500">
            System stress detected?
            <br />
            Initiate calming protocol.
          </div>
        )}
      </div>

      <button
        onClick={() => setBioActive(!isBioActive)}
        className={`os-btn z-10 px-8 ${isBioActive ? "os-btn-danger" : "border-white/10 hover:border-white/30"}`}
      >
        <Power className="w-3.5 h-3.5" />{" "}
        {isBioActive ? "End Session" : "Begin"}
      </button>
    </div>
  );
}
