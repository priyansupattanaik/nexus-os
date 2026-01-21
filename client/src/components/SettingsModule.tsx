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

export default function SettingsModule() {
  const { session, signOut } = useAuth();
  const { setTheme, theme } = useSystemStore();
  const [preferences, setPreferences] = useState({
    notifications: true,
    volume: 50,
    accent: "sky",
  });

  const THEMES: { id: ThemeColor; color: string }[] = [
    { id: "cyan", color: "#06b6d4" }, // Cyan-500
    { id: "violet", color: "#8b5cf6" }, // Violet-500
    { id: "crimson", color: "#f43f5e" }, // Rose-500
    { id: "amber", color: "#f59e0b" }, // Amber-500
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

    // Debounce sync to server in a real app, direct update here
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
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar */}
      <div className="col-span-1 space-y-2">
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
            <button className="w-full text-left px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 text-sm transition-colors">
              Display
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 text-sm transition-colors">
              Security
            </button>
          </div>
        </div>

        <div className="zenith-card p-6 bg-rose-50 border-rose-100">
          <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
            Danger Zone
          </h3>
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
        {/* Appearance */}
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

        {/* System */}
        <div className="zenith-card p-6 bg-white">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Shield className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">System Controls</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Allow system alerts and daemon pings
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleSave("notifications", !preferences.notifications)
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${preferences.notifications ? "bg-sky-500" : "bg-gray-200"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${preferences.notifications ? "left-7" : "left-1"}`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    System Volume
                  </p>
                  <p className="text-xs text-gray-500">Global output gain</p>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.volume}
                onChange={(e) => handleSave("volume", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
