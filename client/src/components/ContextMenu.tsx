import { useState, useEffect, useRef } from "react";
import { useSystemStore } from "@/lib/store";
import {
  RefreshCw,
  ArrowLeft,
  Terminal,
  FileText,
  Settings,
} from "lucide-react";

export default function ContextMenu() {
  const { setActiveTab } = useSystemStore();
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setVisible(true);
      setCoords({ x: e.pageX, y: e.pageY });
    };

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  if (!visible) return null;

  const handleAction = (action: () => void) => {
    action();
    setVisible(false);
  };

  return (
    <div
      ref={menuRef}
      style={{ top: coords.y, left: coords.x }}
      className="fixed z-[9999] w-48 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onClick={() => handleAction(() => window.history.back())}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <button
        onClick={() => handleAction(() => window.location.reload())}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Refresh System
      </button>

      <div className="my-1 border-t border-gray-100" />

      <button
        onClick={() => handleAction(() => setActiveTab("terminal"))}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors"
      >
        <Terminal className="w-3.5 h-3.5" /> Open Terminal
      </button>
      <button
        onClick={() => handleAction(() => setActiveTab("explorer"))}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors"
      >
        <FileText className="w-3.5 h-3.5" /> New File...
      </button>

      <div className="my-1 border-t border-gray-100" />

      <button
        onClick={() => handleAction(() => setActiveTab("settings"))}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors"
      >
        <Settings className="w-3.5 h-3.5" /> Settings
      </button>
    </div>
  );
}
