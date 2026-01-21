import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchHabits,
  createHabit,
  incrementHabit,
  deleteHabit,
} from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { Plus, Trash2, Flame, Repeat } from "lucide-react";

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
    <div className="zenith-card h-full flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Repeat className="w-4 h-4" /> Protocols
        </h2>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Establish new protocol..."
          className="zenith-input flex-1"
        />
        <button type="submit" className="zenith-btn zenith-btn-primary px-4">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {habits.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all group"
          >
            <span className="text-sm font-semibold text-gray-800">
              {h.title}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-sky-50 text-[var(--accent)] border border-sky-100 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">{h.streak}</span>
              </div>
              <button
                onClick={() => handleIncrement(h.id)}
                className="zenith-btn px-3 py-1.5 text-xs hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                +
              </button>
              <button
                onClick={async () => {
                  await deleteHabit(h.id, session.access_token);
                  loadHabits();
                }}
                className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {habits.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-4">
            No active protocols
          </p>
        )}
      </div>
    </div>
  );
}
