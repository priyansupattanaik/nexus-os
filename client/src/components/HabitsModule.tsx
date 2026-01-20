import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchHabits,
  createHabit,
  incrementHabit,
  deleteHabit,
} from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Repeat, Plus, Trash2, Flame } from "lucide-react";

export default function HabitsModule() {
  const { session } = useAuth();
  const { triggerPulse } = useSystemStore();
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    if (session) loadHabits();
  }, [session]);
  const loadHabits = async () => {
    try {
      setHabits(await fetchHabits(session.access_token));
    } catch (e) {}
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!newHabit) return;
    await createHabit(newHabit, session.access_token);
    setNewHabit("");
    triggerPulse("success");
    loadHabits();
  };

  const handleIncrement = async (id: string) => {
    triggerPulse("success");
    await incrementHabit(id, session.access_token);
    loadHabits();
  };

  return (
    <GlassCard title="Protocols" icon={<Repeat />}>
      <div className="flex flex-col h-full p-4 gap-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="New Protocol..."
            className="tech-input flex-1"
          />
          <button type="submit" className="tech-button px-3">
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {habits.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded hover:bg-white/[0.05] transition-colors group"
            >
              <span className="text-sm font-mono text-slate-300">
                {h.title}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[hsl(var(--secondary))] bg-[hsl(var(--secondary)/0.1)] px-2 py-1 rounded">
                  <Flame className="w-3 h-3" />
                  <span className="text-xs font-bold">{h.streak}</span>
                </div>
                <button
                  onClick={() => handleIncrement(h.id)}
                  className="tech-button px-2 py-1 text-xs"
                >
                  +
                </button>
                <button
                  onClick={async () => {
                    await deleteHabit(h.id, session.access_token);
                    loadHabits();
                  }}
                  className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
