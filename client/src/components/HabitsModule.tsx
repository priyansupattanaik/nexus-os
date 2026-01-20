import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchHabits,
  createHabit,
  incrementHabit,
  deleteHabit,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSystemStore } from "@/lib/store";

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

  const handleDelete = async (id: string) => {
    triggerPulse("error");
    await deleteHabit(id, session.access_token);
    loadHabits();
  };

  return (
    <div className="flex flex-col h-full bg-nexus-panel/50 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(112,0,255,0.1)]">
      <div className="p-4 border-b border-nexus-border/30 bg-black/20">
        <h2 className="text-nexus-secondary font-bold tracking-widest text-sm uppercase">
          Habits
        </h2>
      </div>
      <form onSubmit={handleAdd} className="p-3 flex gap-2">
        <Input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New habit..."
          className="holo-input h-9 text-xs"
        />
        <Button
          type="submit"
          className="holo-button h-9 border-nexus-secondary/30 text-nexus-secondary hover:bg-nexus-secondary/10"
        >
          +
        </Button>
      </form>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {habits.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between p-3 bg-black/30 border border-nexus-secondary/20 rounded hover:border-nexus-secondary/50 transition-colors"
          >
            <span className="text-nexus-text text-sm font-mono">{h.title}</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-nexus-secondary font-bold tracking-wider">
                STREAK: {h.streak}
              </span>
              <Button
                size="sm"
                onClick={() => handleIncrement(h.id)}
                className="h-6 w-6 p-0 bg-nexus-secondary/20 text-nexus-secondary border border-nexus-secondary/50 hover:bg-nexus-secondary hover:text-white transition-all"
              >
                +
              </Button>
              <button
                onClick={() => handleDelete(h.id)}
                className="text-nexus-subtext hover:text-nexus-danger ml-1"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
