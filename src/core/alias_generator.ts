/**
 * 🛰️ Poetic Alias Generator
 * Camada: Estrutura (Regras de Identidade)
 * Gera nomes anônimos poéticos e cores para os usuários (Ex: Lua Prateada).
 */

const NOUNS = ['Lua', 'Sol', 'Mar', 'Vento', 'Estrela', 'Montanha', 'Rio', 'Floresta', 'Nuvem', 'Pássaro'];
const ADJECTIVES = ['Sereno', 'Brilhante', 'Profundo', 'Livre', 'Calmo', 'Cinzento', 'Dourado', 'Silencioso', 'Infinito', 'Raro'];
const COLORS = ['#FFD700', '#C0C0C0', '#4169E1', '#8B4513', '#2E8B57', '#9370DB', '#FF4500', '#2F4F4F'];

export interface PoeticIdentity {
  name: string;
  color: string;
  avatarUrl?: string | null;
}

export function generatePoeticAlias(seed: string): PoeticIdentity {
  // Usar a seed (user_id) para garantir o mesmo nome sempre para o mesmo usuário
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const noun = NOUNS[hash % NOUNS.length];
  const adj = ADJECTIVES[hash % ADJECTIVES.length];
  const color = COLORS[hash % COLORS.length];

  return {
    name: `${noun} ${adj}`,
    color: color,
  };
}
