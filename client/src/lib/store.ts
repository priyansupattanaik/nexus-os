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
  isMinimized: boolean;
  position: { x: number; y: number };
  zIndex: number;
}

interface SystemStore {
  mode: SystemState;
  setMode: (mode: SystemState) => void;
  triggerPulse: (type: "success" | "error" | "neutral") => void;

  // Global Settings
  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;
  isOmniOpen: boolean;
  setOmniOpen: (open: boolean) => void;
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;

  // App Specifics
  isBioActive: boolean;
  setBioActive: (active: boolean) => void;
  isOverclockActive: boolean;
  setOverclockActive: (active: boolean) => void;
  overclockProgress: number;
  setOverclockProgress: (progress: number) => void;

  // Window Manager State
  windows: Record<AppID, WindowState>;
  activeWindow: AppID | null;

  // Window Actions
  toggleWindow: (id: AppID) => void;
  bringToFront: (id: AppID) => void;
  updateWindowPosition: (id: AppID, pos: { x: number; y: number }) => void;
  closeWindow: (id: AppID) => void;
  minimizeWindow: (id: AppID) => void;
}

// Default layout centered on a 1920x1080 screen roughly
const defaultWindows: Record<AppID, WindowState> = {
  tasks: {
    id: "tasks",
    isOpen: false,
    isMinimized: false,
    position: { x: 100, y: 100 },
    zIndex: 10,
  },
  finance: {
    id: "finance",
    isOpen: false,
    isMinimized: false,
    position: { x: 150, y: 120 },
    zIndex: 10,
  },
  habits: {
    id: "habits",
    isOpen: false,
    isMinimized: false,
    position: { x: 200, y: 140 },
    zIndex: 10,
  },
  journal: {
    id: "journal",
    isOpen: false,
    isMinimized: false,
    position: { x: 250, y: 160 },
    zIndex: 10,
  },
  music: {
    id: "music",
    isOpen: false,
    isMinimized: false,
    position: { x: 80, y: 80 },
    zIndex: 10,
  },
  dream: {
    id: "dream",
    isOpen: false,
    isMinimized: false,
    position: { x: 300, y: 180 },
    zIndex: 10,
  },
  settings: {
    id: "settings",
    isOpen: false,
    isMinimized: false,
    position: { x: 350, y: 200 },
    zIndex: 10,
  },
  bio: {
    id: "bio",
    isOpen: false,
    isMinimized: false,
    position: { x: 400, y: 220 },
    zIndex: 10,
  },
  overclock: {
    id: "overclock",
    isOpen: false,
    isMinimized: false,
    position: { x: 450, y: 240 },
    zIndex: 10,
  },
  tuner: {
    id: "tuner",
    isOpen: false,
    isMinimized: false,
    position: { x: 500, y: 260 },
    zIndex: 10,
  },
};

let globalZIndex = 100;

export const useSystemStore = create<SystemStore>((set) => ({
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

  windows: defaultWindows,
  activeWindow: null,

  toggleWindow: (id) =>
    set((state) => {
      const win = state.windows[id];
      globalZIndex++;

      if (win.isOpen && !win.isMinimized && state.activeWindow === id) {
        // If open, active, and not minimized -> Minimize it
        return {
          windows: { ...state.windows, [id]: { ...win, isMinimized: true } },
          activeWindow: null,
        };
      }

      // Otherwise open/restore and bring to front
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...win,
            isOpen: true,
            isMinimized: false,
            zIndex: globalZIndex,
          },
        },
        activeWindow: id,
      };
    }),

  bringToFront: (id) =>
    set((state) => {
      globalZIndex++;
      return {
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], zIndex: globalZIndex },
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
      activeWindow: null,
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isMinimized: true },
      },
      activeWindow: null,
    })),
}));
