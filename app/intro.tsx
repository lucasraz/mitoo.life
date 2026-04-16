import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useUIStore } from '../src/store/ui_store';
import { useThemePeriod } from '../src/hooks/useThemePeriod';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function IntroScreen() {
  const router = useRouter();
  const setLanguage = useUIStore((state) => state.setLanguage);
  const theme = useThemePeriod();

  const handleSelectLanguage = (lang: 'pt' | 'en') => {
    setLanguage(lang);
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/logos/Logo_M.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        
        <Text style={[styles.title, { color: theme.text }]}>Mitoo.Life</Text>
        <Text style={[styles.subtitle, { color: theme.text, opacity: 0.6 }]}>
          Escolha seu idioma / Choose your language
        </Text>

        <View style={styles.btnContainer}>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: theme.primary }]} 
            onPress={() => handleSelectLanguage('pt')}
          >
            <Text style={styles.btnText}>Português</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: theme.primary, opacity: 0.8 }]} 
            onPress={() => handleSelectLanguage('en')}
          >
            <Text style={styles.btnText}>English</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', width: '100%', paddingHorizontal: 32 },
  logo: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: 'Nunito-Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    fontFamily: 'Nunito-Regular',
  },
  btnContainer: { width: '100%', maxWidth: 300, gap: 16 },
  btn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Nunito-Bold',
  }
});
