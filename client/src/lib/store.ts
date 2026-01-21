import { create } from "zustand";

type SystemState = "IDLE" | "LISTENING" | "PROCESSING" | "SUCCESS" | "ERROR";
export type ThemeColor = "cyan" | "crimson" | "amber" | "violet";
export type AppID =
  | "tasks"
  | "finance"
  | "habits"
  | "journal"
  | "music"
  | "dream"
  | "settings"
  | "bio"
  | "overclock"
  | "tuner";

interface WindowState {
  id: AppID;
  isOpen: boolean;
  position: { x: number; y: number };
  zIndex: number;
}

interface SystemStore {
  mode: SystemState;
  setMode: (mode: SystemState) => void;
  triggerPulse: (type: "success" | "error" | "neutral") => void;

  // OS Features
  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;
  isOmniOpen: boolean;
  setOmniOpen: (open: boolean) => void;
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;

  // Bio-Metrics
  isBioActive: boolean;
  setBioActive: (active: boolean) => void;
  isOverclockActive: boolean;
  setOverclockActive: (active: boolean) => void;
  overclockProgress: number;
  setOverclockProgress: (progress: number) => void;

  // Window Manager
  windows: Record<AppID, WindowState>;
  activeWindow: AppID | null;
  toggleWindow: (id: AppID) => void;
  bringToFront: (id: AppID) => void;
  updateWindowPosition: (id: AppID, pos: { x: number; y: number }) => void;
  closeWindow: (id: AppID) => void;
}

// Initial centers logic usually handled in component, setting defaults here
const defaultWindows: Record<AppID, WindowState> = {
  tasks: { id: "tasks", isOpen: false, position: { x: 100, y: 50 }, zIndex: 1 },
  finance: {
    id: "finance",
    isOpen: false,
    position: { x: 150, y: 80 },
    zIndex: 1,
  },
  habits: {
    id: "habits",
    isOpen: false,
    position: { x: 200, y: 110 },
    zIndex: 1,
  },
  journal: {
    id: "journal",
    isOpen: false,
    position: { x: 250, y: 140 },
    zIndex: 1,
  },
  music: { id: "music", isOpen: false, position: { x: 50, y: 50 }, zIndex: 1 },
  dream: {
    id: "dream",
    isOpen: false,
    position: { x: 300, y: 170 },
    zIndex: 1,
  },
  settings: {
    id: "settings",
    isOpen: false,
    position: { x: 350, y: 200 },
    zIndex: 1,
  },
  bio: { id: "bio", isOpen: false, position: { x: 400, y: 230 }, zIndex: 1 },
  overclock: {
    id: "overclock",
    isOpen: false,
    position: { x: 450, y: 260 },
    zIndex: 1,
  },
  tuner: {
    id: "tuner",
    isOpen: false,
    position: { x: 500, y: 290 },
    zIndex: 1,
  },
};

let maxZ = 10;

export const useSystemStore = create<SystemStore>((set, get) => ({
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

  // Window Actions
  windows: defaultWindows,
  activeWindow: null,

  toggleWindow: (id) =>
    set((state) => {
      const win = state.windows[id];
      if (win.isOpen) {
        // If open and active, minimize (close). If open but inactive, bring to front.
        if (state.activeWindow === id) {
          return {
            windows: { ...state.windows, [id]: { ...win, isOpen: false } },
            activeWindow: null,
          };
        } else {
          maxZ++;
          return {
            windows: { ...state.windows, [id]: { ...win, zIndex: maxZ } },
            activeWindow: id,
          };
        }
      } else {
        // Open it
        maxZ++;
        return {
          windows: {
            ...state.windows,
            [id]: { ...win, isOpen: true, zIndex: maxZ },
          },
          activeWindow: id,
        };
      }
    }),

  bringToFront: (id) =>
    set((state) => {
      maxZ++;
      return {
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], zIndex: maxZ },
        },
        activeWindow: id,
      };
    }),

  updateWindowPosition: (id, pos) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], position: pos },
      },
    })),

  closeWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isOpen: false },
      },
    })),
}));
