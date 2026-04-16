import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { DiaryRepository, Diary } from '../../src/core/diary_repository';
import { DiaryCard } from '../../src/ui/components/DiaryCard';
import { DiarySocialRepository } from '../../src/core/diary_social_repository';
import { logger } from '../../src/infra/logger';

/**
 * 🛰️ Diaries Screen (Módulo do Diário Público)
 * Camada: UI (Apresentação dinâmica)
 */

export default function DiariesScreen() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useThemePeriod();

  const fetchDiaries = async () => {
    try {
      const [data, followedList] = await Promise.all([
        DiaryRepository.getPublicDiaries(),
        DiarySocialRepository.getFollowedDiariesIds()
      ]);
      setDiaries(data || []);
      setFollowedIds(new Set(followedList));
    } catch (e) {
      logger.error('Erro ao buscar diários', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiaries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDiaries();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Diários Públicos</Text>
        <Text style={[styles.subtitle, { color: theme.text, opacity: 0.6 }]}>
          Acompanhe histórias e caminhos.
        </Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={diaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DiaryCard 
              diary={item} 
              theme={theme}
              onPress={() => router.push(`/diary/${item.id}`)}
              isFollowing={followedIds.has(item.id)}
              onFollowPress={async () => {
                const isFollowing = followedIds.has(item.id);
                // Optimistic UI update
                setFollowedIds(prev => {
                  const next = new Set(prev);
                  if (isFollowing) next.delete(item.id);
                  else next.add(item.id);
                  return next;
                });
                
                try {
                  await DiarySocialRepository.toggleFollowDiary(item.id);
                } catch (error) {
                  // Revert if error
                  setFollowedIds(prev => {
                    const next = new Set(prev);
                    if (isFollowing) next.add(item.id);
                    else next.delete(item.id);
                    return next;
                  });
                  logger.error('Erro ao seguir diário', error);
                }
              }}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.text }]}>
              Nenhum diário público foi criado ainda.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    fontFamily: 'System',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'System',
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 100, 
    fontSize: 16, 
    opacity: 0.6,
    fontFamily: 'System'
  }
});
