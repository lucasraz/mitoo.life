import { useState, useEffect } from 'react';
import { THEMES, ThemeType } from '../ui/theme';

/**
 * 🛰️ useThemePeriod Hook
 * Detecta o período do dia e retorna os tokens visuais adequados.
 */
export const useThemePeriod = (): ThemeType => {
  const [theme, setTheme] = useState<ThemeType>(THEMES.TARDE);

  useEffect(() => {
    const updateTheme = () => {
      const hours = new Date().getHours();

      if (hours >= 6 && hours < 12) {
        setTheme(THEMES.MANHA);
      } else if (hours >= 12 && hours < 18) {
        setTheme(THEMES.TARDE);
      } else {
        setTheme(THEMES.NOITE);
      }
    };

    updateTheme();
    // Atualiza a cada minuto para trocar o tema suavemente na transição
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  return theme;
};
