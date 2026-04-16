import { supabase } from '../infra/supabase';
import { assertValidMood, assertValidPeriod } from './mood_types';

const DIARY_TITLE_MAX_LENGTH = 100;
const ENTRY_CONTENT_MAX_LENGTH = 2000;
const ENTRY_CONTENT_MIN_LENGTH = 1;

/**
 * Linha bruta retornada pelo Supabase com JOIN na tabela users.
 */
interface SupabaseDiaryRow {
  id: string;
  user_id: string;
  title: string;
  is_anonymous: boolean;
  mood_color: string;
  created_at: string;
  users?: {
    anon_alias?: string;
    anon_color?: string;
    user_name?: string;
  };
}

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

function validateDiaryTitle(title: string): void {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error('O título do diário não pode estar vazio.');
  }
  if (trimmed.length > DIARY_TITLE_MAX_LENGTH) {
    throw new Error(`O título deve ter no máximo ${DIARY_TITLE_MAX_LENGTH} caracteres.`);
  }
}

function validateEntryContent(content: string): void {
  const trimmed = content.trim();
  if (trimmed.length < ENTRY_CONTENT_MIN_LENGTH) {
    throw new Error('A entrada do diário não pode estar vazia.');
  }
  if (trimmed.length > ENTRY_CONTENT_MAX_LENGTH) {
    throw new Error(`A entrada deve ter no máximo ${ENTRY_CONTENT_MAX_LENGTH} caracteres.`);
  }
}

function mapDiaryRow(diary: SupabaseDiaryRow): Diary {
  return {
    id: diary.id,
    user_id: diary.user_id,
    title: diary.title,
    is_anonymous: diary.is_anonymous,
    mood_color: diary.mood_color,
    created_at: diary.created_at,
    author_name: diary.is_anonymous
      ? diary.users?.anon_alias
      : diary.users?.user_name,
    author_color: diary.is_anonymous
      ? diary.users?.anon_color
      : '#CCCCCC',
  };
}

export const DiaryRepository = {
  /**
   * Busca diários públicos respeitando as regras de anonimato
   */
  async getPublicDiaries(): Promise<Diary[]> {
    const { data, error } = await supabase
      .from('diaries')
      .select(`
        *,
        users(anon_alias, anon_color, user_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as SupabaseDiaryRow[]).map(mapDiaryRow);
  },

  /**
   * Busca um diário específico pelo ID (inclui dados do autor)
   */
  async getDiaryById(diaryId: string): Promise<Diary> {
    const { data, error } = await supabase
      .from('diaries')
      .select(`
        *,
        users(anon_alias, anon_color, user_name)
      `)
      .eq('id', diaryId)
      .single();

    if (error) throw error;
    return mapDiaryRow(data as SupabaseDiaryRow);
  },

  /**
   * Busca diários de um usuário específico
   */
  async getDiariesByUserId(userId: string): Promise<Diary[]> {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Diary[];
  },

  /**
   * Busca todas as entradas de um diário, em ordem cronológica
   */
  async getEntriesByDiaryId(diaryId: string): Promise<DiaryEntry[]> {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('diary_id', diaryId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as DiaryEntry[];
  },

  /**
   * Busca uma entrada específica pelo ID
   */
  async getEntryById(entryId: string): Promise<DiaryEntry> {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error) throw error;
    return data as DiaryEntry;
  },

  /**
   * Cria um diário (um por usuário)
   */
  async createDiary(payload: {
    title: string;
    is_anonymous: boolean;
    mood_color: string;
  }): Promise<Diary> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    validateDiaryTitle(payload.title);

    const { data, error } = await supabase
      .from('diaries')
      .insert({
        user_id: user.id,
        title: payload.title,
        is_anonymous: payload.is_anonymous,
        mood_color: payload.mood_color,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Diary;
  },

  /**
   * Adiciona uma nova entrada ao diário com validação de domínio
   */
  async addEntry(payload: {
    diaryId: string;
    content: string;
    mood: string;
    mood_color: string;
    period: string;
  }): Promise<DiaryEntry> {
    validateEntryContent(payload.content);
    assertValidMood(payload.mood);
    assertValidPeriod(payload.period);

    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        diary_id: payload.diaryId,
        content: payload.content,
        mood: payload.mood,
        mood_color: payload.mood_color,
        period: payload.period,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DiaryEntry;
  },
};
