import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUIStore } from '../src/store/ui_store';
import { useAuthStore } from '../src/store/auth_store';

export default function Index() {
  const router = useRouter();
  const language = useUIStore((state) => state.language);
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    if (!language) {
      router.replace('/intro');
    } else if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [language, user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
