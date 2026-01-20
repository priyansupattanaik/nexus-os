import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks } from "@/lib/api";

// ASCII Faces for the Pet
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

  useEffect(() => {
    if (!session) return;

    const checkStatus = async () => {
      try {
        const tasks = await fetchTasks(session.access_token);
        const pending = tasks.filter((t: any) => t.status === "todo").length;
        const done = tasks.filter((t: any) => t.status === "done").length;

        // Logic: Too many pending tasks = Anxious. Recent completions = Happy.
        if (pending > 5) {
          setMood(STATES.ANXIOUS);
          setMessage("Overload Detected");
        } else if (done > 0 && Math.random() > 0.5) {
          setMood(STATES.HAPPY);
          setMessage("Good Efficiency");
        } else {
          const hour = new Date().getHours();
          if (hour > 22 || hour < 6) {
            setMood(STATES.SLEEP);
            setMessage("Recharging...");
          } else {
            setMood(STATES.IDLE);
            setMessage("Awaiting Input");
          }
        }
      } catch (e) {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className="holo-panel flex flex-col items-center justify-center p-4 min-h-[140px] relative overflow-hidden group">
      <div className="absolute inset-0 bg-[var(--nexus-accent)] opacity-5 transition-opacity group-hover:opacity-10" />

      <div className="text-[10px] font-bold text-[var(--nexus-secondary)] uppercase tracking-widest absolute top-3 left-3">
        Daemon.v1
      </div>

      <div className="text-4xl font-mono text-[var(--nexus-accent)] mb-2 animate-bounce transition-all duration-500">
        {mood}
      </div>

      <div className="text-xs font-mono text-gray-400 bg-black/40 px-2 py-1 rounded border border-white/10">
        STATUS: {message}
      </div>
    </div>
  );
}
