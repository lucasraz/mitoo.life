import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useToastStore } from '../store/toast_store';
import { Handshake } from 'lucide-react-native';

/**
 * 🛰️ Floating Toast (Notificações Poéticas)
 * Camada: UI (Interação fluida)
 * Faz um sentimento flutuar na tela usando animações de mola e transparência.
 */

export default function FloatingToast() {
  const { visible, content, moodColor } = useToastStore();
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(80, { damping: 10 });
      opacity.value = withTiming(1, { duration: 500 });
    } else {
      translateY.value = withTiming(-200, { duration: 500, easing: Easing.bezier(0.5, 0, 0.5, 1) });
      opacity.value = withTiming(0, { duration: 500 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor: moodColor }]}>
      <View style={styles.content}>
        <Handshake size={20} color="#FFF" />
        <Text style={styles.text} numberOfLines={2}>{content}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 20,
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { color: '#FFF', fontWeight: 'bold', flex: 1, fontSize: 14 },
});
