import { create } from "zustand";

type SystemState = "IDLE" | "LISTENING" | "PROCESSING" | "SUCCESS" | "ERROR";

interface SystemStore {
  mode: SystemState;
  setMode: (mode: SystemState) => void;
  triggerPulse: (type: "success" | "error" | "neutral") => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
  mode: "IDLE",
  setMode: (mode) => set({ mode }),
  triggerPulse: (type) => {
    // Pulse logic can be expanded here if needed
    // For now, we just rely on 'mode' changes or transient states
    if (type === "success") {
      set({ mode: "SUCCESS" });
      setTimeout(() => set({ mode: "IDLE" }), 1000);
    } else if (type === "error") {
      set({ mode: "ERROR" });
      setTimeout(() => set({ mode: "IDLE" }), 1000);
    }
  },
}));
