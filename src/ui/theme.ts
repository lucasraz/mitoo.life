/**
 * 🎨 Mitoo.life Design Tokens
 * Based on Stitch Design Spec & Workflow
 * Camada: UI (Implementação Visual)
 */

export const THEMES = {
  MANHA: {
    primary: '#EF9F27',
    background: '#FFF8E0',
    text: '#412402',
    name: 'Manhã',
    hourRange: [6, 12],
  },
  TARDE: {
    primary: '#378ADD',
    background: '#E6F5FF',
    text: '#042C53',
    name: 'Tarde',
    hourRange: [12, 18],
  },
  NOITE: {
    primary: '#534AB7',
    background: '#26215C',
    text: '#EEEDFE',
    name: 'Noite',
    hourRange: [18, 6],
  },
};

export const MOODS = {
  ANSIOSA: { color: '#D85A30', label: 'Ansiosa' },
  FELIZ: { color: '#EF9F27', label: 'Feliz' },
  RAIVA: { color: '#E24B4A', label: 'Raiva' },
  DEPRESSIVO: { color: '#534AB7', label: 'Depressivo' },
  DESMOTIVADA: { color: '#1D9E75', label: 'Desmotivada' },
  MOTIVADA: { color: '#639922', label: 'Motivada' },
};

export type ThemeType = typeof THEMES.MANHA;
export type MoodType = typeof MOODS.ANSIOSA;
