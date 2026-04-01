import { supabase } from '../infra/supabase';

/**
 * 🛰️ User Repository (Camada de Intenção)
 * Responsável pelo gerenciamento de perfis e upload de mídia.
 */

export const UserRepository = {
  /**
   * Faz o upload de uma imagem para o Supabase Storage e retorna a URL pública
   */
  async uploadAvatar(userId: string, fileUri: string) {
    const fileExt = fileUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Abordagem universal para obter o binário (Web e Mobile)
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: true
      });

    if (error) throw error;

    // Retorna a URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  /**
   * Atualiza a URL do avatar no perfil do usuário (public.users)
   */
  async updateAvatarUrl(userId: string, avatarUrl: string) {
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Marca o manifesto como lido pelo usuário
   */
  async markManifestoAsSeen(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ seen_manifesto: true })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Atualiza a preferência de exibição do nome (Real vs Poético)
   */
  async updateIdentityPreference(userId: string, useAnonymous: boolean) {
    const { error } = await supabase
      .from('users')
      .update({ use_anonymous_alias: useAnonymous })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Atualiza o perfil completo do usuário (Bio + Preferência de Identidade)
   */
  async updateUserProfile(userId: string, data: { bio: string, useAnonymous: boolean }) {
    const { error } = await supabase
      .from('users')
      .update({ 
        bio: data.bio, 
        use_anonymous_alias: data.useAnonymous 
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  /**
   * Busca dados públicos de um usuário externo
   */
  async getPublicProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, user_name, anon_alias, anon_color, avatar_url, bio, use_anonymous_alias')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
};
