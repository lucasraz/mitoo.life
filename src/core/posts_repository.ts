import { supabase } from '../infra/supabase';
import { assertValidMood, assertValidPeriod } from './mood_types';

const POST_CONTENT_MIN_LENGTH = 1;
const POST_CONTENT_MAX_LENGTH = 1000;
const SEARCH_QUERY_MAX_LENGTH = 100;

/**
 * 🛰️ Posts Repository (Camada de Intenção)
 * Responsável pelas regras de persistência e leitura de relatos (Posts).
 */

export interface Post {
  id: string;
  content: string;
  mood: string;
  mood_color: string;
  period: string;
  is_anonymous: boolean;
  created_at: string;
  author_id?: string;
  author_name?: string;
  author_color?: string;
  author_avatar_url?: string;
  author_bio?: string;
  comment_count?: number;
  mitoo_count?: number;
  latitude?: number;
  longitude?: number;
}

function validatePostContent(content: string): void {
  const trimmed = content.trim();
  if (trimmed.length < POST_CONTENT_MIN_LENGTH) {
    throw new Error('O relato não pode estar vazio.');
  }
  if (trimmed.length > POST_CONTENT_MAX_LENGTH) {
    throw new Error(`O relato deve ter no máximo ${POST_CONTENT_MAX_LENGTH} caracteres.`);
  }
}

function sanitizeSearchQuery(query: string): string {
  return query.trim().slice(0, SEARCH_QUERY_MAX_LENGTH);
}

export const PostsRepository = {
  /**
   * Busca posts públicos seguros (via View v_feed_public)
   */
  async getPublicFeed(mood?: string, searchQuery?: string): Promise<Post[]> {
    let query = supabase
      .from('v_feed_public')
      .select('*')
      .order('created_at', { ascending: false });

    if (mood) {
      query = query.eq('mood', mood);
    }

    if (searchQuery) {
      const sanitized = sanitizeSearchQuery(searchQuery);
      if (sanitized.length > 0) {
        query = query.ilike('content', `%${sanitized}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Post[];
  },

  /**
   * Busca posts recentes de um usuário específico (últimos N dias)
   */
  async getUserRecentPosts(userId: string, days: number = 7): Promise<Post[]> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const { data, error } = await supabase
      .from('v_feed_public')
      .select('*')
      .eq('author_id', userId)
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Post[];
  },

  /**
   * Cria um novo relato com humor e localização opcional
   */
  async createPost(payload: {
    content: string;
    mood: string;
    mood_color: string;
    period: string;
    is_anonymous: boolean;
    latitude?: number;
    longitude?: number;
  }): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    validatePostContent(payload.content);
    assertValidMood(payload.mood);
    assertValidPeriod(payload.period);

    const { data, error } = await supabase.from('posts').insert({
      user_id: userData.user.id,
      content: payload.content,
      mood: payload.mood,
      mood_color: payload.mood_color,
      period: payload.period,
      is_anonymous: payload.is_anonymous,
      location: payload.latitude
        ? `POINT(${payload.longitude} ${payload.latitude})`
        : null,
    });

    if (error) throw error;
    return data ?? undefined;
  },

  /**
   * Busca clusters de humor para o Mapa Global (Anonimato por agregação)
   */
  async getMoodClusters(bounds: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  }) {
    const { data, error } = await supabase.rpc('get_mood_clusters', {
      min_lat: bounds.minLat,
      min_lng: bounds.minLng,
      max_lat: bounds.maxLat,
      max_lng: bounds.maxLng,
      grid_size: 0.05, // Aprox 5km para maior anonimato e clareza visual
    });

    if (error) throw error;
    return data;
  },
};
