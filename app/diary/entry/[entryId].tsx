import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MessageCircle, Clock, Heart } from 'lucide-react-native';
import { useThemePeriod } from '../../../src/hooks/useThemePeriod';
import { DiaryRepository, DiaryEntry } from '../../../src/core/diary_repository';
import { DiarySocialRepository } from '../../../src/core/diary_social_repository';
import { CommentSection } from '../../../src/ui/components/CommentSection';
import { logger } from '../../../src/infra/logger';

/**
 * 🛰️ Diary Entry Detail Screen
 * Leitura completa de uma entrada do diário + seção de comentários.
 * Camada: UI (Apresentação)
 */

const PERIOD_LABEL: Record<string, string> = {
  manha: '🌅 Manhã',
  tarde: '☀️ Tarde',
  noite: '🌙 Noite',
};

export default function DiaryEntryDetailScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const theme = useThemePeriod();

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);

  const loadEntry = useCallback(async () => {
    if (!entryId) return;
    try {
      const [data, reacted, count] = await Promise.all([
        DiaryRepository.getEntryById(entryId),
        DiarySocialRepository.hasReacted(entryId),
        DiarySocialRepository.getReactionCount(entryId),
      ]);
      setEntry(data);
      setHasReacted(reacted);
      setReactionCount(count);
    } catch (error) {
      logger.error('Erro ao carregar entrada do diário', error);
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const handleReaction = async () => {
    if (!entryId) return;
    const isCurrentlyReacted = hasReacted;
    
    // Optimistic Update
    setHasReacted(!isCurrentlyReacted);
    setReactionCount(prev => isCurrentlyReacted ? prev - 1 : prev + 1);

    try {
      await DiarySocialRepository.toggleReaction(entryId, true);
    } catch (error) {
      // Revert if error
      setHasReacted(isCurrentlyReacted);
      setReactionCount(prev => isCurrentlyReacted ? prev + 1 : prev - 1);
      logger.error('Erro ao reagir à entrada', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            Esta entrada não foi encontrada.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Barra de voltar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Ações no topo: Mitoo e Comentários */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.mitooHeaderBtn, hasReacted && { backgroundColor: theme.primary + '25' }]}
            onPress={handleReaction}
          >
            <Heart size={18} color={hasReacted ? theme.primary : theme.text} opacity={hasReacted ? 1 : 0.6} />
            <Text style={[styles.mitooHeaderLabel, { color: hasReacted ? theme.primary : theme.text, opacity: hasReacted ? 1 : 0.6 }]}>
              {reactionCount > 0 ? reactionCount : 'Mitoo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.commentHeaderBtn, { backgroundColor: theme.primary + '22' }]}
            onPress={() => setShowComments(true)}
          >
            <MessageCircle size={18} color={theme.primary} />
            <Text style={[styles.commentHeaderLabel, { color: theme.primary }]}>
              Comentários
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Linha de metadata do humor */}
        <View style={styles.metaRow}>
          <View style={[styles.moodPill, { backgroundColor: entry.mood_color + '30' }]}>
            <View style={[styles.moodDot, { backgroundColor: entry.mood_color }]} />
            <Text style={[styles.moodText, { color: entry.mood_color }]}>
              {entry.mood}
            </Text>
          </View>

          <View style={styles.periodChip}>
            <Clock size={13} color={theme.text} opacity={0.5} />
            <Text style={[styles.periodText, { color: theme.text }]}>
              {PERIOD_LABEL[entry.period] ?? entry.period}
            </Text>
          </View>

          <Text style={[styles.dateText, { color: theme.text }]}>
            {new Date(entry.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Barra decorativa do humor */}
        <View style={[styles.moodBar, { backgroundColor: entry.mood_color }]} />

        {/* Conteúdo da entrada */}
        <Text style={[styles.entryContent, { color: theme.text }]}>
          {entry.content}
        </Text>

        {/* Ações no rodapé do texto */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[styles.mitooFooterBtn, hasReacted && { borderColor: theme.primary + '55', backgroundColor: theme.primary + '11' }]}
            onPress={handleReaction}
          >
            <Heart size={20} color={hasReacted ? theme.primary : theme.text} opacity={hasReacted ? 1 : 0.6} />
            <Text style={[styles.mitooFooterLabel, { color: hasReacted ? theme.primary : theme.text, opacity: hasReacted ? 1 : 0.6 }]}>
              {reactionCount > 0 ? `${reactionCount} Mitoos` : 'Deixar Mitoo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.commentFooterBtn, { borderColor: theme.primary + '55', backgroundColor: theme.primary + '11' }]}
            onPress={() => setShowComments(true)}
          >
            <MessageCircle size={20} color={theme.primary} />
            <Text style={[styles.commentFooterLabel, { color: theme.primary }]}>
              Ver e deixar comentários
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal com seção de comentários */}
      <Modal
        visible={showComments}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowComments(false)}
      >
        <CommentSection
          diaryEntryId={entry.id}
          theme={theme}
          onClose={() => setShowComments(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mitooHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mitooHeaderLabel: { fontSize: 14, fontWeight: '700' },
  commentHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  commentHeaderLabel: { fontSize: 14, fontWeight: '700' },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    gap: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  moodText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  periodText: { fontSize: 13, opacity: 0.6 },
  dateText: { fontSize: 13, opacity: 0.4, marginLeft: 'auto' },
  moodBar: {
    height: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
  entryContent: {
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  footerActions: {
    marginTop: 16,
    gap: 12,
  },
  mitooFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mitooFooterLabel: { fontSize: 15, fontWeight: '700' },
  commentFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  commentFooterLabel: { fontSize: 15, fontWeight: '700' },
  errorText: { fontSize: 16, opacity: 0.6 },
});
