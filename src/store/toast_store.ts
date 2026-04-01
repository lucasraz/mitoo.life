import { create } from 'zustand';

/**
 * 🛰️ Notification Store (Orquestração de UI)
 * Controla os desabafos flutuantes globais.
 */

interface ToastState {
  visible: boolean;
  content: string;
  moodColor: string;
  show: (content: string, color: string) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  content: '',
  moodColor: '#CCC',
  show: (content, color) => {
    set({ visible: true, content, moodColor: color });
    setTimeout(() => set({ visible: false }), 4000); // Some sozinhos após 4s
  },
  hide: () => set({ visible: false }),
}));
