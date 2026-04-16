import { supabase } from '../infra/supabase';

const COMMENT_CONTENT_MIN_LENGTH = 1;
const COMMENT_CONTENT_MAX_LENGTH = 500;

/**
 * Representa a linha bruta retornada pelo Supabase ao fazer JOIN com `users`.
 * Tipagem explícita elimina o uso de `any` e protege contra mudanças de schema.
 */
interface SupabaseCommentRow {
  id: string;
  post_id?: string;
  diary_entry_id?: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  users?: {
    anon_alias?: string;
    anon_color?: string;
    user_name?: string;
    avatar_url?: string;
  };
}

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
  /** 🛡️ SEGURANÇA: null para comentários anônimos. Nunca expor avatar de usuário anônimo. */
  author_avatar_url?: string | null;
}

function validateCommentContent(content: string): void {
  const trimmed = content.trim();
  if (trimmed.length < COMMENT_CONTENT_MIN_LENGTH) {
    throw new Error('O comentário não pode estar vazio.');
  }
  if (trimmed.length > COMMENT_CONTENT_MAX_LENGTH) {
    throw new Error(`O comentário deve ter no máximo ${COMMENT_CONTENT_MAX_LENGTH} caracteres.`);
  }
}

/**
 * 🛡️ SEGURANÇA: avatar_url só é exposto para comentários NÃO anônimos.
 * Expor a foto de perfil em um comentário anônimo deanonimiza o usuário visualmente.
 */
function mapCommentRow(comment: SupabaseCommentRow): Comment {
  return {
    ...comment,
    author_name: comment.is_anonymous
      ? comment.users?.anon_alias
      : comment.users?.user_name,
    author_color: comment.is_anonymous
      ? comment.users?.anon_color
      : '#CCCCCC',
    author_avatar_url: comment.is_anonymous ? null : comment.users?.avatar_url,
  };
}

export const CommentsRepository = {
  /**
   * Busca comentários de um relato (Post)
   */
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users(anon_alias, anon_color, user_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data as SupabaseCommentRow[]).map(mapCommentRow);
  },

  /**
   * Busca comentários de uma entrada do Diário
   */
  async getCommentsByDiaryEntry(diaryEntryId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users(anon_alias, anon_color, user_name, avatar_url)
      `)
      .eq('diary_entry_id', diaryEntryId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data as SupabaseCommentRow[]).map(mapCommentRow);
  },

  /**
   * Cria um novo comentário (anonimato poético respeitado)
   */
  async createComment(payload: {
    content: string;
    is_anonymous: boolean;
    postId?: string;
    diaryEntryId?: string;
  }): Promise<Comment> {
    if (!payload.postId && !payload.diaryEntryId) {
      throw new Error('Comentário deve estar vinculado a um post ou uma entrada de diário');
    }

    validateCommentContent(payload.content);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        content: payload.content,
        is_anonymous: payload.is_anonymous,
        post_id: payload.postId,
        diary_entry_id: payload.diaryEntryId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Comment;
  },
};
