import { renderHook } from '@testing-library/react-native';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { THEMES } from '../../src/ui/theme';

/**
 * 🧪 Testes de TDD: useThemePeriod
 * Objetivo: Garantir que o app troque o tema corretamente baseado na hora do dia.
 */

describe('useThemePeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve retornar o tema MANHA se a hora estiver entre 6h e 12h', () => {
    jest.setSystemTime(new Date(2026, 3, 28, 8, 0, 0)); // 08:00
    const { result } = renderHook(() => useThemePeriod());
    expect(result.current.name).toBe(THEMES.MANHA.name);
  });

  it('deve retornar o tema TARDE se a hora estiver entre 12h e 18h', () => {
    jest.setSystemTime(new Date(2026, 3, 28, 14, 0, 0)); // 14:00
    const { result } = renderHook(() => useThemePeriod());
    expect(result.current.name).toBe(THEMES.TARDE.name);
  });

  it('deve retornar o tema NOITE se a hora estiver fora da faixa diurna (ex: 20h)', () => {
    jest.setSystemTime(new Date(2026, 3, 28, 20, 0, 0)); // 20:00
    const { result } = renderHook(() => useThemePeriod());
    expect(result.current.name).toBe(THEMES.NOITE.name);
  });
});
