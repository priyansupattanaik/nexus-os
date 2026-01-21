import { useEffect, useState } from "react";
import { useSystemStore } from "@/lib/store";
import { Power, HeartPulse } from "lucide-react";

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
    <div className="zenith-card h-full flex flex-col p-6 items-center justify-center relative overflow-hidden bg-white">
      <div className="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <HeartPulse className="w-4 h-4" /> Bio-Sync
      </div>

      {/* Breathing Circle */}
      <div
        className={`absolute w-48 h-48 rounded-full border-[3px] transition-all duration-[4000ms] ease-in-out ${
          isBioActive
            ? phase === "INHALE"
              ? "scale-125 border-sky-300 bg-sky-50"
              : phase === "HOLD"
                ? "scale-125 border-indigo-300 bg-indigo-50"
                : "scale-90 border-emerald-300 bg-emerald-50"
            : "scale-100 border-gray-100 bg-gray-50"
        }`}
      />

      <div className="z-10 text-center mb-8">
        {isBioActive ? (
          <>
            <div className="text-3xl font-bold text-gray-800 tracking-widest">
              {phase}
            </div>
            <div className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-semibold">
              Follow the rhythm
            </div>
          </>
        ) : (
          <div className="text-sm font-medium text-gray-500">
            Detecting stress markers.
            <br />
            Initiate regulation?
          </div>
        )}
      </div>

      <button
        onClick={() => setBioActive(!isBioActive)}
        className={`zenith-btn z-10 px-8 ${isBioActive ? "zenith-btn-danger" : "border-gray-200 hover:border-gray-300 bg-white"}`}
      >
        <Power className="w-4 h-4" /> {isBioActive ? "End Session" : "Start"}
      </button>
    </div>
  );
}
