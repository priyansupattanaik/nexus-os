import {
  CheckSquare,
  DollarSign,
  Repeat,
  Book,
  BrainCircuit,
  HeartPulse,
  Timer,
  LayoutDashboard,
  HardDrive,
  Settings as SettingsIcon,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenProfile,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "explorer", label: "Explorer", icon: HardDrive }, // <<< NEW
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "habits", label: "Habits", icon: Repeat },
    { id: "journal", label: "Journal", icon: Book },
    { id: "bio", label: "Bio-Sync", icon: HeartPulse },
    { id: "focus", label: "Focus Lab", icon: Timer },
    { id: "analysis", label: "Neural", icon: BrainCircuit },
    { id: "settings", label: "Settings", icon: SettingsIcon }, // <<< NEW
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Brand */}
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-sky-500/30">
          N
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          NEXUS
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-sky-50 text-[var(--accent)] shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-colors ${isActive ? "text-[var(--accent)]" : "text-gray-400 group-hover:text-gray-600"}`}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 group-hover:text-sky-600 group-hover:border-sky-200">
            US
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900">
              System Admin
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{" "}
              Online
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
