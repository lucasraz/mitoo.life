import { supabase } from '../infra/supabase';

/**
 * 🛰️ Diary Repository (Camada de Intenção)
 * Responsável pelas regras de persistência e leitura do Diário Público.
 */

export interface Diary {
  id: string;
  user_id: string;
  title: string;
  is_anonymous: boolean;
  mood_color: string;
  created_at: string;
  author_name?: string;
  author_color?: string;
}

export interface DiaryEntry {
  id: string;
  diary_id: string;
  content: string;
  mood: string;
  mood_color: string;
  period: string;
  created_at: string;
}

export const DiaryRepository = {
  /**
   * Busca diários públicos seguindo as regras de anonimato
   */
  async getPublicDiaries() {
    const { data, error } = await supabase
      .from('diaries')
      .select(`
        *,
        users(anon_alias, anon_color, user_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((diary: any) => ({
      ...diary,
      author_name: diary.is_anonymous ? diary.users?.anon_alias : diary.users?.user_name,
      author_color: diary.is_anonymous ? diary.users?.anon_color : '#CCCCCC',
    }));
  },

  /**
   * Busca diários de um usuário específico
   */
  async getDiariesByUserId(userId: string) {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Busca as entradas de um diário específico
   */
  async getEntriesByDiaryId(diaryId: string) {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('diary_id', diaryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Cria um diário (um por usuário)
   */
  async createDiary(payload: {
    title: string;
    is_anonymous: boolean;
    mood_color: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.from('diaries').insert({
      user_id: user.id,
      title: payload.title,
      is_anonymous: payload.is_anonymous,
      mood_color: payload.mood_color
    }).select().single();

    if (error) throw error;
    return data;
  },

  /**
   * Adiciona uma nova entrada no diário
   */
  async addEntry(payload: {
    diaryId: string;
    content: string;
    mood: string;
    mood_color: string;
    period: string;
  }) {
    const { data, error } = await supabase.from('diary_entries').insert({
      diary_id: payload.diaryId,
      content: payload.content,
      mood: payload.mood,
      mood_color: payload.mood_color,
      period: payload.period
    }).select().single();

    if (error) throw error;
    return data;
  }
};
