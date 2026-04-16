import { supabase } from '../infra/supabase';

/**
 * 🛰️ Diary Social Repository (Camada de Execução)
 * Gerencia a lógica de seguir diários e reagir às entradas.
 */

export const DiarySocialRepository = {
  // ─── FOLLOWERS ────────────────────────────────────────────────────────────

  /**
   * Segue ou deixa de seguir um diário
   */
  async toggleFollowDiary(diaryId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verifica se já segue
    const { data: existing } = await supabase
      .from('diary_followers')
      .select('id')
      .eq('diary_id', diaryId)
      .eq('follower_id', user.id)
      .maybeSingle();

    if (existing) {
      // Deixar de seguir
      const { error } = await supabase
        .from('diary_followers')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return { action: 'unfollowed' };
    } else {
      // Seguir
      const { error } = await supabase
        .from('diary_followers')
        .insert({
          diary_id: diaryId,
          follower_id: user.id,
        });
      if (error) throw error;
      return { action: 'followed' };
    }
  },

  /**
   * Verifica se o usuário atual segue o diário
   */
  async isFollowingDiary(diaryId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('diary_followers')
      .select('id')
      .eq('diary_id', diaryId)
      .eq('follower_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  /**
   * Retorna os IDs dos diários que o usuário logado segue (útil para feeds e listas)
   */
  async getFollowedDiariesIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('diary_followers')
      .select('diary_id')
      .eq('follower_id', user.id);

    if (error) throw error;
    return data.map(row => row.diary_id);
  },

  /**
   * Conta o número de seguidores de um diário
   */
  async getFollowerCount(diaryId: string) {
    const { count, error } = await supabase
      .from('diary_followers')
      .select('*', { count: 'exact', head: true })
      .eq('diary_id', diaryId);

    if (error) throw error;
    return count || 0;
  },

  // ─── REACTIONS ────────────────────────────────────────────────────────────

  /**
   * Adiciona ou remove uma reação em uma entrada do diário
   */
  async toggleReaction(entryId: string, isAnonymous: boolean = true) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: existing } = await supabase
      .from('diary_reactions')
      .select('id')
      .eq('entry_id', entryId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Remover reação
      const { error } = await supabase
        .from('diary_reactions')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return { action: 'removed' };
    } else {
      // Adicionar reação
      const { error } = await supabase
        .from('diary_reactions')
        .insert({
          entry_id: entryId,
          user_id: user.id,
          type: 'mitoo',
          is_anonymous: isAnonymous,
        });
      if (error) throw error;
      return { action: 'added' };
    }
  },

  /**
   * Conta o número de reações de uma entrada do diário
   */
  async getReactionCount(entryId: string) {
    const { count, error } = await supabase
      .from('diary_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('entry_id', entryId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Verifica se o usuário atual reagiu à entrada
   */
  async hasReacted(entryId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('diary_reactions')
      .select('id')
      .eq('entry_id', entryId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
};
