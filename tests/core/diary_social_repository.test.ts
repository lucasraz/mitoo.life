import { DiarySocialRepository } from '../../src/core/diary_social_repository';
import { supabase } from '../../src/infra/supabase';

/**
 * 🧪 Testes de TDD: DiarySocialRepository
 */

jest.mock('../../src/infra/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  },
}));

describe('DiarySocialRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
  });

  describe('toggleFollowDiary', () => {
    it('deve deixar de seguir se já segue', async () => {
      const maybeSingleMock = jest.fn().mockResolvedValue({ data: { id: 'follow-1' }, error: null });
      const eq2Mock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eq1Mock = jest.fn().mockReturnValue({ eq: eq2Mock });
      const selectMock = jest.fn().mockReturnValue({ eq: eq1Mock });

      const deleteEqMock = jest.fn().mockResolvedValue({ error: null });
      const deleteMock = jest.fn().mockReturnValue({ eq: deleteEqMock });

      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'diary_followers') {
          return { select: selectMock, delete: deleteMock };
        }
      });

      const result = await DiarySocialRepository.toggleFollowDiary('diary-1');
      expect(result.action).toBe('unfollowed');
      expect(deleteEqMock).toHaveBeenCalledWith('id', 'follow-1');
    });

    it('deve seguir se ainda não segue', async () => {
      const maybeSingleMock = jest.fn().mockResolvedValue({ data: null, error: null });
      const eq2Mock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eq1Mock = jest.fn().mockReturnValue({ eq: eq2Mock });
      const selectMock = jest.fn().mockReturnValue({ eq: eq1Mock });

      const insertMock = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'diary_followers') {
          return { select: selectMock, insert: insertMock };
        }
      });

      const result = await DiarySocialRepository.toggleFollowDiary('diary-1');
      expect(result.action).toBe('followed');
      expect(insertMock).toHaveBeenCalledWith({
        diary_id: 'diary-1',
        follower_id: 'user-123',
      });
    });
  });

  describe('toggleReaction', () => {
    it('deve remover reação se já reagiu', async () => {
      const maybeSingleMock = jest.fn().mockResolvedValue({ data: { id: 'react-1' }, error: null });
      const eq2Mock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eq1Mock = jest.fn().mockReturnValue({ eq: eq2Mock });
      const selectMock = jest.fn().mockReturnValue({ eq: eq1Mock });

      const deleteEqMock = jest.fn().mockResolvedValue({ error: null });
      const deleteMock = jest.fn().mockReturnValue({ eq: deleteEqMock });

      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'diary_reactions') {
          return { select: selectMock, delete: deleteMock };
        }
      });

      const result = await DiarySocialRepository.toggleReaction('entry-1');
      expect(result.action).toBe('removed');
    });

    it('deve adicionar reação se ainda não reagiu', async () => {
      const maybeSingleMock = jest.fn().mockResolvedValue({ data: null, error: null });
      const eq2Mock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eq1Mock = jest.fn().mockReturnValue({ eq: eq2Mock });
      const selectMock = jest.fn().mockReturnValue({ eq: eq1Mock });

      const insertMock = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'diary_reactions') {
          return { select: selectMock, insert: insertMock };
        }
      });

      const result = await DiarySocialRepository.toggleReaction('entry-1', true);
      expect(result.action).toBe('added');
      expect(insertMock).toHaveBeenCalledWith({
        entry_id: 'entry-1',
        user_id: 'user-123',
        type: 'mitoo',
        is_anonymous: true,
      });
    });
  });
});
