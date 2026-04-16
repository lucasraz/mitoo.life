/**
 * 🎭 Mood Types — Camada: Core (Intenção)
 *
 * Enums de domínio para humores e períodos do dia.
 * Fonte única de verdade: elimina strings mágicas no código inteiro.
 * Estados ilegais tornam-se impossíveis de representar.
 */

export const VALID_MOODS = [
  'alegria',
  'tristeza',
  'raiva',
  'medo',
  'amor',
  'ansiedade',
  'gratidao',
  'solidao',
] as const;

export const VALID_PERIODS = ['manha', 'tarde', 'noite'] as const;

export type Mood = (typeof VALID_MOODS)[number];
export type Period = (typeof VALID_PERIODS)[number];

export function isValidMood(value: string): value is Mood {
  return VALID_MOODS.includes(value as Mood);
}

export function isValidPeriod(value: string): value is Period {
  return VALID_PERIODS.includes(value as Period);
}

export function assertValidMood(value: string): void {
  if (!isValidMood(value)) {
    throw new Error(`Humor inválido: "${value}". Valores aceitos: ${VALID_MOODS.join(', ')}`);
  }
}

export function assertValidPeriod(value: string): void {
  if (!isValidPeriod(value)) {
    throw new Error(`Período inválido: "${value}". Valores aceitos: ${VALID_PERIODS.join(', ')}`);
  }
}
