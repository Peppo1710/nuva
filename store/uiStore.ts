import { create } from "zustand";

interface UIState {
  isOffline: boolean;
  setOffline: (offline: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOffline: false,
  setOffline: (offline) => set({ isOffline: offline }),
}));
