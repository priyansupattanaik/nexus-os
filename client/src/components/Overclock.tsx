import { useState, useEffect } from "react";
import { useSystemStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function Overclock() {
  const { isOverclockActive, setOverclockActive, setOverclockProgress } =
    useSystemStore();
  const [duration, setDuration] = useState(25); // Minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    let interval: any;
    if (isOverclockActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const val = prev - 1;
          // Update global progress (0 to 1) for Core Color
          const total = duration * 60;
          setOverclockProgress(1 - val / total);
          return val;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setOverclockActive(false);
      setOverclockProgress(0);
      // Play Alarm
      new Audio(
        "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
      ).play();
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
    <div className="holo-panel flex flex-col p-4 min-h-[160px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[var(--nexus-accent)] font-bold tracking-widest text-[10px] uppercase">
          Overclock
        </h2>
        <div className="flex gap-1">
          {[15, 25, 45].map((m) => (
            <button
              key={m}
              onClick={() => {
                setDuration(m);
                setTimeLeft(m * 60);
              }}
              className={`text-[8px] px-1 border ${duration === m ? "border-white text-white" : "border-gray-700 text-gray-500"}`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <span
          className={`text-4xl font-mono font-bold ${isOverclockActive ? (timeLeft < 60 ? "text-red-500 animate-ping" : "text-white") : "text-gray-600"}`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      <Button
        onClick={toggleTimer}
        className={`w-full h-8 text-[10px] uppercase ${isOverclockActive ? "bg-red-500/10 text-red-500 border-red-500" : "holo-button"}`}
      >
        {isOverclockActive ? "Abort Cycle" : "Engage"}
      </Button>
    </div>
  );
}
