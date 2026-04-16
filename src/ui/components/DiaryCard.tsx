import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Book, Users } from 'lucide-react-native';
import { Diary } from '../../core/diary_repository';
import { ThemeType } from '../theme';

interface DiaryCardProps {
  diary: Diary;
  theme: ThemeType;
  onPress?: () => void;
  isFollowing?: boolean;
  onFollowPress?: () => void;
}

export const DiaryCard: React.FC<DiaryCardProps> = ({ diary, theme, onPress, isFollowing, onFollowPress }) => {
  const authorName = diary.author_name || 'Anônimo';
  const authorInitial = authorName[0] || '?';
  const authorColor = diary.author_color || '#CCC';

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.08)' }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statusLine, { backgroundColor: diary.mood_color }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Book size={20} color={diary.mood_color} />
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {diary.title}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.authorRow}>
            <View style={[styles.miniAvatar, { backgroundColor: authorColor }]}>
              <Text style={styles.avatarText}>{authorInitial}</Text>
            </View>
            <Text style={[styles.authorName, { color: theme.text, opacity: 0.8 }]}>
              {authorName}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.followBtn, isFollowing && { backgroundColor: theme.primary + '25' }]}
            onPress={onFollowPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Users size={16} color={isFollowing ? theme.primary : theme.text} opacity={isFollowing ? 1 : 0.6} />
            <Text style={[styles.followText, { color: isFollowing ? theme.primary : theme.text, opacity: isFollowing ? 1 : 0.8 }]}>
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    // Sombras sutis
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  statusLine: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Nunito-Bold',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    minHeight: 44,
  },
  followText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
  },
});
