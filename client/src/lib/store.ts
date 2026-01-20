import { create } from "zustand";

type SystemState = "IDLE" | "LISTENING" | "PROCESSING" | "SUCCESS" | "ERROR";

interface SystemStore {
  mode: SystemState;
  setMode: (mode: SystemState) => void;
  triggerPulse: (type: "success" | "error" | "neutral") => void;

  // NEW: Focus Mode State
  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;
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

  // Focus Mode Actions
  isFocusMode: false,
  setFocusMode: (active) => set({ isFocusMode: active }),
}));
