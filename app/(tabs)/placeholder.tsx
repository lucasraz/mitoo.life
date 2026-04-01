import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';

export default function PlaceholderScreen({ name }: { name: string }) {
  const theme = useThemePeriod();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{name}</Text>
      <Text style={{ color: theme.text, opacity: 0.6 }}>Em construção...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
