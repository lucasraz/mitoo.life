import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Home, Notebook, PlusCircle, Globe, Phone } from 'lucide-react-native';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { View, Platform, Animated } from 'react-native';
import { useUIStore } from '../../src/store/ui_store';
import { AppHeader } from '../../src/ui/components/AppHeader';

/**
 * 🛰️ Tabs Layout (Premium v2)
 * Camada: Estrutura (Organização da navegação principal)
 * Header nativo desativado em favor do AppHeader personalizado.
 */

export default function TabLayout() {
  const theme = useThemePeriod();
  const { isSOSAlertActive } = useUIStore();

  // Animação SOS (Tremor e Piscar no ícone da barra)
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSOSAlertActive) {
      const shakeAction = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 5, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -5, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ])
      );
      const flashAction = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      shakeAction.start();
      flashAction.start();
      return () => {
        shakeAction.stop();
        flashAction.stop();
        shakeAnim.setValue(0);
        opacityAnim.setValue(1);
      };
    }
  }, [isSOSAlertActive]);

  return (
    <Tabs
      screenOptions={{
        // Header nativo desativado — usamos o AppHeader personalizado
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: theme.background + 'E6', // ~90% opacidade — translúcido
          borderTopWidth: 1,
          borderTopColor: theme.text + '18',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text + '60',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // Injeta o Header premium apenas no feed principal
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Globe size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <View style={[styles.plusIcon, { backgroundColor: theme.primary }]}>
              <PlusCircle size={30} color="#FFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="diaries"
        options={{
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Notebook size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={[
              focused ? styles.activeIconContainer : undefined,
              {
                transform: [{ translateX: shakeAnim }],
                opacity: opacityAnim,
              }
            ]}>
              <Phone
                size={24}
                color={isSOSAlertActive ? '#FF4444' : color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </Animated.View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: true,
          header: () => <AppHeader />,
        }}
      />
      <Tabs.Screen
        name="placeholder"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = {
  activeIconContainer: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  plusIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
} as any;
