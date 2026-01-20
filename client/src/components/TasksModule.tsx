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
      className="flex-1 min-w-[200px] flex flex-col bg-black/20 rounded-2xl p-2 transition-colors border border-white/5"
    >
      <div
        className={`py-3 px-2 text-xs font-bold uppercase tracking-widest text-${color}-400 text-center select-none opacity-80`}
      >
        {title}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {tasks
          .filter((t) => t.status === status)
          .map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => onDragStart(e, t.id)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-grab active:cursor-grabbing group relative flex items-start gap-3 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <GripVertical className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium text-slate-200 leading-snug break-words flex-1">
                {t.title}
              </p>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <GlassCard title="Mission Board" icon={<CheckSquare />}>
      <div className="flex flex-col h-full p-5 gap-5">
        <form onSubmit={handleAddTask} className="flex gap-3">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new directive..."
            className="os-input flex-1"
          />
          <button type="submit" className="os-btn os-btn-primary">
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scroll-smooth">
          <Column title="To Do" status="todo" color="slate" />
          <Column title="In Progress" status="in_progress" color="blue" />
          <Column title="Completed" status="done" color="emerald" />
        </div>
      </div>
    </GlassCard>
  );
}
