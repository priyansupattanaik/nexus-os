import { create } from "zustand";

type SystemState = "IDLE" | "LISTENING" | "PROCESSING" | "SUCCESS" | "ERROR";
export type ThemeColor = "cyan" | "crimson" | "amber" | "violet";

interface SystemStore {
  mode: SystemState;
  setMode: (mode: SystemState) => void;
  triggerPulse: (type: "success" | "error" | "neutral") => void;

  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;

  isOmniOpen: boolean;
  setOmniOpen: (open: boolean) => void;

  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;

  // --- PHASE 2 NEW STATES ---
  isBioActive: boolean;
  setBioActive: (active: boolean) => void;

  isOverclockActive: boolean;
  setOverclockActive: (active: boolean) => void;
  overclockProgress: number; // 0.0 to 1.0
  setOverclockProgress: (progress: number) => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
  mode: "IDLE",
  setMode: (mode) => set({ mode }),
  triggerPulse: (type) => {
    if (type === "success") {
      set({ mode: "SUCCESS" });
      setTimeout(() => set({ mode: "IDLE" }), 1000);
    } else if (type === "error") {
      set({ mode: "ERROR" });
      setTimeout(() => set({ mode: "IDLE" }), 1000);
    }
  },

  isFocusMode: false,
  setFocusMode: (active) => set({ isFocusMode: active }),

  isOmniOpen: false,
  setOmniOpen: (open) => set({ isOmniOpen: open }),

  theme: "cyan",
  setTheme: (theme) => set({ theme }),

  // Phase 2
  isBioActive: false,
  setBioActive: (active) => set({ isBioActive: active }),

  isOverclockActive: false,
  setOverclockActive: (active) => set({ isOverclockActive: active }),
  overclockProgress: 0,
  setOverclockProgress: (progress) => set({ overclockProgress: progress }),
}));
