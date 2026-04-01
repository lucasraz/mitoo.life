import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
  Alert
} from 'react-native';
import { Send } from 'lucide-react-native';
import { CommentsRepository, Comment } from '../../core/comments_repository';
import { ThemeType } from '../theme';

interface CommentSectionProps {
  postId?: string;
  diaryEntryId?: string;
  theme: ThemeType;
  onClose?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  postId, 
  diaryEntryId, 
  theme,
  onClose 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId, diaryEntryId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      let data: Comment[] = [];
      if (postId) {
        data = await CommentsRepository.getCommentsByPost(postId);
      } else if (diaryEntryId) {
        data = await CommentsRepository.getCommentsByDiaryEntry(diaryEntryId);
      }
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim() || sending) return;

    try {
      setSending(true);
      await CommentsRepository.createComment({
        content: newComment,
        is_anonymous: isAnonymous,
        postId,
        diaryEntryId
      });
      setNewComment('');
      loadComments();
    } catch (error: any) {
      console.error('Erro ao enviar comentário:', error);
      Alert.alert('Erro', 'Não conseguimos salvar seu comentário. Tente novamente em breve.');
    } finally {
      setSending(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={[styles.avatar, { backgroundColor: item.author_color }]}>
          {item.author_avatar_url ? (
            <Image source={{ uri: item.author_avatar_url }} style={styles.commentAvatarImage} />
          ) : (
            <Text style={styles.avatarText}>{item.author_name?.[0] || '?'}</Text>
          )}
        </View>
        <Text style={[styles.authorName, { color: theme.text }]}>
          {item.author_name}
        </Text>
        <Text style={[styles.time, { color: theme.text, opacity: 0.4 }]}>
          • {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.commentContent, { color: theme.text }]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Comentários</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Fechar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Seja o primeiro a acolher este relato.
            </Text>
          }
        />
      )}

      <View style={[styles.inputContainer, { borderTopColor: 'rgba(255,255,255,0.1)' }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: 'rgba(255,255,255,0.05)' }]}
            placeholder="Escreva algo gentil..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
            onPress={handleSend}
            disabled={sending || !newComment.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Send size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.optionsRow}>
          <View style={styles.anonOption}>
            <Text style={[styles.optionLabel, { color: theme.text }]}>Comentar anonimamente</Text>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor={isAnonymous ? '#FFF' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  commentItem: {
    marginBottom: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  commentAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  anonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});
