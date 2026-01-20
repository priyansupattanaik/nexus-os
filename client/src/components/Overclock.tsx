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
    <GlassCard title="Overclock" icon={<Timer />}>
      <div className="flex flex-col h-full p-4 items-center justify-between">
        <div className="flex gap-1 mb-2">
          {[15, 25, 45].map((m) => (
            <button
              key={m}
              onClick={() => {
                setDuration(m);
                setTimeLeft(m * 60);
              }}
              className={`text-[10px] px-2 py-1 border rounded transition-colors ${duration === m ? "border-white text-white" : "border-white/10 text-gray-500 hover:border-white/30"}`}
            >
              {m}m
            </button>
          ))}
        </div>

        <div
          className={`text-4xl font-mono font-bold ${isOverclockActive ? (timeLeft < 60 ? "text-red-500 animate-ping" : "text-white") : "text-slate-600"}`}
        >
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={toggleTimer}
          className={`tech-button w-full mt-2 ${isOverclockActive ? "border-red-500/50 text-red-500 hover:bg-red-500/10" : ""}`}
        >
          {isOverclockActive ? (
            <Square className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3" />
          )}
          {isOverclockActive ? "ABORT" : "ENGAGE"}
        </button>
      </div>
    </GlassCard>
  );
}
