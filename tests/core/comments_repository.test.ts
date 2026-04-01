import { CommentsRepository } from '../../src/core/comments_repository';
import { supabase } from '../../src/infra/supabase';

/**
 * 🧪 Testes de TDD: CommentsRepository
 * Objetivo: Garantir as regras de negócio para comentários.
 */

// Mock do Supabase
jest.mock('../../src/infra/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('CommentsRepository', () => {
  const mockComment = {
    id: '1',
    content: 'Que experiência incrível!',
    is_anonymous: true,
    post_id: 'post-123',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar comentários de um post corretamente', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [mockComment], error: null }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const comments = await CommentsRepository.getCommentsByPost('post-123');

    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(comments).toHaveLength(1);
    expect(comments[0].content).toBe('Que experiência incrível!');
  });

  it('deve criar um comentário se o usuário estiver autenticado', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-456' } },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: mockComment, error: null }),
    });

    const newComment = await CommentsRepository.createComment({
      content: 'Comentário teste',
      is_anonymous: true,
      postId: 'post-123',
    });

    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(newComment).toBeDefined();
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
