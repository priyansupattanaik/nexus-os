import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchSettings, updateSettings } from "@/lib/api";
import { useSystemStore, ThemeColor } from "@/lib/store";
import {
  Settings,
  Bell,
  Volume2,
  Monitor,
  Shield,
  LogOut,
  Check,
} from "lucide-react";
import DebugConsole from "@/components/DebugConsole"; // <<< NEW

export default function SettingsModule() {
  const { session, signOut } = useAuth();
  const { setTheme, theme } = useSystemStore();
  const [preferences, setPreferences] = useState({
    notifications: true,
    volume: 50,
    accent: "sky",
  });

  const THEMES: { id: ThemeColor; color: string }[] = [
    { id: "cyan", color: "#06b6d4" },
    { id: "violet", color: "#8b5cf6" },
    { id: "crimson", color: "#f43f5e" },
    { id: "amber", color: "#f59e0b" },
  ];

  useEffect(() => {
    if (session) {
      fetchSettings(session.access_token).then((data) => {
        if (data)
          setPreferences({
            notifications: data.notifications ?? true,
            volume: (data.sound_volume ?? 0.5) * 100,
            accent: data.theme_accent || "sky",
          });
      });
    }
  }, [session]);

  const handleSave = async (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    if (key === "accent") setTheme(value as ThemeColor);
    await updateSettings(
      {
        [key === "volume"
          ? "sound_volume"
          : key === "accent"
            ? "theme_accent"
            : key]: key === "volume" ? value / 100 : value,
      },
      session.access_token,
    );
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
      {/* Sidebar */}
      <div className="col-span-1 space-y-4">
        <div className="zenith-card p-6 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Control Center
              </h2>
              <p className="text-xs text-gray-500">System Preferences</p>
            </div>
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 text-gray-900 font-medium text-sm border border-gray-100">
              General
            </button>
          </div>
        </div>

        <div className="zenith-card p-6 bg-rose-50 border-rose-100">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 text-rose-600 hover:text-rose-800 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out Device
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-1 md:col-span-2 space-y-6">
        {/* Visuals */}
        <div className="zenith-card p-6 bg-white">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Monitor className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">
              Visual Interface
            </h3>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Accent Color
            </label>
            <div className="flex gap-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSave("accent", t.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${preferences.accent === t.id ? "ring-2 ring-offset-2 ring-gray-300 scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: t.color }}
                >
                  {preferences.accent === t.id && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Diagnostics (NEW) */}
        <DebugConsole />
      </div>
    </div>
  );
}
