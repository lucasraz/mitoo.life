import { supabase } from '../infra/supabase';

/**
 * 🛰️ Connections Repository (Camada de Execução)
 * Gerencia a lógica de favoritar usuários e salvar apelidos personalizados.
 */

export interface UserFavorite {
  id: string;
  follower_id: string;
  following_id: string;
  nickname?: string;
  created_at: string;
}

export const ConnectionsRepository = {
  /**
   * Favorita um usuário com um apelido opcional
   */
  async favoriteUser(followerId: string, followingId: string, nickname?: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .upsert({ 
        follower_id: followerId, 
        following_id: followingId, 
        nickname 
      }, { onConflict: 'follower_id,following_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove um favorito
   */
  async unfavoriteUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    return true;
  },

  /**
   * Verifica se o usuário é favorito e busca o apelido
   */
  async getFavoriteStatus(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
