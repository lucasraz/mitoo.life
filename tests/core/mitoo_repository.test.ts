import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { MitooRepository } from '../../src/core/mitoo_repository';
import { supabase } from '../../src/infra/supabase';

/**
 * 🧪 Testes de TDD: MitooRepository
 * Objetivo: Garantir as regras de negócio para reações de solidariedade (Mitoos).
 */

jest.mock('../../src/infra/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('MitooRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar um mitoo se o usuário estiver logado', async () => {
    (supabase.auth.getUser as jest.MockedFunction<any>).mockResolvedValue({
      data: { user: { id: 'user-1' } },
    } as any);

    (supabase.from as jest.MockedFunction<any>).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ data: null, error: null } as any),
    } as any);

    await MitooRepository.toggleMitoo('post-1', true);

    expect(supabase.from).toHaveBeenCalledWith('mitoos');
  });

  it('deve falhar se o usuário não estiver logado ao tentar dar mitoo', async () => {
    (supabase.auth.getUser as jest.MockedFunction<any>).mockResolvedValue({
      data: { user: null },
    } as any);

    await expect(MitooRepository.toggleMitoo('post-1', true)).rejects.toThrow('Usuário não autenticado');
  });
});
