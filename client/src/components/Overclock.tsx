import { useState, useEffect } from "react";
import { useSystemStore } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Timer, Play, Square } from "lucide-react";

export default function Overclock() {
  const { isOverclockActive, setOverclockActive, setOverclockProgress } =
    useSystemStore();
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    let interval: any;
    if (isOverclockActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const val = prev - 1;
          setOverclockProgress(1 - val / (duration * 60));
          return val;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setOverclockActive(false);
      setOverclockProgress(0);
    }
    return () => clearInterval(interval);
  }, [isOverclockActive, timeLeft, duration]);

  const toggleTimer = () => {
    if (isOverclockActive) {
      setOverclockActive(false);
      setOverclockProgress(0);
      setTimeLeft(duration * 60);
    } else {
      setTimeLeft(duration * 60);
      setOverclockActive(true);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <GlassCard title="Focus Timer" icon={<Timer />}>
      <div className="flex flex-col h-full p-5 items-center justify-between">
        {/* Presets */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
          {[15, 25, 45].map((m) => (
            <button
              key={m}
              onClick={() => {
                setDuration(m);
                setTimeLeft(m * 60);
              }}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${duration === m ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              {m}m
            </button>
          ))}
        </div>

        {/* Big Timer */}
        <div
          className={`text-5xl font-mono font-bold tracking-tighter ${isOverclockActive ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400" : "text-slate-500"}`}
        >
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={toggleTimer}
          className={`os-btn w-full ${isOverclockActive ? "os-btn-danger" : "os-btn-primary"}`}
        >
          {isOverclockActive ? (
            <Square className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {isOverclockActive ? "Stop" : "Start"}
        </button>
      </div>
    </GlassCard>
  );
}
