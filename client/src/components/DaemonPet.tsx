import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bot, Zap, Battery, Activity, Smile, Frown, Moon } from "lucide-react";

export default function DaemonPet() {
  const { session } = useAuth();
  const [mood, setMood] = useState("IDLE");
  const [message, setMessage] = useState("System Normal");
  const [battery, setBattery] = useState(100);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setBattery((prev) => Math.max(0, prev - 0.5));
    }, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const checkStatus = async () => {
      try {
        const tasks = await fetchTasks(session.access_token);
        const pending = tasks.filter((t: any) => t.status === "todo").length;
        const done = tasks.filter((t: any) => t.status === "done").length;

        if (pending > 5) {
          setMood("ANXIOUS");
          setMessage("Overload Detected");
        } else if (done > 0 && Math.random() > 0.5) {
          setMood("HAPPY");
          setMessage("Optimal Efficiency");
        } else {
          const hour = new Date().getHours();
          if (hour > 22 || hour < 6) {
            setMood("SLEEP");
            setMessage("Recharging...");
          } else {
            setMood("IDLE");
            setMessage("Standing By");
          }
        }
      } catch (e) {}
    };
    checkStatus();
    const statusInterval = setInterval(checkStatus, 10000);
    return () => clearInterval(statusInterval);
  }, [session]);

  const getIcon = () => {
    switch (mood) {
      case "HAPPY":
        return <Smile className="w-12 h-12 text-emerald-400 animate-bounce" />;
      case "ANXIOUS":
        return <Frown className="w-12 h-12 text-rose-400 animate-pulse" />;
      case "SLEEP":
        return <Moon className="w-12 h-12 text-violet-400 opacity-50" />;
      default:
        return <Bot className="w-12 h-12 text-blue-400" />;
    }
  };

  return (
    <GlassCard title="Daemon" icon={<Zap />}>
      <div className="flex flex-col items-center justify-center h-full p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />

        <div className="z-10 mb-3 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500">
          {getIcon()}
        </div>

        <div className="w-full flex justify-between items-center px-3 py-2 rounded-xl bg-black/20 border border-white/5 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
            <Activity className="w-3 h-3 text-blue-400" />
            <span>{message}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <Battery
              className={`w-3 h-3 ${battery < 20 ? "text-red-500" : "text-emerald-500"}`}
            />
            <span>{battery.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
