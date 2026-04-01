import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Heart } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface MitooFeedbackProps {
  onComplete: () => void;
  color: string;
}

/**
 * ✨ MitooFeedback (Camada de UI - Experiência 'WOW')
 * Uma explosão suave de empatia e micro-animações.
 */
export const MitooFeedback: React.FC<MitooFeedbackProps> = ({ onComplete, color }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Corações individuais para a explosão
  const hearts = useRef([...Array(6)].map(() => ({
    pos: new Animated.ValueXY({ x: 0, y: 0 }),
    scale: new Animated.Value(0),
    opacity: new Animated.Value(1),
  }))).current;

  useEffect(() => {
    // 1. Mostrar Texto
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Explosão de Corações
    const heartAnimations = hearts.map((h, i) => {
      const angle = (i / hearts.length) * Math.PI * 2;
      const dist = 60 + Math.random() * 40;
      
      return Animated.parallel([
        Animated.timing(h.scale, {
          toValue: 1 + Math.random(),
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(h.pos, {
          toValue: {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 40,
          },
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(h.opacity, {
          toValue: 0,
          duration: 900,
          delay: 200,
          useNativeDriver: true,
        })
      ]);
    });

    Animated.stagger(50, heartAnimations).start();

    // 3. Finalizar
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onComplete());
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}>
        <View style={styles.heartContainer}>
          {hearts.map((h, i) => (
            <Animated.View key={i} style={[
              styles.floatingHeart,
              {
                opacity: h.opacity,
                transform: [
                  { translateX: h.pos.x },
                  { translateY: h.pos.y },
                  { scale: h.scale }
                ]
              }
            ]}>
              <Heart size={24} color={color} fill={color} />
            </Animated.View>
          ))}
          <Heart size={56} color={color} fill={color} />
        </View>
        <Text style={[styles.text, { color: '#FFF' }]}>Sim, você se importa.</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  floatingHeart: {
    position: 'absolute',
  },
  text: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    overflow: 'hidden',
  }
});
