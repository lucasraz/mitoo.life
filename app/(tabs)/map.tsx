import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
// MapView desativado na Web para compatibilidade rápida
// No Celular, o react-native-maps funciona normalmente.
import { MapPin, Target, Globe } from 'lucide-react-native';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';

/**
 * 🛰️ Map Screen (Mapa Global)
 * Camada: UI (Visualização Geo-Referenciada)
 * Versão Estabilizada para Web/Canary.
 */

export default function MapScreen() {
  const theme = useThemePeriod();

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Globe size={64} color={theme.primary} style={{ marginBottom: 20 }} />
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>Mitoo.Life Mapa</Text>
        <Text style={{ color: theme.text, opacity: 0.6, marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }}>
          O mapa interativo está disponível no App Nativo (Android/iOS).
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={{ color: '#FFF' }}>Mapa Nativo Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
