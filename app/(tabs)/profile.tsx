import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/store/auth_store';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { UserRepository } from '../../src/core/user_repository';
import { supabase } from '../../src/infra/supabase';
import { LogOut, Heart, MessageCircle, Camera, BookOpen, Check } from 'lucide-react-native';
import { ManifestoModal } from '../../src/ui/components/ManifestoModal';

/**
 * 🛰️ Profile Screen (Perfil Poético)
 * Camada: UI (Identidade e Histórico)
 */

export default function ProfileScreen() {
  const { identity, signOut, user, updateAvatar } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [stats, setStats] = useState({ posts: 0, mitoos: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const theme = useThemePeriod();

  const handleUpdatePreference = (useAnonymous: boolean) => {
    useAuthStore.getState().updateIdentityPreference(useAnonymous);
  };

  const handleSaveProfile = async () => {
    if (!user || !identity) return;
    try {
      setIsSaving(true);
      await UserRepository.updateUserProfile(user.id, {
        bio: identity.bio || '',
        useAnonymous: identity.useAnonymous ?? true
      });
      Alert.alert('Sucesso', 'Seu perfil poético foi atualizado!');
    } catch (e) {
      console.warn('Erro ao salvar perfil:', e);
      Alert.alert('Erro', 'Não foi possível salvar suas alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // 1. Conta Relatos do usuário
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // 2. Conta Mitoos recebidos (Em posts do usuário)
      // Nota: Idealmente isso seria uma view ou RPC para performance
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id);
      
      const postIds = userPosts?.map(p => p.id) || [];
      
      let mitooCount = 0;
      if (postIds.length > 0) {
        const { count } = await supabase
          .from('mitoos')
          .select('*', { count: 'exact', head: true })
          .in('post_id', postIds);
        mitooCount = count || 0;
      }

      setStats({
        posts: postCount || 0,
        mitoos: mitooCount
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handlePickImage = async () => {
    if (!user) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        const publicUrl = await UserRepository.uploadAvatar(user.id, result.assets[0].uri);
        await UserRepository.updateAvatarUrl(user.id, publicUrl);
        updateAvatar(publicUrl);
        Alert.alert('Sucesso', 'Sua essência visual foi atualizada.');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não conseguimos capturar sua imagem agora.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Poético */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Sua Essência</Text>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <LogOut size={22} color={theme.text + '80'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.avatarLarge, { backgroundColor: identity?.color || '#CCC' }]}
          onPress={handlePickImage}
          disabled={uploading}
        >
          {identity?.avatarUrl ? (
            <Image source={{ uri: identity.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{identity?.name[0] || '?'}</Text>
          )}
          
          <View style={[styles.cameraOverlay, { backgroundColor: theme.primary }]}>
            {uploading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Camera size={16} color="#FFF" />
            )}
          </View>
        </TouchableOpacity>
        
        <Text style={[styles.poeticName, { color: theme.text }]}>{identity?.name || 'Visitante'}</Text>
        
        <TextInput
          style={[styles.bioInput, { color: theme.text, backgroundColor: theme.primary + '08' }]}
          value={identity?.bio || ''}
          onChangeText={(txt) => useAuthStore.getState().updateBio(txt)}
          placeholder="Sua frase de impacto..."
          placeholderTextColor={theme.text + '40'}
          maxLength={50}
          multiline={false}
        />
        <Text style={[styles.charCount, { color: theme.text }]}>
          {(identity?.bio?.length || 0)}/50
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: theme.text + '08' }]}>
          <MessageCircle size={20} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.posts}</Text>
          <Text style={[styles.statLabel, { color: theme.text, opacity: 0.5 }]}>Relatos</Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.text + '08' }]}>
          <Heart size={20} color="#E24B4A" />
          <Text style={[styles.statValue, { color: theme.text }]}>{stats.mitoos}</Text>
          <Text style={[styles.statLabel, { color: theme.text, opacity: 0.5 }]}>Mitoos</Text>
        </View>
      </View>

      <View style={[styles.identitySelection, { backgroundColor: theme.primary + '05', borderColor: theme.primary + '15' }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Como deseja ser chamado?</Text>
        <View style={styles.identityOptions}>
          <TouchableOpacity 
            style={[
              styles.identityOption, 
              !identity?.useAnonymous && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
            onPress={() => handleUpdatePreference(false)}
          >
            <Text style={[styles.optionText, !identity?.useAnonymous ? { color: '#FFF' } : { color: theme.text }]}>
              {identity?.realName || 'Nome Real'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.identityOption, 
              identity?.useAnonymous && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
            onPress={() => handleUpdatePreference(true)}
          >
            <Text style={[styles.optionText, identity?.useAnonymous ? { color: '#FFF' } : { color: theme.text }]}>
              {identity?.name || 'Pseudônimo'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: theme.primary }]} 
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Check size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.manifestoBtn, { backgroundColor: theme.primary + '10' }]} 
        onPress={() => setShowManifesto(true)}
      >
        <BookOpen size={20} color={theme.primary} />
        <Text style={[styles.manifestoBtnText, { color: theme.primary }]}>Leia e lembre-se</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>Sobre seu Anonimato</Text>
        <Text style={[styles.infoText, { color: theme.text, opacity: 0.7 }]}>
          Seu alias é permanente e protege sua identidade real enquanto você compartilha sua jornada.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: theme.text, opacity: 0.3 }]}>Mitoo.Life v1.0.0</Text>
      </View>

      <ManifestoModal 
        visible={showManifesto} 
        onClose={() => setShowManifesto(false)} 
        theme={theme} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 60, 
    paddingHorizontal: 20 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 32 
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'System',
  },
  logoutBtn: {
    padding: 8,
  },
  avatarLarge: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      }
    })
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarText: { 
    color: '#FFF', 
    fontSize: 48, 
    fontWeight: '800',
    fontFamily: 'System'
  },
  poeticName: { 
    fontSize: 26, 
    fontWeight: '800', 
    marginBottom: 4,
    fontFamily: 'System' 
  },
  bioInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 8,
    fontFamily: 'System',
  },
  charCount: {
    fontSize: 10,
    opacity: 0.3,
    alignSelf: 'flex-end',
    marginTop: 4,
    marginRight: 4,
  },
  statsContainer: { 
    flexDirection: 'row', 
    gap: 12,
    marginBottom: 32
  },
  statItem: { 
    flex: 1,
    alignItems: 'center', 
    paddingVertical: 20, 
    borderRadius: 24,
    gap: 4
  },
  statValue: { 
    fontSize: 22, 
    fontWeight: '800',
    fontFamily: 'System'
  },
  statLabel: { 
    fontSize: 12, 
    fontWeight: '600',
    fontFamily: 'System' 
  },
  infoBox: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'System'
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'System'
  },
  identitySelection: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  identityOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  identityOption: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    marginTop: 16,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  manifestoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 16,
    marginBottom: 16,
  },
  manifestoBtnText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    left: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System'
  }
});

