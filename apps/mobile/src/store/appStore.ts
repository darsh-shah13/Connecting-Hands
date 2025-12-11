import { create } from 'zustand';

export interface AppState {
  // User state
  userId: string | null;
  isAuthenticated: boolean;
  setUser: (userId: string | null) => void;
  logout: () => void;

  // App state
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Loading state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  isAuthenticated: false,
  setUser: (userId) =>
    set({
      userId,
      isAuthenticated: userId !== null,
    }),
  logout: () =>
    set({
      userId: null,
      isAuthenticated: false,
    }),

  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => ({
      isDarkMode: !state.isDarkMode,
    })),

  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
