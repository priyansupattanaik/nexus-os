import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bot, Zap, Battery, Activity } from "lucide-react";

const STATES = {
  IDLE: "( ^_^)db",
  HAPPY: "( ◕‿◕ )",
  ANXIOUS: "( ◎_◎;)",
  SLEEP: "( -_-)zzZ",
};

export default function DaemonPet() {
  const { session } = useAuth();
  const [mood, setMood] = useState(STATES.IDLE);
  const [message, setMessage] = useState("System Normal");
  const [battery, setBattery] = useState(100);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      // Mock Battery Drain based on time
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
          setMood(STATES.ANXIOUS);
          setMessage("Overload");
        } else if (done > 0 && Math.random() > 0.5) {
          setMood(STATES.HAPPY);
          setMessage("Optimal");
        } else {
          const hour = new Date().getHours();
          if (hour > 22 || hour < 6) {
            setMood(STATES.SLEEP);
            setMessage("Recharging");
          } else {
            setMood(STATES.IDLE);
            setMessage("Standby");
          }
        }
      } catch (e) {}
    };
    checkStatus();
    const statusInterval = setInterval(checkStatus, 10000);
    return () => clearInterval(statusInterval);
  }, [session]);

  return (
    <GlassCard title="Daemon.v1" icon={<Bot />}>
      <div className="flex flex-col items-center justify-center h-full p-4 relative overflow-hidden">
        {/* Background Pulse */}
        <div className="absolute inset-0 bg-[hsl(var(--primary)/0.05)] animate-pulse" />

        <div className="text-4xl font-mono text-[hsl(var(--primary))] mb-4 animate-bounce z-10 filter drop-shadow-[0_0_10px_hsl(var(--primary))]">
          {mood}
        </div>

        <div className="w-full flex justify-between text-[10px] font-mono text-slate-400 z-10 px-2">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>{message}</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3" />
            <span>{battery.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
