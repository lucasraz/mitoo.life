import { create } from 'zustand';
import { supabase } from '../infra/supabase';
import { generatePoeticAlias, PoeticIdentity } from '../core/alias_generator';
import { Alert } from 'react-native';

/**
 * 🛰️ Auth Store (Camada de Orquestração)
 * Gerencia o estado de autenticação e a identidade anônima do usuário logado.
 */

interface AuthState {
  user: any | null;
  identity: (PoeticIdentity & { 
    realName?: string; 
    useAnonymous?: boolean;
    bio?: string;
    seenManifesto?: boolean;
  }) | null;
  loading: boolean;
  
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateAvatar: (url: string) => void;
  updateSeenManifesto: () => void;
  updateIdentityPreference: (useAnonymous: boolean) => void;
  updateBio: (bio: string) => void;
  setIdentity: (identity: any) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  identity: null,
  loading: true,

  setIdentity: (identity) => set({ identity }),

  updateAvatar: (url) => {
    const identity = get().identity;
    if (identity) {
      set({ identity: { ...identity, avatarUrl: url } });
    }
  },

  updateSeenManifesto: () => {
    const identity = get().identity;
    if (identity) {
      set({ identity: { ...identity, seenManifesto: true } });
    }
  },

  updateIdentityPreference: (useAnonymous) => {
    const identity = get().identity;
    if (identity) {
      set({ identity: { ...identity, useAnonymous } });
    }
  },

  updateBio: (bio) => {
    const identity = get().identity;
    if (identity) {
      set({ identity: { ...identity, bio } });
    }
  },

  checkSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Sincroniza dados do usuário da tabela public.users
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const identity = {
        name: profile?.anon_alias || 'Viajante',
        realName: profile?.user_name || 'Amigo(a)',
        useAnonymous: profile?.use_anonymous_alias ?? true,
        bio: profile?.bio || '',
        color: profile?.anon_color || '#CCC',
        avatarUrl: profile?.avatar_url,
        seenManifesto: profile?.seen_manifesto
      };
      
      set({ user: session.user, identity, loading: false });
    } else {
      set({ user: null, identity: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
       Alert.alert('Erro no Acesso', error.message);
       set({ loading: false });
       return;
    }
    
    await get().checkSession();
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      Alert.alert('Erro no Cadastro', error.message);
      set({ loading: false });
      return;
    }

    if (data.user) {
      const alias = generatePoeticAlias(data.user.id);
      
      // Cria o perfil inicial na tabela public.users
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ 
          id: data.user.id, 
          user_name: name,
          anon_alias: alias.name,
          anon_color: alias.color
        }]);

      if (profileError) {
        console.error('⚠️ Erro ao criar perfil:', profileError);
      }

      // Se o usuário existir mas não tiver uma sessão ativa (comum quando verificação de e-mail está ativa)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert(
          'Identidade Criada', 
          'Por favor, verifique seu e-mail para validar sua jornada e poder acessar.'
        );
      }
    }

    await get().checkSession();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, identity: null });
  },
}));

