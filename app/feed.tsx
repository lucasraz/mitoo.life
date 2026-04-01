import { Redirect } from 'expo-router';

/**
 * 🛰️ Redirecionador de Emergência
 * Corrige rotas antigas ou inexistentes como '/feed' 
 * e leva o usuário para a Home correta.
 */

export default function FeedRedirect() {
  return <Redirect href="/(tabs)" />;
}
