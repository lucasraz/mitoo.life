import { supabase } from '../infra/supabase';

/**
 * 🛰️ Comments Repository (Camada de Intenção)
 * Responsável pelas regras de negócio e persistência de comentários em Posts e Diários.
 */

export interface Comment {
  id: string;
  post_id?: string;
  diary_entry_id?: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  author_name?: string;
  author_color?: string;
  author_avatar_url?: string;
}

export const CommentsRepository = {
  /**
   * Busca comentários de um relato (Post)
   */
  async getCommentsByPost(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users(anon_alias, anon_color, user_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map((comment: any) => ({
      ...comment,
      author_name: comment.is_anonymous ? comment.users?.anon_alias : comment.users?.user_name,
      author_color: comment.is_anonymous ? comment.users?.anon_color : '#CCCCCC',
      author_avatar_url: comment.users?.avatar_url
    }));
  },

  /**
   * Busca comentários de uma entrada do Diário
   */
  async getCommentsByDiaryEntry(diaryEntryId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users(anon_alias, anon_color, user_name, avatar_url)
      `)
      .eq('diary_entry_id', diaryEntryId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map((comment: any) => ({
      ...comment,
      author_name: comment.is_anonymous ? comment.users?.anon_alias : comment.users?.user_name,
      author_color: comment.is_anonymous ? comment.users?.anon_color : '#CCCCCC',
      author_avatar_url: comment.users?.avatar_url
    }));
  },

  /**
   * Cria um novo comentário (anonimato poético respeitado)
   */
  async createComment(payload: {
    content: string;
    is_anonymous: boolean;
    postId?: string;
    diaryEntryId?: string;
  }) {
    // Validação: deve ter um destino (Post ou Diário)
    if (!payload.postId && !payload.diaryEntryId) {
      throw new Error('Comentário deve estar vinculado a um post ou uma entrada de diário');
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.from('comments').insert({
      user_id: user.id,
      content: payload.content,
      is_anonymous: payload.is_anonymous,
      post_id: payload.postId,
      diary_entry_id: payload.diaryEntryId,
    }).select().single();

    if (error) throw error;
    return data;
  },
};
