import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Book, MessageCircle } from 'lucide-react-native';
import { useThemePeriod } from '../../../src/hooks/useThemePeriod';
import { DiaryRepository, Diary, DiaryEntry } from '../../../src/core/diary_repository';
import { logger } from '../../../src/infra/logger';

/**
 * 🛰️ Diary Detail Screen
 * Exibe o cabeçalho do diário e lista de todas as entradas,
 * com navegação para leitura individual de cada entrada.
 * Camada: UI (Apresentação)
 */

export default function DiaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useThemePeriod();

  const [diary, setDiary] = useState<Diary | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDiaryData = useCallback(async () => {
    if (!id) return;
    try {
      const [diaryData, entriesData] = await Promise.all([
        DiaryRepository.getDiaryById(id),
        DiaryRepository.getEntriesByDiaryId(id),
      ]);
      setDiary(diaryData);
      setEntries(entriesData);
    } catch (error) {
      logger.error('Erro ao carregar diário', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadDiaryData();
  }, [loadDiaryData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDiaryData();
  };

  const navigateToEntry = (entryId: string) => {
    router.push(`/diary/entry/${entryId}`);
  };

  const renderEntry = ({ item, index }: { item: DiaryEntry; index: number }) => (
    <TouchableOpacity
      style={[styles.entryCard, { backgroundColor: 'rgba(255,255,255,0.07)' }]}
      onPress={() => navigateToEntry(item.id)}
      activeOpacity={0.75}
    >
      <View style={[styles.entryIndex, { backgroundColor: item.mood_color }]}>
        <Text style={styles.entryIndexText}>#{index + 1}</Text>
      </View>

      <View style={styles.entryBody}>
        <Text style={[styles.entryContent, { color: theme.text }]} numberOfLines={3}>
          {item.content}
        </Text>

        <View style={styles.entryMeta}>
          <View style={[styles.moodPill, { backgroundColor: item.mood_color + '33' }]}>
            <View style={[styles.moodDot, { backgroundColor: item.mood_color }]} />
            <Text style={[styles.moodLabel, { color: item.mood_color }]}>
              {item.mood}
            </Text>
          </View>
          <Text style={[styles.entryDate, { color: theme.text }]}>
            {new Date(item.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}
          </Text>
          <MessageCircle size={14} color={theme.text} opacity={0.4} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header com barra de voltar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Cabeçalho do Diário */}
      {diary && (
        <View style={[styles.diaryHeader, { borderLeftColor: diary.mood_color }]}>
          <Book size={28} color={diary.mood_color} />
          <View style={styles.diaryHeaderText}>
            <Text style={[styles.diaryTitle, { color: theme.text }]}>{diary.title}</Text>
            <View style={[styles.authorChip, { backgroundColor: diary.mood_color + '22' }]}>
              <View style={[styles.authorDot, { backgroundColor: diary.mood_color }]} />
              <Text style={[styles.authorName, { color: diary.mood_color }]}>
                {diary.author_name || 'Anônimo'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Contagem de entradas */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}
        </Text>
      </View>

      {/* Lista de entradas */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Este diário ainda não tem entradas.
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.text }]}>
              As histórias ainda estão por vir.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderLeftWidth: 4,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 4,
  },
  diaryHeaderText: { flex: 1, gap: 8 },
  diaryTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  authorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  authorDot: { width: 8, height: 8, borderRadius: 4 },
  authorName: { fontSize: 13, fontWeight: '600' },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  entryCard: {
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  entryIndex: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  entryIndexText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  entryBody: { flex: 1, padding: 16, gap: 12 },
  entryContent: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  entryMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  moodDot: { width: 6, height: 6, borderRadius: 3 },
  moodLabel: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  entryDate: { fontSize: 12, opacity: 0.5, marginLeft: 'auto' },
  emptyContainer: { paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', opacity: 0.6 },
  emptySubtext: { fontSize: 14, opacity: 0.4, fontStyle: 'italic' },
});
