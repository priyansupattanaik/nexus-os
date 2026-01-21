import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/api";
import { useSystemStore } from "@/lib/store";
import { Plus, Trash2, GripVertical, CheckSquare } from "lucide-react";

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
      className="flex-1 min-w-[200px] flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100"
    >
      <div
        className={`mb-3 text-xs font-bold uppercase tracking-widest text-${color}-600 text-center select-none`}
      >
        {title}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
        {tasks
          .filter((t) => t.status === status)
          .map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => onDragStart(e, t.id)}
              className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing group relative flex items-start gap-2 hover:shadow-md transition-all"
            >
              <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-700 leading-snug flex-1">
                {t.title}
              </p>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="zenith-card h-full flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4" /> Mission Control
        </h2>
      </div>

      <form onSubmit={handleAddTask} className="flex gap-3 mb-6">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Objective..."
          className="zenith-input flex-1"
        />
        <button type="submit" className="zenith-btn zenith-btn-primary px-4">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
        <Column title="Pending" status="todo" color="gray" />
        <Column title="In Progress" status="in_progress" color="sky" />
        <Column title="Complete" status="done" color="emerald" />
      </div>
    </div>
  );
}
