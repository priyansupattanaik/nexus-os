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
    <>
      {/* Mobile Spacer to prevent content being hidden behind dock */}
      <div className="h-20 w-full md:hidden" />

      <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 z-[2000]">
        <div
          className="flex items-center justify-between md:justify-center md:gap-3 px-6 py-4 md:py-3 
              bg-black/90 md:bg-black/40 backdrop-blur-2xl 
              border-t md:border border-white/10 md:rounded-2xl 
              shadow-2xl md:hover:scale-[1.02] transition-all overflow-x-auto no-scrollbar"
        >
          {APPS.map((app) => {
            const isOpen =
              windows[app.id].isOpen && !windows[app.id].isMinimized;
            const isActive = activeWindow === app.id;

            return (
              <button
                key={app.id}
                onClick={() => toggleWindow(app.id)}
                className="group relative flex flex-col items-center gap-1 min-w-[3rem] md:min-w-0"
              >
                {/* Desktop Tooltip */}
                <span className="hidden md:block absolute -top-10 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                  {app.label}
                </span>

                {/* Icon Box */}
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border transition-all duration-300 
                              ${
                                isActive
                                  ? "bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                  : "bg-transparent border-transparent hover:bg-white/5"
                              }`}
                >
                  <app.icon
                    className={`w-5 h-5 md:w-6 md:h-6 ${app.color} transition-transform md:group-hover:scale-110`}
                  />
                </div>

                {/* Active Dot */}
                <div
                  className={`w-1 h-1 rounded-full bg-white transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
