import { useEffect, useState, useRef } from "react";
import { useSystemStore, ThemeColor } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { createTask } from "@/lib/api";
import { Input } from "@/components/ui/input";

export default function OmniCommand() {
  const { isOmniOpen, setOmniOpen, setFocusMode, setTheme } = useSystemStore();
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOmniOpen(!isOmniOpen);
      }
      if (e.key === "Escape") setOmniOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOmniOpen, setOmniOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOmniOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOmniOpen]);

  const executeCommand = async (cmd: string) => {
    const lower = cmd.toLowerCase();

    if (lower.startsWith("new task:")) {
      const title = cmd.split(":")[1].trim();
      if (title && session) {
        await createTask(title, session.access_token);
        // In a real app we would trigger a refresh, for now just UI feedback
      }
    } else if (lower === "focus") setFocusMode(true);
    else if (lower.includes("theme cyan")) setTheme("cyan");
    else if (lower.includes("theme crimson")) setTheme("crimson");
    else if (lower.includes("theme amber")) setTheme("amber");
    else if (lower.includes("theme violet")) setTheme("violet");
    else if (lower === "logout") window.location.reload(); // Simple reload for now

    setOmniOpen(false);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
    }
  };

  if (!isOmniOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-black border border-[var(--nexus-accent)] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <span className="text-[var(--nexus-accent)] text-xl">ᐳ</span>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="border-none bg-transparent text-lg text-white placeholder:text-gray-600 focus-visible:ring-0 font-mono"
          />
          <div className="flex gap-2">
            <span className="text-[10px] text-gray-500 border border-gray-800 px-2 py-1 rounded">
              ESC
            </span>
            <span className="text-[10px] text-gray-500 border border-gray-800 px-2 py-1 rounded">
              ENTER
            </span>
          </div>
        </div>
        <div className="p-2 bg-white/5">
          <div className="text-[10px] text-gray-500 font-mono px-2 py-1">
            SUGGESTIONS
          </div>
          <div className="grid grid-cols-2 gap-2 p-2">
            {["New Task: [Title]", "Focus", "Theme Crimson", "Theme Cyan"].map(
              (cmd) => (
                <button
                  key={cmd}
                  onClick={() => executeCommand(cmd)}
                  className="text-left text-xs text-gray-300 hover:bg-white/10 p-2 rounded font-mono transition-colors"
                >
                  {cmd}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
