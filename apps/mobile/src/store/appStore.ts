import { create } from 'zustand';

export interface AppState {
  // User state
  userId: string | null;
  displayName: string;
  isAuthenticated: boolean;
  setUser: (userId: string | null) => void;
  setDisplayName: (name: string) => void;
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
  displayName: 'User',
  isAuthenticated: false,
  setUser: (userId) =>
    set({
      userId,
      isAuthenticated: userId !== null,
    }),
  setDisplayName: (displayName) => set({ displayName }),
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
