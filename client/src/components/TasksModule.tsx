import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TasksModule() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (session) loadTasks();
  }, [session]);

  const loadTasks = async () => {
    try {
      setTasks(await fetchTasks(session.access_token));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e: any) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = await createTask(newTask, session.access_token);
    setTasks([task, ...tasks]);
    setNewTask("");
  };

  const toggleTask = async (id: string, status: boolean) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, is_completed: !status } : t)),
    );
    await updateTask(id, { is_completed: !status }, session.access_token);
  };

  const handleDelete = async (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    await deleteTask(id, session.access_token);
  };

  return (
    <div className="flex flex-col h-full bg-nexus-panel/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-nexus-border/30 flex justify-between items-center bg-black/20">
        <h2 className="text-nexus-accent font-bold tracking-widest text-sm uppercase">
          Directives
        </h2>
        <span className="text-[10px] text-nexus-subtext font-mono bg-nexus-accent/10 px-2 py-0.5 rounded border border-nexus-accent/20">
          {tasks.filter((t) => !t.is_completed).length} ACTIVE
        </span>
      </div>

      <form onSubmit={handleAddTask} className="p-3 flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Directive..."
          className="holo-input h-9 text-xs"
        />
        <Button
          type="submit"
          className="holo-button h-9 w-9 p-0 flex items-center justify-center"
        >
          +
        </Button>
      </form>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group flex items-center justify-between p-3 rounded border transition-all duration-300 ${
              task.is_completed
                ? "bg-black/20 border-white/5 opacity-40"
                : "bg-nexus-accent/5 border-nexus-accent/20 hover:border-nexus-accent/50 hover:bg-nexus-accent/10"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <button
                onClick={() => toggleTask(task.id, task.is_completed)}
                className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                  task.is_completed
                    ? "bg-nexus-success border-nexus-success text-black"
                    : "border-nexus-subtext hover:border-nexus-accent"
                }`}
              >
                {task.is_completed && "✓"}
              </button>
              <span
                className={`truncate text-sm font-mono ${task.is_completed ? "line-through text-nexus-subtext" : "text-nexus-text"}`}
              >
                {task.title}
              </span>
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              className="text-nexus-danger hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono"
            >
              [DEL]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
