import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useThemePeriod } from '../src/hooks/useThemePeriod';
import FloatingToast from '../src/ui/FloatingToast';
import { useAuthStore } from '../src/store/auth_store';
import { useEffect } from 'react';
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_900Black } from '@expo-google-fonts/nunito';

/**
 * 🛰️ Root Layout (Versão Estabilizada)
 * Camada: Estrutura (Orquestração do app)
 */

export default function RootLayout() {
  const theme = useThemePeriod();
  const { user, loading, checkSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Nunito': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
    'Nunito-Black': Nunito_900Black,
  });

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redireciona para login se não estiver logado
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redireciona para o feed se estiver logado e na tela de login
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.name === 'Noite' ? 'light' : 'dark'} />
      <FloatingToast />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </View>
  );
}

