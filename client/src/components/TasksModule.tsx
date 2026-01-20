import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Define the Task type
type Task = {
  id: string;
  title: string;
  is_completed: boolean;
};

export default function TasksModule() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    if (session?.access_token) {
      loadTasks();
    }
  }, [session]);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks(session.access_token);
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setLoading(true);
    try {
      const task = await createTask(newTask, session.access_token);
      setTasks([task, ...tasks]); // Add to top of list
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
    setLoading(false);
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    // Optimistic update (update UI immediately)
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, is_completed: !currentStatus } : t,
      ),
    );

    try {
      await updateTask(
        id,
        { is_completed: !currentStatus },
        session.access_token,
      );
    } catch (error) {
      console.error("Error updating task:", error);
      loadTasks(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setTasks(tasks.filter((t) => t.id !== id));

    try {
      await deleteTask(id, session.access_token);
    } catch (error) {
      console.error("Error deleting task:", error);
      loadTasks();
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full flex flex-col shadow-2xl">
      <h2 className="text-xl font-semibold text-gray-300 mb-4 flex justify-between items-center">
        <span>Active Directives</span>
        <span className="text-xs text-nexus-accent border border-nexus-accent/30 px-2 py-1 rounded">
          {tasks.filter((t) => !t.is_completed).length} Pending
        </span>
      </h2>

      {/* Input Form */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new directive..."
          className="bg-gray-900/50 border-gray-700 text-white focus:border-blue-500"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          {loading ? "+" : "ADD"}
        </Button>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            No active directives.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-3 rounded border transition-all duration-300 ${
                task.is_completed
                  ? "bg-gray-900/30 border-gray-800 opacity-50"
                  : "bg-black/40 border-gray-700 hover:border-blue-500/50"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  onClick={() => toggleTask(task.id, task.is_completed)}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    task.is_completed
                      ? "bg-green-500/20 border-green-500 text-green-500"
                      : "border-gray-500 hover:border-blue-400"
                  }`}
                >
                  {task.is_completed && "✓"}
                </button>
                <span
                  className={`truncate ${
                    task.is_completed
                      ? "line-through text-gray-500"
                      : "text-gray-200"
                  }`}
                >
                  {task.title}
                </span>
              </div>

              <button
                onClick={() => handleDelete(task.id)}
                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
