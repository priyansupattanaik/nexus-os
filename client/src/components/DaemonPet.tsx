import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks } from "@/lib/api";
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
          setMessage("Overload Warning");
        } else if (done > 0 && Math.random() > 0.5) {
          setMood("HAPPY");
          setMessage("Optimal State");
        } else {
          const hour = new Date().getHours();
          if (hour > 22 || hour < 6) {
            setMood("SLEEP");
            setMessage("Recharging");
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
        return <Smile className="w-16 h-16 text-emerald-500 animate-bounce" />;
      case "ANXIOUS":
        return <Frown className="w-16 h-16 text-rose-500 animate-pulse" />;
      case "SLEEP":
        return <Moon className="w-16 h-16 text-indigo-400 opacity-80" />;
      default:
        return <Bot className="w-16 h-16 text-slate-600" />;
    }
  };

  return (
    <div className="zenith-card h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gray-50/50 -z-10" />

      <div className="z-10 mb-6 drop-shadow-sm transition-all duration-500 bg-white p-4 rounded-full shadow-sm border border-gray-100">
        {getIcon()}
      </div>

      <div className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-sky-500" />
          <span>{message}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <Battery
            className={`w-4 h-4 ${battery < 20 ? "text-rose-500" : "text-emerald-500"}`}
          />
          <span>{battery.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
