import { useState, useEffect } from "react";
import { useSystemStore } from "@/lib/store";
import { Play, Square, Timer } from "lucide-react";

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
    <div className="zenith-card h-full flex flex-col p-6 items-center justify-between bg-white">
      <div className="w-full flex justify-between items-center border-b border-gray-100 pb-4 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Timer className="w-4 h-4" /> Focus Session
        </span>

        <div className="flex gap-2">
          {[15, 25, 45].map((m) => (
            <button
              key={m}
              onClick={() => {
                setDuration(m);
                setTimeLeft(m * 60);
              }}
              className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${duration === m ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Big Timer */}
      <div
        className={`text-7xl font-mono font-bold tracking-tighter ${isOverclockActive ? "text-sky-600 animate-pulse" : "text-gray-800"}`}
      >
        {formatTime(timeLeft)}
      </div>

      <button
        onClick={toggleTimer}
        className={`zenith-btn w-full py-4 text-sm ${isOverclockActive ? "zenith-btn-danger" : "zenith-btn-primary"}`}
      >
        {isOverclockActive ? (
          <Square className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isOverclockActive ? "Stop Session" : "Start Focus"}
      </button>
    </div>
  );
}
