import { create } from "zustand";

type SystemState = "IDLE" | "LISTENING" | "PROCESSING" | "SUCCESS" | "ERROR";
export type ThemeColor = "cyan" | "crimson" | "amber" | "violet";

interface SystemStore {
  mode: SystemState;
  setMode: (mode: SystemState) => void;
  triggerPulse: (type: "success" | "error" | "neutral") => void;

  // Focus Mode
  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;

  // Omni-Command
  isOmniOpen: boolean;
  setOmniOpen: (open: boolean) => void;

  // Chroma Shift (Theme)
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
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
}));
