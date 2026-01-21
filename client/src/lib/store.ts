import { create } from "zustand";

type SystemState = "IDLE" | "LISTENING" | "PROCESSING" | "SUCCESS" | "ERROR";
export type ThemeColor = "cyan" | "crimson" | "amber" | "violet";
export type AppID =
  | "dashboard"
  | "explorer"
  | "tasks"
  | "finance"
  | "habits"
  | "journal"
  | "bio"
  | "focus"
  | "analysis"
  | "settings"
  | "terminal"; // Added terminal

interface SystemStore {
  // Navigation (New)
  activeTab: AppID;
  setActiveTab: (tab: AppID) => void;

  // System Status
  mode: SystemState;
  setMode: (mode: SystemState) => void;
  triggerPulse: (type: "success" | "error" | "neutral") => void;

  // Settings
  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;
  isOmniOpen: boolean;
  setOmniOpen: (open: boolean) => void;
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;

  // Module Specifics
  isBioActive: boolean;
  setBioActive: (active: boolean) => void;
  isOverclockActive: boolean;
  setOverclockActive: (active: boolean) => void;
  overclockProgress: number;
  setOverclockProgress: (progress: number) => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),

  mode: "IDLE",
  setMode: (mode) => set({ mode }),

  triggerPulse: (type) => {
    if (type === "success") set({ mode: "SUCCESS" });
    else if (type === "error") set({ mode: "ERROR" });
    setTimeout(() => set({ mode: "IDLE" }), 1500);
  },

  isFocusMode: false,
  setFocusMode: (active) => set({ isFocusMode: active }),
  isOmniOpen: false,
  setOmniOpen: (open) => set({ isOmniOpen: open }),
  theme: "cyan",
  setTheme: (theme) => set({ theme }),

  isBioActive: false,
  setBioActive: (active) => set({ isBioActive: active }),
  isOverclockActive: false,
  setOverclockActive: (active) => set({ isOverclockActive: active }),
  overclockProgress: 0,
  setOverclockProgress: (progress) => set({ overclockProgress: progress }),
}));
