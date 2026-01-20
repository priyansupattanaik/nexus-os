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
import { Card } from "@/components/ui/card";

export default function HabitsModule() {
  const { session } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    if (session) loadHabits();
  }, [session]);

  const loadHabits = async () => {
    try {
      setHabits(await fetchHabits(session.access_token));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!newHabit) return;
    await createHabit(newHabit, session.access_token);
    setNewHabit("");
    loadHabits();
  };

  const handleIncrement = async (id: string) => {
    await incrementHabit(id, session.access_token);
    loadHabits();
  };

  return (
    <Card className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full flex flex-col shadow-2xl">
      <h2 className="text-xl font-semibold text-gray-300 mb-4">
        Habit Protocols
      </h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New Protocol..."
          className="bg-gray-900/50 border-gray-700 text-white"
        />
        <Button type="submit" className="bg-purple-600 hover:bg-purple-500">
          +
        </Button>
      </form>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {habits.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between p-3 bg-black/40 border border-gray-700 rounded hover:border-purple-500/50 transition-colors"
          >
            <span className="text-gray-200">{h.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400">
                Streak: {h.streak}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleIncrement(h.id)}
                className="h-6 w-6 p-0 border-green-500/50 text-green-400"
              >
                {" "}
                +{" "}
              </Button>
              <button
                onClick={async () => {
                  await deleteHabit(h.id, session.access_token);
                  loadHabits();
                }}
                className="text-red-500 hover:text-red-400 ml-2"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
