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
    minimizeWindow,
    activeWindow,
  } = useSystemStore();
  const winState = windows[id];
  const frameRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!winState.isOpen || winState.isMinimized) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // No dragging on mobile
    bringToFront(id);
    if (frameRef.current) {
      // Only drag if clicking the header
      const rect = frameRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    if (isMobile) return;

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
  }, [isDragging, dragOffset, id, updateWindowPosition, isMobile]);

  const isActive = activeWindow === id;

  // --- RESPONSIVE STYLES ---
  // Mobile: Full screen, Fixed, No radius
  // Desktop: Absolute positioned, Rounded, Shadow
  const mobileStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "calc(100% - 80px)", // Leave space for Dock
    zIndex: 1000, // Always on top of desktop elements
  };

  const desktopStyle = {
    position: "fixed" as const,
    left: winState.position.x,
    top: winState.position.y,
    width: width,
    height: height,
    zIndex: winState.zIndex,
  };

  return (
    <div
      ref={frameRef}
      style={isMobile ? mobileStyle : desktopStyle}
      className={`flex flex-col overflow-hidden transition-all duration-200 
        ${isMobile ? "rounded-none bg-black" : "rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl"}
        ${isActive && !isMobile ? "shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/20" : ""}
      `}
      onMouseDown={() => !isMobile && bringToFront(id)}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown} // Drag handle
        className={`h-12 flex items-center justify-between px-4 select-none flex-shrink-0 
            ${isMobile ? "bg-black border-b border-white/10 pt-safe-top" : "cursor-grab active:cursor-grabbing border-b border-white/5"}
        `}
      >
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-300">
          {title}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => minimizeWindow(id)}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => closeWindow(id)}
            className="p-2 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">{children}</div>
    </div>
  );
}
