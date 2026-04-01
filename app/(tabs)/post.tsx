import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { MOODS } from '../../src/ui/theme';
import { PostsRepository } from '../../src/core/posts_repository';

/**
 * 🛰️ Post Creation Screen (Novo Relato)
 * Camada: UI (Interação de entrada)
 */

export default function PostScreen() {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('FELIZ');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const theme = useThemePeriod();
  const router = useRouter();

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);

    try {
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          location = await Location.getCurrentPositionAsync({});
        }
      } catch (e) {
        console.warn('⚠️ Erro ao capturar localização:', e);
      }

      const moodInfo = (MOODS as any)[selectedMood];

      await PostsRepository.createPost({
        content,
        mood: moodInfo.label,
        mood_color: moodInfo.color,
        period: theme.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        is_anonymous: isAnonymous,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      });

      // 🛡️ Gatilho de Apoio SOS (Ajustado para 'depressivo')
      const moodLabel = moodInfo.label.toLowerCase();
      if (moodLabel === 'depressão' || moodLabel === 'depressivo') {
        const { setSOSAlert } = require('../../src/store/ui_store').useUIStore.getState();
        setSOSAlert(true);
      }

      setContent('');
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erro ao postar', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Como está seu coração agora?</Text>
        
        <Text style={[styles.sectionLabel, { color: theme.text, opacity: 0.6 }]}>ESCOLHA SEU HUMOR</Text>
        <View style={styles.moodGrid}>
          {Object.entries(MOODS).map(([key, mood]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedMood(key)}
              style={[
                styles.moodBtn,
                { backgroundColor: mood.color + '22', borderColor: mood.color },
                selectedMood === key && { backgroundColor: mood.color, borderWidth: 0 }
              ]}
            >
              <Text style={[
                styles.moodLabel, 
                { color: mood.color },
                selectedMood === key && { color: '#FFF' }
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: (MOODS as any)[selectedMood].color + '15',
                color: theme.text,
                borderColor: (MOODS as any)[selectedMood].color + '40',
              }
            ]}
            placeholder="O que está acontecendo no seu coração?"
            placeholderTextColor={theme.text + '50'}
            multiline
            maxLength={300}
            value={content}
            onChangeText={setContent}
          />
          <Text style={[styles.charCount, { color: theme.text, opacity: 0.4 }]}>
            {content.length}/300
          </Text>
        </View>

        <View style={styles.optionRow}>
          <View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Postar como Anônimo</Text>
            <Text style={[styles.optionSub, { color: theme.text, opacity: 0.5 }]}>Seu nome real não será exibido</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={Platform.OS === 'ios' ? '#FFF' : isAnonymous ? theme.primary : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.postBtn, 
            { backgroundColor: theme.primary },
            (!content.trim() || loading) && { opacity: 0.5 }
          ]}
          onPress={handlePost}
          disabled={!content.trim() || loading}
        >
          <Text style={styles.postBtnText}>{loading ? 'Semeando...' : 'Postar Relato'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    marginBottom: 24,
    fontFamily: 'System' 
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
    fontFamily: 'System'
  },
  moodGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginBottom: 32 
  },
  moodBtn: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    borderWidth: 1.5,
  },
  moodLabel: { fontWeight: '700', fontSize: 13, fontFamily: 'System' },
  inputWrapper: {
    marginBottom: 24,
  },
  input: {
    height: 180,
    borderRadius: 20,
    padding: 20,
    fontSize: 18,
    textAlignVertical: 'top',
    borderWidth: 1,
    fontFamily: 'System'
  },
  charCount: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600'
  },
  optionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System'
  },
  optionSub: {
    fontSize: 13,
    fontFamily: 'System'
  },
  postBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  postBtnText: { color: '#FFF', fontWeight: '800', fontSize: 17, fontFamily: 'System' },
});

