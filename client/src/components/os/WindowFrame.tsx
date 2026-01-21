import { ReactNode, useState, useRef, useEffect } from "react";
import { useSystemStore, AppID } from "@/lib/store";
import { X, Minus } from "lucide-react";

interface WindowFrameProps {
  id: AppID;
  title: string;
  children: ReactNode;
  width?: string;
  height?: string;
}

export default function WindowFrame({
  id,
  title,
  children,
  width = "400px",
  height = "500px",
}: WindowFrameProps) {
  const {
    windows,
    bringToFront,
    updateWindowPosition,
    closeWindow,
    activeWindow,
  } = useSystemStore();
  const winState = windows[id];
  const frameRef = useRef<HTMLDivElement>(null);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!winState.isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    bringToFront(id);
    if (frameRef.current) {
      setIsDragging(true);
      const rect = frameRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Global Mouse Move Listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        updateWindowPosition(id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, id, updateWindowPosition]);

  const isActive = activeWindow === id;

  return (
    <div
      ref={frameRef}
      style={{
        left: winState.position.x,
        top: winState.position.y,
        zIndex: winState.zIndex,
        width,
        height,
      }}
      className={`fixed flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-shadow duration-300 ${isActive ? "shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/20" : "shadow-xl border border-white/5 opacity-90"}`}
      onMouseDown={() => bringToFront(id)}
    >
      {/* Background Blur Layer */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl -z-10" />

      {/* Title Bar (Draggable) */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-10 flex items-center justify-between px-4 select-none cursor-grab active:cursor-grabbing border-b border-white/5 ${isActive ? "bg-white/5" : "bg-transparent"}`}
      >
        <span className="text-xs font-bold tracking-widest uppercase text-slate-300">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => closeWindow(id)}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => closeWindow(id)}
            className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">{children}</div>
    </div>
  );
}
