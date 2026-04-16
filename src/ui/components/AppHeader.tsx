import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth_store';
import { useUIStore } from '../../store/ui_store';
import { useThemePeriod } from '../../hooks/useThemePeriod';

/**
 * 🏛️ AppHeader — Logo com fundo transparente sobre o background do tema (v10)
 */

const STATUS_BAR_HEIGHT = StatusBar.currentHeight ?? 0;
const SCREEN_WIDTH = Dimensions.get('window').width;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 112 : 76 + STATUS_BAR_HEIGHT;

const LOGO_WIDTH = SCREEN_WIDTH * 0.66;
const LOGO_HEIGHT = LOGO_WIDTH * 0.38;

export function AppHeader() {
  const router = useRouter();
  const { identity } = useAuthStore();
  const { isSOSAlertActive } = useUIStore();
  const theme = useThemePeriod();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSOSAlertActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
    pulseAnim.setValue(1);
  }, [isSOSAlertActive]);

  const avatarBorderColor = isSOSAlertActive ? '#FF4444' : identity?.color || theme.primary;
  const avatarInitial = (identity?.name || 'V').charAt(0).toUpperCase();
  const paddingTop = Platform.OS === 'ios' ? 46 : STATUS_BAR_HEIGHT + 8;

  const language = useUIStore((state) => state.language) || 'pt';
  const headerLogo = language === 'en'
    ? require('../../../assets/logos/Logo secundário_EN.png')
    : require('../../../assets/logos/Logo secundário_PT.png');

  return (
    <View
      style={[
        styles.container,
        {
          height: HEADER_HEIGHT,
          backgroundColor: theme.background,  // fundo muda com o período do dia
          borderBottomColor: theme.text + '15',
        },
      ]}
    >
      {/* Linha decorativa na base com cor do tema */}
      <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />

      <View style={[styles.row, { paddingTop }]}>
        {/* Espaçador esquerdo */}
        <View style={styles.sideSlot} />

        {/* Logo transparente centralizada */}
        <Image
          source={headerLogo}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Avatar à direita */}
        <View style={styles.sideSlot}>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            activeOpacity={0.75}
            style={styles.avatarBtn}
          >
            <Animated.View
              style={[
                styles.avatarRing,
                {
                  borderColor: avatarBorderColor,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.avatarInner,
                  { backgroundColor: identity?.color || theme.primary },
                ]}
              >
                {identity?.avatarUrl ? (
                  <Image
                    source={{ uri: identity.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarInitial}>{avatarInitial}</Text>
                )}
              </View>
            </Animated.View>
            {isSOSAlertActive ? <View style={styles.alertDot} /> : null}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 100,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.4,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sideSlot: {
    width: 52,
    alignItems: 'flex-end',
  },
  logo: {
    flex: 1,
    height: LOGO_HEIGHT,
  },
  avatarBtn: {
    position: 'relative',
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  avatarInitial: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  alertDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#FF4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
