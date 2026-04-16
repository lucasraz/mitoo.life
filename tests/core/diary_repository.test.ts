import { DiaryRepository } from '../../src/core/diary_repository';
import { supabase } from '../../src/infra/supabase';

/**
 * 🧪 Testes de TDD: DiaryRepository
 * Cobre: anonimato, validação de entradas, busca por ID.
 */

jest.mock('../../src/infra/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  },
}));

describe('DiaryRepository', () => {
  const makeDiaryRow = (overrides = {}) => ({
    id: 'diary-1',
    user_id: 'user-99',
    title: 'Jornada do Silêncio',
    is_anonymous: true,
    mood_color: '#8B5CF6',
    created_at: new Date().toISOString(),
    users: {
      anon_alias: 'Névoa Azul',
      anon_color: '#534AB7',
      user_name: 'Lucas',
    },
    ...overrides,
  });

  const makeEntry = (overrides = {}) => ({
    id: 'entry-1',
    diary_id: 'diary-1',
    content: 'Hoje foi difícil, mas segui em frente.',
    mood: 'tristeza',
    mood_color: '#534AB7',
    period: 'noite',
    created_at: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => jest.clearAllMocks());

  // ─── getPublicDiaries ────────────────────────────────────────────────────

  describe('getPublicDiaries', () => {
    const mockListQuery = (rows: unknown[]) => {
      const orderMock = jest.fn().mockResolvedValue({ data: rows, error: null });
      const selectMock = jest.fn().mockReturnValue({ order: orderMock });
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });
    };

    it('deve mapear author_name para anon_alias em diários anônimos', async () => {
      mockListQuery([makeDiaryRow({ is_anonymous: true })]);
      const [diary] = await DiaryRepository.getPublicDiaries();
      expect(diary.author_name).toBe('Névoa Azul');
    });

    it('deve mapear author_name para user_name em diários não anônimos', async () => {
      mockListQuery([makeDiaryRow({ is_anonymous: false })]);
      const [diary] = await DiaryRepository.getPublicDiaries();
      expect(diary.author_name).toBe('Lucas');
    });
  });

  // ─── getDiaryById ────────────────────────────────────────────────────────

  describe('getDiaryById', () => {
    const mockSingleQuery = (row: unknown) => {
      const singleMock = jest.fn().mockResolvedValue({ data: row, error: null });
      const eqMock = jest.fn().mockReturnValue({ single: singleMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });
    };

    it('deve retornar o diário com o id correto', async () => {
      mockSingleQuery(makeDiaryRow());
      const diary = await DiaryRepository.getDiaryById('diary-1');
      expect(diary.id).toBe('diary-1');
      expect(diary.title).toBe('Jornada do Silêncio');
    });
  });

  // ─── getEntriesByDiaryId ─────────────────────────────────────────────────

  describe('getEntriesByDiaryId', () => {
    it('deve retornar lista de entradas de um diário', async () => {
      const orderMock = jest.fn().mockResolvedValue({ data: [makeEntry()], error: null });
      const eqMock = jest.fn().mockReturnValue({ order: orderMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

      const entries = await DiaryRepository.getEntriesByDiaryId('diary-1');
      expect(entries).toHaveLength(1);
      expect(entries[0].content).toBe('Hoje foi difícil, mas segui em frente.');
    });
  });

  // ─── addEntry ────────────────────────────────────────────────────────────

  describe('addEntry', () => {
    it('deve rejeitar entrada com mood inválido', async () => {
      await expect(
        DiaryRepository.addEntry({
          diaryId: 'diary-1',
          content: 'Hoje foi um dia estranho.',
          mood: 'feliz_demais',
          mood_color: '#FFF',
          period: 'noite',
        })
      ).rejects.toThrow('Humor inválido: "feliz_demais"');
    });

    it('deve rejeitar entrada com period inválido', async () => {
      await expect(
        DiaryRepository.addEntry({
          diaryId: 'diary-1',
          content: 'Hoje foi um dia estranho.',
          mood: 'alegria',
          mood_color: '#EF9F27',
          period: 'madrugada',
        })
      ).rejects.toThrow('Período inválido: "madrugada"');
    });

    it('deve rejeitar entrada vazia', async () => {
      await expect(
        DiaryRepository.addEntry({
          diaryId: 'diary-1',
          content: '   ',
          mood: 'alegria',
          mood_color: '#EF9F27',
          period: 'manha',
        })
      ).rejects.toThrow('A entrada do diário não pode estar vazia.');
    });
  });
});
