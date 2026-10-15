import { create } from 'zustand';

type FontSizeState = {
  isLarge: boolean;
  setIsLarge: (v: boolean) => void;
};

export const useFontSizeStore = create<FontSizeState>((set) => ({
  isLarge: false,
  setIsLarge: (isLarge) => set({ isLarge }),
}));
