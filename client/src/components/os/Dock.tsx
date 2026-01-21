import { useSystemStore, AppID } from "@/lib/store";
import {
  CheckSquare,
  DollarSign,
  Repeat,
  Book,
  Music,
  Zap,
  BrainCircuit,
  HeartPulse,
  Timer,
  Radio,
} from "lucide-react";

const APPS: { id: AppID; label: string; icon: any; color: string }[] = [
  { id: "tasks", label: "Tasks", icon: CheckSquare, color: "text-blue-400" },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "text-emerald-400",
  },
  { id: "habits", label: "Habits", icon: Repeat, color: "text-amber-400" },
  { id: "journal", label: "Journal", icon: Book, color: "text-slate-300" },
  { id: "music", label: "Music", icon: Music, color: "text-violet-400" },
  { id: "dream", label: "Dream", icon: BrainCircuit, color: "text-pink-400" },
  { id: "bio", label: "Bio", icon: HeartPulse, color: "text-red-400" },
  { id: "overclock", label: "Focus", icon: Timer, color: "text-orange-400" },
  { id: "tuner", label: "Tuner", icon: Radio, color: "text-cyan-400" },
];

export default function Dock() {
  const { toggleWindow, windows, activeWindow } = useSystemStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-end gap-3 px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.02]">
        {APPS.map((app) => {
          const isOpen = windows[app.id].isOpen;
          const isActive = activeWindow === app.id;

          return (
            <button
              key={app.id}
              onClick={() => toggleWindow(app.id)}
              className="group relative flex flex-col items-center gap-1 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Tooltip */}
              <span className="absolute -top-10 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                {app.label}
              </span>

              {/* Icon Box */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${isOpen ? "bg-white/10 border-white/20" : "bg-transparent border-transparent hover:bg-white/5"}`}
              >
                <app.icon
                  className={`w-6 h-6 ${app.color} transition-transform group-hover:scale-110`}
                />
              </div>

              {/* Active Dot */}
              <div
                className={`w-1 h-1 rounded-full bg-white transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
