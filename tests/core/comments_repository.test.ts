import { CommentsRepository } from '../../src/core/comments_repository';
import { supabase } from '../../src/infra/supabase';

/**
 * 🧪 Testes de TDD: CommentsRepository
 * Cobre: regras de negócio, validação e proteção do anonimato.
 */

jest.mock('../../src/infra/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('CommentsRepository', () => {
  const makeRow = (overrides = {}) => ({
    id: '1',
    content: 'Que experiência incrível!',
    is_anonymous: true,
    post_id: 'post-123',
    user_id: 'user-456',
    created_at: new Date().toISOString(),
    users: {
      anon_alias: 'Lua Cinzenta',
      anon_color: '#8B5CF6',
      user_name: 'Lucas',
      avatar_url: 'https://cdn.mitoo.life/foto.png',
    },
    ...overrides,
  });

  const mockQueryChain = (rows: unknown[]) => {
    const orderMock = jest.fn().mockResolvedValue({ data: rows, error: null });
    const eqMock = jest.fn().mockReturnValue({ order: orderMock });
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getCommentsByPost ───────────────────────────────────────────────────

  describe('getCommentsByPost', () => {
    it('deve buscar comentários de um post corretamente', async () => {
      mockQueryChain([makeRow()]);

      const comments = await CommentsRepository.getCommentsByPost('post-123');

      expect(supabase.from).toHaveBeenCalledWith('comments');
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toBe('Que experiência incrível!');
    });

    it('🛡️ SEGURANÇA: deve ocultar avatar_url em comentários anônimos', async () => {
      mockQueryChain([makeRow({ is_anonymous: true })]);

      const [comment] = await CommentsRepository.getCommentsByPost('post-123');

      expect(comment.author_avatar_url).toBeNull();
    });

    it('🛡️ SEGURANÇA: deve expor avatar_url apenas em comentários não anônimos', async () => {
      mockQueryChain([makeRow({ is_anonymous: false })]);

      const [comment] = await CommentsRepository.getCommentsByPost('post-123');

      expect(comment.author_avatar_url).toBe('https://cdn.mitoo.life/foto.png');
    });

    it('deve usar anon_alias como author_name em comentários anônimos', async () => {
      mockQueryChain([makeRow({ is_anonymous: true })]);

      const [comment] = await CommentsRepository.getCommentsByPost('post-123');

      expect(comment.author_name).toBe('Lua Cinzenta');
    });

    it('deve usar user_name como author_name em comentários não anônimos', async () => {
      mockQueryChain([makeRow({ is_anonymous: false })]);

      const [comment] = await CommentsRepository.getCommentsByPost('post-123');

      expect(comment.author_name).toBe('Lucas');
    });
  });

  // ─── createComment ───────────────────────────────────────────────────────

  describe('createComment', () => {
    const mockInsertChain = (returnData: unknown) => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-456' } },
      });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: returnData, error: null }),
          }),
        }),
      });
    };

    it('deve criar um comentário se o usuário estiver autenticado', async () => {
      mockInsertChain(makeRow());

      const result = await CommentsRepository.createComment({
        content: 'Comentário teste',
        is_anonymous: true,
        postId: 'post-123',
      });

      expect(supabase.from).toHaveBeenCalledWith('comments');
      expect(result).toBeDefined();
    });

    it('deve rejeitar comentário sem destino (sem postId e sem diaryEntryId)', async () => {
      await expect(
        CommentsRepository.createComment({
          content: 'Comentário perdido',
          is_anonymous: true,
        })
      ).rejects.toThrow('Comentário deve estar vinculado a um post ou uma entrada de diário');
    });

    it('deve rejeitar comentário vazio', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-456' } },
      });

      await expect(
        CommentsRepository.createComment({
          content: '   ',
          is_anonymous: true,
          postId: 'post-123',
        })
      ).rejects.toThrow('O comentário não pode estar vazio.');
    });

    it('deve rejeitar comentário acima de 500 caracteres', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-456' } },
      });

      await expect(
        CommentsRepository.createComment({
          content: 'A'.repeat(501),
          is_anonymous: true,
          postId: 'post-123',
        })
      ).rejects.toThrow('O comentário deve ter no máximo 500 caracteres.');
    });

    it('deve falhar ao criar comentário se o usuário não estiver autenticado', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      await expect(
        CommentsRepository.createComment({
          content: 'Teste sem login',
          is_anonymous: true,
          postId: 'post-123',
        })
      ).rejects.toThrow('Usuário não autenticado');
    });
  });
});
