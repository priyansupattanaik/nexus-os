import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckSquare, Plus, Trash2, GripVertical } from "lucide-react";

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

  const onDragStart = (e: React.DragEvent, id: string) =>
    e.dataTransfer.setData("taskId", id);
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
      className="flex-1 min-w-[140px] flex flex-col bg-white/[0.03] border border-white/5 rounded-lg overflow-hidden transition-colors hover:bg-white/[0.05]"
    >
      <div
        className={`p-2 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-${color}-400 text-center`}
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
              className="p-2 bg-black/40 border border-white/5 rounded cursor-grab active:cursor-grabbing hover:border-[hsl(var(--primary)/0.5)] group relative flex items-center gap-2"
            >
              <GripVertical className="w-3 h-3 text-slate-600" />
              <p className="text-xs font-mono text-slate-300 truncate flex-1">
                {t.title}
              </p>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <GlassCard title="Mission Board" icon={<CheckSquare />}>
      <div className="flex flex-col h-full p-4 gap-4">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New Objective..."
            className="tech-input flex-1"
          />
          <button type="submit" className="tech-button px-3">
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="flex-1 flex gap-3 overflow-x-auto pb-2">
          <Column title="Pending" status="todo" color="slate" />
          <Column title="Active" status="in_progress" color="blue" />
          <Column title="Done" status="done" color="green" />
        </div>
      </div>
    </GlassCard>
  );
}
