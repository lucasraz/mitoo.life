import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  TextInput 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Heart, BookOpen, Clock, Edit3 } from 'lucide-react-native';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { UserRepository } from '../../src/core/user_repository';
import { PostsRepository, Post } from '../../src/core/posts_repository';
import { DiaryRepository, Diary } from '../../src/core/diary_repository';
import { ConnectionsRepository } from '../../src/core/connections_repository';
import { useAuthStore } from '../../src/store/auth_store';
import { PostCard } from '../../src/ui/components/PostCard';
import { DiaryCard } from '../../src/ui/components/DiaryCard';

/**
 * 🛰️ Perfil de Usuário Externo (v1.6)
 * Correção de Identidade e Funcionalidade de Apelido.
 */

type ViewMode = 'diaries' | 'posts';

export default function ExternalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useThemePeriod();
  const currentUser = useAuthStore(state => state.user);
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [nickname, setNickname] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('diaries');

  useEffect(() => {
    if (id) fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setProfile(null);
      
      const u = await UserRepository.getPublicProfile(id);
      if (!u) throw new Error('Viajante não encontrado');
      setProfile(u);

      // Buscas paralelas independentes (se uma falha, as outras continuam)
      await Promise.all([
        PostsRepository.getUserRecentPosts(id, 7)
          .then(setPosts)
          .catch(e => console.warn('Falha posts:', e)),
        DiaryRepository.getDiariesByUserId(id)
          .then(setDiaries)
          .catch(e => console.warn('Falha diários:', e)),
        currentUser ? 
          ConnectionsRepository.getFavoriteStatus(currentUser.id, id)
            .then(fav => {
              if (fav) {
                setIsFavorite(true);
                setNickname(fav.nickname || '');
                setNewNickname(fav.nickname || '');
              }
            })
            .catch(e => console.warn('Falha favorito:', e))
          : Promise.resolve()
      ]);

    } catch (e) {
      console.error('Erro Crítico Perfil:', e);
      Alert.alert('Aviso', 'Não foi possível encontrar a jornada deste viajante agora.');
      
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser || !id) return;
    try {
      if (isFavorite && !newNickname) {
        await ConnectionsRepository.unfavoriteUser(currentUser.id, id);
        setIsFavorite(false);
        setNickname('');
      } else {
        await ConnectionsRepository.favoriteUser(currentUser.id, id, newNickname);
        setIsFavorite(true);
        setNickname(newNickname);
        setModalVisible(false);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível atualizar conexão.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Lógica de Nome Exibido
  const originalName = profile?.use_anonymous_alias ? profile?.anon_alias : profile?.user_name;
  const displayName = nickname || originalName || 'Viajante';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.navHeader, { paddingTop: 60 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={[styles.favBtn, isFavorite && { backgroundColor: theme.primary + '20' }]}
        >
          <Heart size={22} color={isFavorite || nickname ? theme.primary : theme.text} fill={isFavorite || nickname ? theme.primary : 'transparent'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Identidade */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: profile?.anon_color || theme.primary }]}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarLetter}>{(originalName?.[0] || '?')}</Text>
            )}
          </View>
          
          <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
          
          {nickname ? (
            <Text style={[styles.originalName, { color: theme.text, opacity: 0.4 }]}>
              ({originalName})
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.nicknamePrompt}>
               <Edit3 size={14} color={theme.primary} />
               <Text style={[styles.nicknamePromptText, { color: theme.primary }]}>
                 Escolha um apelido para lembrar com carinho
               </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.bio, { color: theme.text, opacity: 0.7 }]}>
            {profile?.bio || '"Em busca de desabafos que iluminam a alma."'}
          </Text>
        </View>

        {/* Abas */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setViewMode('diaries')}
            style={[styles.tab, viewMode === 'diaries' && { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
          >
            <BookOpen size={18} color={viewMode === 'diaries' ? theme.primary : theme.text + '50'} />
            <Text style={[styles.tabText, { color: viewMode === 'diaries' ? theme.primary : theme.text + '50' }]}>Diário</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setViewMode('posts')}
            style={[styles.tab, viewMode === 'posts' && { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
          >
            <Clock size={18} color={viewMode === 'posts' ? theme.primary : theme.text + '50'} />
            <Text style={[styles.tabText, { color: viewMode === 'posts' ? theme.primary : theme.text + '50' }]}>Relatos</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <View style={styles.contentSection}>
          {viewMode === 'diaries' ? (
            diaries.length > 0 ? (
              diaries.map(d => <DiaryCard key={d.id} diary={d} theme={theme} />)
            ) : (
              <Text style={styles.emptyText}>Sem diários públicos.</Text>
            )
          ) : (
            posts.length > 0 ? (
              posts.map(p => <PostCard key={p.id} post={p} theme={theme} />)
            ) : (
              <Text style={styles.emptyText}>Sem relatos recentes (7 dias).</Text>
            )
          )}
        </View>
      </ScrollView>

      {/* Modal Nickname */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Conectar com Carinho</Text>
            <Text style={[styles.modalSub, { color: theme.text, opacity: 0.6 }]}>
              Escolha um apelido para lembrar com carinho desta pessoa:
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.text + '20' }]}
              placeholder="Ex: Amigo Inspirador"
              placeholderTextColor={theme.text + '40'}
              value={newNickname}
              onChangeText={setNewNickname}
              maxLength={25}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: theme.text }]}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleFavorite} style={[styles.confirmBtn, { backgroundColor: theme.primary }]}>
                <Text style={styles.confirmText}>Salvar Apelido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  favBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 60 },
  profileHeader: { alignItems: 'center', paddingTop: 10, paddingHorizontal: 30, marginBottom: 24 },
  avatarContainer: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  avatarImg: { width: 110, height: 110 },
  avatarLetter: { fontSize: 44, fontWeight: '800', color: '#FFF' },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  originalName: { fontSize: 13, marginBottom: 12, fontWeight: '500' },
  nicknamePrompt: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, backgroundColor: 'rgba(0,0,0,0.03)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  nicknamePromptText: { fontSize: 12, fontWeight: '700' },
  bio: { textAlign: 'center', fontSize: 14, lineHeight: 22, marginTop: 4 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  tab: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.04)' },
  tabText: { fontWeight: '700', fontSize: 13 },
  contentSection: { paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', marginTop: 40, opacity: 0.3, fontStyle: 'italic', fontSize: 14 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 25 },
  modalContent: { borderRadius: 32, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalSub: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  input: { height: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 52, justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontWeight: '700' },
  confirmBtn: { flex: 1, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  confirmText: { color: '#FFF', fontWeight: '700' },
});
