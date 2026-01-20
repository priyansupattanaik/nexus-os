import { useState, useEffect } from "react";
import { useSystemStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { fetchTasks } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function FocusMode() {
  const { setFocusMode } = useSystemStore();
  const { session } = useAuth();
  const [time, setTime] = useState(new Date());
  const [activeTask, setActiveTask] = useState<string>("NO ACTIVE TASKS");
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState(false);
  const [audio] = useState(
    new Audio("https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg"),
  );

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Top Priority Task
  useEffect(() => {
    if (session) {
      fetchTasks(session.access_token).then((data) => {
        const pending = data.filter((t: any) => !t.is_completed);
        if (pending.length > 0) setActiveTask(pending[0].title);
      });
    }
  }, [session]);

  // Ambient Noise Toggle
  const toggleAmbience = () => {
    if (isAmbiencePlaying) {
      audio.pause();
      setIsAmbiencePlaying(false);
    } else {
      audio.volume = 0.3;
      audio.loop = true;
      audio.play().catch(() => {});
      setIsAmbiencePlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
      {/* Background Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 space-y-12 max-w-2xl px-4">
        {/* Clock */}
        <div className="space-y-2">
          <h1 className="text-7xl md:text-9xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </h1>
          <p className="text-nexus-accent tracking-[0.5em] text-xs uppercase animate-pulse">
            Focus Protocol Active
          </p>
        </div>

        {/* The One Task */}
        <div className="holo-panel p-8 border-nexus-accent/30 bg-black/50 backdrop-blur-md">
          <p className="text-nexus-subtext text-xs uppercase tracking-widest mb-4">
            Current Objective
          </p>
          <h2 className="text-2xl md:text-3xl text-white font-medium leading-relaxed">
            {activeTask}
          </h2>
        </div>

        {/* Controls */}
        <div className="flex gap-6 justify-center">
          <Button
            onClick={toggleAmbience}
            className={`rounded-full w-14 h-14 border ${isAmbiencePlaying ? "border-nexus-success text-nexus-success bg-nexus-success/10" : "border-white/20 text-white/50 hover:text-white"} transition-all`}
          >
            {isAmbiencePlaying ? "🔊" : "🔇"}
          </Button>

          <Button
            onClick={() => setFocusMode(false)}
            className="h-14 px-8 rounded-full border border-nexus-danger/50 text-nexus-danger hover:bg-nexus-danger/20 hover:scale-105 transition-all uppercase tracking-widest text-xs font-bold"
          >
            Exit Protocol
          </Button>
        </div>
      </div>
    </div>
  );
}
