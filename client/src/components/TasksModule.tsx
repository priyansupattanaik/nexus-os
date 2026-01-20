import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSystemStore } from "@/lib/store";

// Simple Drag & Drop Types
type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
};

export default function TasksModule() {
  const { session } = useAuth();
  const { triggerPulse } = useSystemStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (session) loadTasks();
  }, [session]);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks(session.access_token);
      // Ensure status exists (fallback for old data)
      const cleanData = data.map((t: any) => ({
        ...t,
        status: t.status || (t.is_completed ? "done" : "todo"),
      }));
      setTasks(cleanData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e: any) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      // Optimistic Update
      const tempId = Math.random().toString();
      const newTaskObj = {
        id: tempId,
        title: newTask,
        status: "todo" as const,
      };
      setTasks([newTaskObj, ...tasks]);
      setNewTask("");

      const created = await createTask(newTask, session.access_token);
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? { ...created, status: "todo" } : t)),
      );
      triggerPulse("success");
    } catch (e) {
      triggerPulse("error");
    }
  };

  const updateStatus = async (
    id: string,
    newStatus: "todo" | "in_progress" | "done",
  ) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    await updateTask(id, { status: newStatus }, session.access_token);
    triggerPulse("neutral");
  };

  const handleDelete = async (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    await deleteTask(id, session.access_token);
    triggerPulse("error");
  };

  // Drag Handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const onDrop = (
    e: React.DragEvent,
    status: "todo" | "in_progress" | "done",
  ) => {
    const id = e.dataTransfer.getData("taskId");
    if (id) updateStatus(id, status);
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const Column = ({
    title,
    status,
    color,
  }: {
    title: string;
    status: "todo" | "in_progress" | "done";
    color: string;
  }) => (
    <div
      onDrop={(e) => onDrop(e, status)}
      onDragOver={allowDrop}
      className={`flex-1 min-w-[150px] flex flex-col bg-black/20 border border-${color}/20 rounded-lg overflow-hidden transition-colors hover:bg-white/5`}
    >
      <div
        className={`p-2 border-b border-${color}/20 text-[10px] font-bold uppercase tracking-widest text-${color} text-center`}
      >
        {title}
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar h-[300px]">
        {tasks
          .filter((t) => t.status === status)
          .map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => onDragStart(e, t.id)}
              className="p-2 bg-black/40 border border-white/5 rounded cursor-grab active:cursor-grabbing hover:border-white/20 group relative"
            >
              <p className="text-xs font-mono text-gray-300">{t.title}</p>
              <button
                onClick={() => handleDelete(t.id)}
                className="absolute top-1 right-1 text-[8px] text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400"
              >
                ✖
              </button>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-nexus-panel/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-nexus-border/30 flex justify-between items-center bg-black/20">
        <h2 className="text-[var(--nexus-accent)] font-bold tracking-widest text-sm uppercase">
          Mission Board
        </h2>
      </div>

      <form onSubmit={handleAddTask} className="p-3 flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Directive..."
          className="holo-input h-8 text-xs"
        />
        <Button
          type="submit"
          className="holo-button h-8 w-8 p-0 flex items-center justify-center"
        >
          +
        </Button>
      </form>

      <div className="flex-1 p-3 flex gap-3 overflow-x-auto">
        <Column title="Pending" status="todo" color="nexus-accent" />
        <Column title="Active" status="in_progress" color="nexus-secondary" />
        <Column title="Done" status="done" color="green-500" />
      </div>
    </div>
  );
}
