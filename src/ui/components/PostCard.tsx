import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Handshake, MessageCircle } from 'lucide-react-native';
import { Post } from '../../core/posts_repository';
import { ThemeType } from '../theme';

interface PostCardProps {
  post: Post;
  theme: ThemeType;
  onCommentPress?: () => void;
  onMitooPress?: () => void;
  commentCount?: number;
  mitooCount?: number;
  isMitooed?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  theme,
  onCommentPress,
  onMitooPress,
  commentCount = 0,
  mitooCount = 0,
  isMitooed = false,
}) => {
  const router = useRouter();
  const authorName = post.author_name || 'Anônimo';
  const authorInitial = authorName[0] || '?';
  const authorColor = post.author_color || '#CCC';
  const authorAvatar = post.author_avatar_url;

  const handleProfilePress = () => {
    if (post.author_id) {
      router.push({
        pathname: '/user/[id]',
        params: { id: post.author_id },
      } as any);
    }
  };

  const formattedTime = new Date(post.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.card, { borderLeftColor: post.mood_color }]}>
      {/* Cabeçalho: avatar + nome + bio */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: authorColor }]}>
          {authorAvatar ? (
            <Image source={{ uri: authorAvatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{authorInitial}</Text>
          )}
        </View>

        <View style={styles.authorInfo}>
          <Text style={[styles.authorName, { color: theme.text }]}>{authorName}</Text>
          {post.author_bio ? (
            <Text
              style={[styles.authorBio, { color: theme.text }]}
              numberOfLines={1}
            >
              {post.author_bio}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Conteúdo do post */}
      <Text style={[styles.content, { color: theme.text }]}>{post.content}</Text>

      {/* Rodapé: hora, humor e ações */}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={[styles.time, { color: theme.text }]}>{formattedTime}</Text>
          {post.mood ? (
            <Text style={[styles.moodLabel, { color: post.mood_color }]}>
              • {post.mood}
            </Text>
          ) : null}
        </View>

        <View style={styles.footerRight}>
          {/* Botão comentário — touch target 44px */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onCommentPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MessageCircle size={20} color={theme.text} opacity={0.6} />
            <Text style={[styles.actionText, { color: theme.text }]}>
              {commentCount > 0 ? commentCount : ''}
            </Text>
          </TouchableOpacity>

          {/* Botão Mitoo — touch target 44px */}
          <TouchableOpacity
            style={[
              styles.mitooBtn,
              isMitooed && { backgroundColor: theme.primary + '25' },
            ]}
            onPress={onMitooPress}
            activeOpacity={0.7}
          >
            <Handshake
              size={20}
              color={isMitooed ? theme.primary : theme.text}
              opacity={isMitooed ? 1 : 0.6}
            />
            <Text
              style={[
                styles.mitooText,
                { color: isMitooed ? theme.primary : theme.text, opacity: isMitooed ? 1 : 0.65 },
              ]}
            >
              {mitooCount > 0 ? mitooCount : 'Mitoo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    // Touch target mínimo: 44px
    minHeight: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 17,
    fontFamily: 'Nunito-Bold',
  },
  authorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  authorName: {
    fontWeight: '700',
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
  },
  authorBio: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.5,
    fontFamily: 'Nunito-Regular',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
    fontFamily: 'Nunito-Regular',
    letterSpacing: 0.1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 12,
    opacity: 0.45,
    fontFamily: 'Nunito-Regular',
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Nunito-Bold',
    opacity: 0.6,
  },
  mitooBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.04)',
    minHeight: 44,
  },
  mitooText: {
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
  },
});
