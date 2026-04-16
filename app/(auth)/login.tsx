import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { useAuthStore } from '../../src/store/auth_store';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { LogIn, UserPlus } from 'lucide-react-native';
import { useUIStore } from '../../src/store/ui_store';
import { TRANSLATIONS } from '../../src/core/i18n';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_DESKTOP = SCREEN_WIDTH > 768;

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const { signIn, signUp, loading } = useAuthStore();
  const theme = useThemePeriod();
  const language = useUIStore((state) => state.language) || 'pt';
  const t = TRANSLATIONS[language];

  const loginLogo = language === 'en' 
    ? require('../../assets/logos/Logo principal_EN.png') 
    : require('../../assets/logos/Logo principal_PT.png');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    if (!isLogin && (!name || password.length < 6)) {
      Alert.alert('Identidade Incompleta', 'Nome é obrigatório e a senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password, name);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, IS_DESKTOP && { justifyContent: 'center', flexGrow: 1 }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={loginLogo}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.subtitle, { color: theme.text, opacity: 0.6 }]}>
            {isLogin ? t.loginSubtitle : t.startJourney}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>{t.nameLabel}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.text + '08', color: theme.text, borderColor: theme.text + '20' }]}
                placeholder={t.namePlaceholder}
                placeholderTextColor={theme.text + '40'}
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>{t.loginEmail}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.text + '08', color: theme.text, borderColor: theme.text + '20' }]}
              placeholder={t.emailPlaceholder}
              placeholderTextColor={theme.text + '40'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>{t.loginPassword}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.text + '08', color: theme.text, borderColor: theme.text + '20' }]}
              placeholder="••••••••"
              placeholderTextColor={theme.text + '40'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.authBtn, { backgroundColor: theme.primary }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.authBtnText}>
                  {isLogin ? t.loginButton : t.loginRegister}
                </Text>
                {isLogin ? <LogIn size={20} color="#FFF" /> : <UserPlus size={20} color="#FFF" />}
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)}
            style={styles.toggleBtn}
          >
            <Text style={[styles.toggleText, { color: theme.text }]}>
              {isLogin ? t.toggleToRegister : t.toggleToLogin}
              <Text style={{ color: theme.primary, fontWeight: '800' }}>
                {isLogin ? t.registerLink : t.loginLink}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.text, opacity: 0.4 }]}>
          {t.footerText}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 32, paddingTop: 100 },
  header: { alignItems: 'center', marginBottom: 48 },
  logoImage: {
    width: IS_DESKTOP ? 420 : SCREEN_WIDTH - 64,
    height: (IS_DESKTOP ? 420 : SCREEN_WIDTH - 64) * 0.63,
    maxHeight: SCREEN_HEIGHT * 0.35,
    marginBottom: 8,
    alignSelf: 'center'
  },
  subtitle: { fontSize: 16, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  form: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginLeft: 4, opacity: 0.8 },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1.5,
  },
  authBtn: {
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  authBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  toggleBtn: { marginTop: 24, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  footerText: { fontSize: 12, fontWeight: '600', fontStyle: 'italic' },
});
