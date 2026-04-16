import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  Modal, 
  TouchableOpacity,
  TextInput,
  Animated
} from 'react-native';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { PostsRepository, Post } from '../../src/core/posts_repository';
import { MitooRepository } from '../../src/core/mitoo_repository';
import { PostCard } from '../../src/ui/components/PostCard';
import { CommentSection } from '../../src/ui/components/CommentSection';
import { MitooFeedback } from '../../src/ui/components/MitooFeedback';
import { ManifestoModal } from '../../src/ui/components/ManifestoModal';
import { MessageCircle, Heart, Search, X, BookOpen } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/auth_store';
import { UserRepository } from '../../src/core/user_repository';
import { useUIStore } from '../../src/store/ui_store';
import { TRANSLATIONS } from '../../src/core/i18n';

const getMoodOptions = (t: any) => [
  { label: t.moodAll, value: '' },
  { label: t.moodGratitude, value: 'Gratidão', color: '#4CAF50' },
  { label: t.moodSadness, value: 'Tristeza', color: '#2196F3' },
  { label: t.moodAnxiety, value: 'Ansiedade', color: '#FF9800' },
  { label: t.moodRelief, value: 'Alívio', color: '#9C27B0' },
  { label: t.moodHope, value: 'Esperança', color: '#F44336' },
];

export default function FeedScreen() {
  const { user, identity, updateSeenManifesto } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showMitooFeedback, setShowMitooFeedback] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const theme = useThemePeriod();
  const language = useUIStore((state) => state.language) || 'pt';
  const t = TRANSLATIONS[language];

  // Animação de piscar para o botão do manifesto
  const blinkAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const blinkAction = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    );
    blinkAction.start();
    return () => blinkAction.stop();
  }, [blinkAnim]);

  useEffect(() => {
    if (identity && identity.seenManifesto === false) {
      setTimeout(() => setShowManifesto(true), 1500);
    }
  }, [identity]);

  const handleCloseManifesto = async () => {
    setShowManifesto(false);
    if (user && !identity?.seenManifesto) {
      try {
        await UserRepository.markManifestoAsSeen(user.id);
        updateSeenManifesto();
      } catch (e) {
        console.warn('Erro ao salvar leitura do manifesto:', e);
      }
    }
  };

  const handleMitoo = async (postId: string) => {
    try {
      setShowMitooFeedback(true);
      await MitooRepository.toggleMitoo(postId, true);
      fetchPosts();
    } catch (e) {
      console.warn('⚠️ Erro ao aplicar Mitoo:', e);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await PostsRepository.getPublicFeed(selectedMood, searchQuery) as any;
      setPosts(data || []);
    } catch (e) {
      console.warn('⚠️ Erro ao buscar feed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedMood, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const getGreeting = () => {
    const displayName = identity?.useAnonymous 
      ? identity?.name 
      : identity?.realName;
      
    const finalName = displayName || t.greetingTraveler;

    if (theme.name === 'Manhã') return `${t.greetingMorning},\n${finalName}`;
    if (theme.name === 'Tarde') return `${t.greetingAfternoon},\n${finalName}`;
    return `${t.greetingEvening},\n${finalName}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.text, opacity: 0.7 }]}>
          {getGreeting()}
        </Text>
        
        <TouchableOpacity 
          onPress={() => setShowManifesto(true)}
          activeOpacity={0.7}
        >
          <Animated.View 
            style={[
              styles.manifestoMiniBtn, 
              { 
                borderColor: theme.primary + '40', 
                backgroundColor: theme.primary + '10',
                opacity: blinkAnim 
              }
            ]}
          >
            <BookOpen size={14} color={theme.primary} />
            <Text style={[styles.manifestoMiniBtnText, { color: theme.primary }]}>{t.readManifesto}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: theme.text + '20' }]}>
          <Search size={18} color={theme.text} style={{ opacity: 0.5 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={theme.text + '40'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={theme.text} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={getMoodOptions(t)}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedMood(item.value)}
              style={[
                styles.moodChip,
                { backgroundColor: selectedMood === item.value ? theme.primary : 'rgba(255,255,255,0.05)' }
              ]}
            >
              <Text style={[
                styles.moodChipText, 
                { color: selectedMood === item.value ? '#FFF' : theme.text, opacity: selectedMood === item.value ? 1 : 0.6 }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
        />
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              theme={theme} 
              onCommentPress={() => setSelectedPostId(item.id)}
              onMitooPress={() => handleMitoo(item.id)}
              commentCount={item.comment_count}
              mitooCount={item.mitoo_count}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.text }]}>{t.emptyFeed}</Text>
          }
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}

      <Modal
        visible={!!selectedPostId}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPostId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPostId && (
              <CommentSection 
                postId={selectedPostId}
                theme={theme}
                onClose={() => setSelectedPostId(null)}
              />
            )}
          </View>
        </View>
      </Modal>

      {showMitooFeedback && (
        <MitooFeedback 
          color={theme.primary} 
          onComplete={() => setShowMitooFeedback(false)} 
        />
      )}
      <ManifestoModal 
        visible={showManifesto} 
        onClose={handleCloseManifesto} 
        theme={theme} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, paddingHorizontal: 0 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginTop: 8,
    marginBottom: 16 
  },
  searchSection: { marginBottom: 12, paddingHorizontal: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 24, paddingHorizontal: 16, borderWidth: 1 },
  searchInput: { flex: 1, height: '100%', marginLeft: 10, fontSize: 16 },
  filterContainer: { marginBottom: 8, paddingHorizontal: 16 },
  moodChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22 },
  moodChipText: { fontSize: 14, fontWeight: '600', fontFamily: 'Nunito-Bold' },
  greeting: { flex: 1, fontSize: 14, fontWeight: '600', fontFamily: 'Nunito-Bold', textAlign: 'left', lineHeight: 20 },
  manifestoMiniBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  manifestoMiniBtnText: { fontSize: 12, fontWeight: '800', fontFamily: 'Nunito-Black', textTransform: 'uppercase' },
  empty: { textAlign: 'center', marginTop: 100, fontSize: 16, opacity: 0.6, fontFamily: 'Nunito-Regular', lineHeight: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }
});
