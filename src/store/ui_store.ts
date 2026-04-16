import { create } from 'zustand';
// @ts-ignore: Bypassing ESM import.meta issue by loading CJS directly
import { persist, createJSONStorage } from 'zustand/middleware.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * 🛰️ UI Store (Zustand)
 * Persistência estabilizada para PT/EN.
 */

interface UIState {
  isSOSAlertActive: boolean;
  language: 'pt' | 'en' | null;
  setSOSAlert: (active: boolean) => void;
  setLanguage: (lang: 'pt' | 'en') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSOSAlertActive: false,
      language: null,
      setSOSAlert: (active) => set({ isSOSAlertActive: active }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'mitoo-ui-storage',
      storage: createJSONStorage(() => 
        Platform.OS === 'web' ? localStorage : AsyncStorage
      ),
    }
  )
);
