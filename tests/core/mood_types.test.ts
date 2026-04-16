import {
  isValidMood,
  isValidPeriod,
  assertValidMood,
  assertValidPeriod,
  VALID_MOODS,
  VALID_PERIODS,
} from '../../src/core/mood_types';

/**
 * 🧪 Testes de TDD: mood_types
 * Garante que as guards de domínio rejeitam estados ilegais.
 */

describe('mood_types', () => {
  describe('isValidMood', () => {
    it('deve retornar true para cada humor válido', () => {
      VALID_MOODS.forEach((mood) => {
        expect(isValidMood(mood)).toBe(true);
      });
    });

    it('deve retornar false para string arbitrária', () => {
      expect(isValidMood('feliz')).toBe(false);
      expect(isValidMood('')).toBe(false);
      expect(isValidMood('ALEGRIA')).toBe(false);
    });
  });

  describe('isValidPeriod', () => {
    it('deve retornar true para cada período válido', () => {
      VALID_PERIODS.forEach((period) => {
        expect(isValidPeriod(period)).toBe(true);
      });
    });

    it('deve retornar false para string arbitrária', () => {
      expect(isValidPeriod('manha ')).toBe(false);
      expect(isValidPeriod('dia')).toBe(false);
      expect(isValidPeriod('')).toBe(false);
    });
  });

  describe('assertValidMood', () => {
    it('não deve lançar erro para humor válido', () => {
      expect(() => assertValidMood('alegria')).not.toThrow();
    });

    it('deve lançar erro descritivo para humor inválido', () => {
      expect(() => assertValidMood('feliz')).toThrow('Humor inválido: "feliz"');
    });

    it('deve lançar erro para string vazia', () => {
      expect(() => assertValidMood('')).toThrow('Humor inválido: ""');
    });
  });

  describe('assertValidPeriod', () => {
    it('não deve lançar erro para período válido', () => {
      expect(() => assertValidPeriod('manha')).not.toThrow();
      expect(() => assertValidPeriod('tarde')).not.toThrow();
      expect(() => assertValidPeriod('noite')).not.toThrow();
    });

    it('deve lançar erro descritivo para período inválido', () => {
      expect(() => assertValidPeriod('dia')).toThrow('Período inválido: "dia"');
    });
  });
});
