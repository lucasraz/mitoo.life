import { create } from 'zustand';

/**
 * 🛰️ UI Store (Zustand)
 * Camada: Orquestração (Gerenciamento de estados globais de interface)
 * Controla animações e alertas de suporte SOS.
 */

interface UIState {
  isSOSAlertActive: boolean;
  setSOSAlert: (active: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSOSAlertActive: false,
  setSOSAlert: (active) => set({ isSOSAlertActive: active }),
}));
