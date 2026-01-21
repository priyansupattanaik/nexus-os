import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchHabits,
  createHabit,
  incrementHabit,
  deleteHabit,
} from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { Plus, Trash2, Flame } from "lucide-react";

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
    <div className="flex flex-col h-full p-4 gap-4 bg-black/20">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New Habit..."
          className="os-input flex-1"
        />
        <button type="submit" className="os-btn os-btn-primary px-3">
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {habits.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-white/10 transition-all group"
          >
            <span className="text-sm font-medium text-slate-200">
              {h.title}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded text-[10px]">
                <Flame className="w-3 h-3" />
                <span className="font-bold">{h.streak}</span>
              </div>
              <button
                onClick={() => handleIncrement(h.id)}
                className="os-btn px-2 py-1 text-xs hover:bg-blue-500 hover:text-white transition-colors"
              >
                +
              </button>
              <button
                onClick={async () => {
                  await deleteHabit(h.id, session.access_token);
                  loadHabits();
                }}
                className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
