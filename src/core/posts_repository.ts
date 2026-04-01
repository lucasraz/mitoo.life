import { supabase } from '../infra/supabase';

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

export const PostsRepository = {
  /**
   * Busca posts públicos seguros (via View v_feed_public)
   */
  async getPublicFeed(mood?: string, searchQuery?: string) {
    let query = supabase
      .from('v_feed_public')
      .select('*')
      .order('created_at', { ascending: false });

    if (mood) {
      query = query.eq('mood', mood);
    }

    if (searchQuery) {
      query = query.ilike('content', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Busca posts recentes de um usuário específico (últimos 7 dias)
   */
  async getUserRecentPosts(userId: string, days: number = 7) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const { data, error } = await supabase
      .from('v_feed_public')
      .select('*')
      .eq('author_id', userId)
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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
  }) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.from('posts').insert({
      user_id: userData.user.id,
      content: payload.content,
      mood: payload.mood,
      mood_color: payload.mood_color,
      period: payload.period,
      is_anonymous: payload.is_anonymous,
      location: payload.latitude ? `POINT(${payload.longitude} ${payload.latitude})` : null,
    });

    if (error) throw error;
    return data;
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
