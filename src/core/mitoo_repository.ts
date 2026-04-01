import { supabase } from '../infra/supabase';

/**
 * 🛰️ Mitoo Repository (Camada de Intenção)
 * Responsável pelas reações especiais de solidariedade emocional.
 */

export const MitooRepository = {
  /**
   * Adiciona ou remove uma reação "Mitoo" a um post
   */
  async toggleMitoo(postId: string, isAnonymous: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('mitoos')
      .upsert({
        post_id: postId,
        user_id: user.id,
        is_anonymous: isAnonymous
      }, { onConflict: 'post_id, user_id' });

    if (error) throw error;
    return data;
  },

  /**
   * Remove a reação "Mitoo"
   */
  async removeMitoo(postId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('mitoos')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  },

  /**
   * Busca a contagem de Mitoos para um conjunto de posts
   */
  async getMitooCounts(postIds: string[]) {
    const { data, error } = await supabase
      .from('mitoos')
      .select('post_id', { count: 'exact' })
      .in('post_id', postIds);

    if (error) throw error;
    
    // Agrupa resultados por post_id
    const counts: Record<string, number> = {};
    data.forEach((m: any) => {
      counts[m.post_id] = (counts[m.post_id] || 0) + 1;
    });
    
    return counts;
  }
};
