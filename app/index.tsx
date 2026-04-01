import { Redirect } from 'expo-router';

/**
 * 🛰️ Entry Point
 * Redireciona automaticamente para as abas principais (Feed).
 */

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
