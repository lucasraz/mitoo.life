/**
 * 🛡️ Logger — Camada: Infra
 *
 * Logger centralizado e seguro. Só imprime em desenvolvimento (__DEV__).
 * Em produção web (Cloudflare Pages), é completamente silencioso,
 * evitando que stack traces vazem informações da infraestrutura para o console do browser.
 */

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const logger = {
  warn: (message: string, ...args: unknown[]): void => {
    if (isDev) console.warn(`⚠️ ${message}`, ...args);
  },

  error: (message: string, error?: unknown): void => {
    if (isDev) console.error(`🚨 ${message}`, error);
  },

  info: (message: string, ...args: unknown[]): void => {
    if (isDev) console.log(`ℹ️ ${message}`, ...args);
  },
};
