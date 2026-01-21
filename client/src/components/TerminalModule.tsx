import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useSystemStore, AppID } from "@/lib/store";
import { Terminal as TerminalIcon, Send } from "lucide-react";

export default function TerminalModule() {
  const { session } = useAuth();
  const { setActiveTab } = useSystemStore();
  const [history, setHistory] = useState<
    { type: "input" | "output"; content: string }[]
  >([
    { type: "output", content: "Nexus OS Kernel v3.0.1 [Secure Boot]" },
    { type: "output", content: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().toLowerCase().split(" ");
    const command = args[0];
    let output = "";

    switch (command) {
      case "help":
        output =
          "Available commands: help, open <module>, clear, date, whoami, status";
        break;
      case "clear":
        setHistory([]);
        return;
      case "whoami":
        output = `User: ${session?.user?.email} | ID: ${session?.user?.id.slice(0, 8)}`;
        break;
      case "date":
        output = new Date().toString();
        break;
      case "status":
        output = "System Operational. All subsystems nominal.";
        break;
      case "open":
        if (args[1]) {
          const validApps: AppID[] = [
            "dashboard",
            "tasks",
            "finance",
            "habits",
            "journal",
            "explorer",
            "settings",
            "bio",
            "focus",
          ];
          if (validApps.includes(args[1] as AppID)) {
            setActiveTab(args[1] as AppID);
            output = `Launching ${args[1]}...`;
          } else {
            output = `Error: Module '${args[1]}' not found.`;
          }
        } else {
          output = "Usage: open <module_name>";
        }
        break;
      default:
        output = `Command not found: ${command}`;
    }

    setHistory((prev) => [
      ...prev,
      { type: "input", content: cmd },
      { type: "output", content: output },
    ]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleCommand(input);
    setInput("");
  };

  return (
    <div className="zenith-card h-full flex flex-col overflow-hidden bg-white font-mono text-sm">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
        <TerminalIcon className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">
          System Terminal
        </span>
      </div>

      {/* Output Area */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-2 bg-white"
        onClick={() => document.getElementById("term-input")?.focus()}
      >
        {history.map((line, i) => (
          <div
            key={i}
            className={`${line.type === "input" ? "text-gray-400 mt-2" : "text-gray-800"}`}
          >
            {line.type === "input" && (
              <span className="mr-2 text-sky-500">$</span>
            )}
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={onSubmit}
        className="p-3 border-t border-gray-100 flex gap-2 bg-gray-50"
      >
        <span className="text-sky-500 font-bold self-center">{">"}</span>
        <input
          id="term-input"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
          placeholder="Enter command..."
          autoComplete="off"
        />
        <button type="submit" className="text-sky-600 hover:text-sky-700">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
