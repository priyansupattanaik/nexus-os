import { useState, useEffect, useRef } from "react";
import { useSystemStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { fetchTasks } from "@/lib/api";
import { Button } from "@/components/ui/button";

const SOUNDS = [
  {
    id: "rain",
    label: "RAIN",
    url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
  },
  {
    id: "thunder",
    label: "STORM",
    url: "https://actions.google.com/sounds/v1/weather/thunder_heavy_rain.ogg",
  },
  {
    id: "city",
    label: "CITY",
    url: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
  }, // Fallback for city drone
  {
    id: "noise",
    label: "STATIC",
    url: "https://actions.google.com/sounds/v1/science_fiction/humming_computer_fans.ogg",
  },
];

export default function FocusMode() {
  const { setFocusMode } = useSystemStore();
  const { session } = useAuth();
  const [time, setTime] = useState(new Date());
  const [activeTask, setActiveTask] = useState<string>("NO ACTIVE DIRECTIVES");

  // Audio Refs
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({
    rain: 0,
    thunder: 0,
    city: 0,
    noise: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session) {
      fetchTasks(session.access_token).then((data) => {
        const pending = data.filter(
          (t: any) => t.status === "todo" || t.status === "in_progress",
        );
        if (pending.length > 0) setActiveTask(pending[0].title);
      });
    }
  }, [session]);

  // Init Audio
  useEffect(() => {
    SOUNDS.forEach((s) => {
      const audio = new Audio(s.url);
      audio.loop = true;
      audio.volume = 0;
      audioRefs.current[s.id] = audio;
    });
    return () => {
      Object.values(audioRefs.current).forEach((a) => a.pause());
    };
  }, []);

  const handleVolume = (id: string, val: number) => {
    setVolumes((prev) => ({ ...prev, [id]: val }));
    const audio = audioRefs.current[id];
    if (audio) {
      if (val > 0 && audio.paused) audio.play().catch(() => {});
      if (val === 0) audio.pause();
      audio.volume = val;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 p-8 items-center">
        {/* Left: Info */}
        <div className="text-center md:text-left space-y-8">
          <div className="space-y-2">
            <h1 className="text-8xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter">
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </h1>
            <p className="text-[var(--nexus-accent)] tracking-[0.5em] text-xs uppercase animate-pulse">
              Focus Protocol Active
            </p>
          </div>
          <div className="holo-panel p-6 border-[var(--nexus-accent)]/30 bg-black/50 backdrop-blur-md">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
              Primary Objective
            </p>
            <h2 className="text-2xl text-white font-medium leading-relaxed">
              {activeTask}
            </h2>
          </div>
          <Button
            onClick={() => setFocusMode(false)}
            className="h-12 px-8 rounded-full border border-red-500/50 text-red-500 hover:bg-red-500/20 uppercase tracking-widest text-xs font-bold"
          >
            Exit Protocol
          </Button>
        </div>

        {/* Right: Environmental Mixer */}
        <div className="holo-panel p-6 bg-black/80 space-y-6">
          <h3 className="text-[var(--nexus-accent)] font-bold tracking-widest text-sm uppercase border-b border-white/10 pb-2">
            Environmental Control
          </h3>
          <div className="flex justify-between gap-4 h-[200px]">
            {SOUNDS.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-3 h-full"
              >
                <div className="flex-1 relative w-2 bg-white/10 rounded-full overflow-hidden group">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-[var(--nexus-accent)] transition-all duration-75"
                    style={{ height: `${volumes[s.id] * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumes[s.id]}
                    onChange={(e) =>
                      handleVolume(s.id, parseFloat(e.target.value))
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-400 rotate-[-45deg] origin-bottom-left translate-x-2">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
