import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Phone, Mail, Clock, Shield, Heart } from 'lucide-react-native';
import { useThemePeriod } from '../../src/hooks/useThemePeriod';
import { useUIStore } from '../../src/store/ui_store';

/**
 * 🛰️ SOS / Central de Valorização da Vida (v1.2)
 * Camada: UI (Apoio Emocional)
 * Texto atualizado conforme solicitação do usuário.
 */

export default function SOSScreen() {
  const theme = useThemePeriod();
  const { setSOSAlert } = useUIStore();

  useEffect(() => {
    setSOSAlert(false);
  }, []);

  const handleCallCVV = () => Linking.openURL('tel:188');
  const handleEmailCVV = () => Linking.openURL('mailto:apoioemocional@cvv.org.br');

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
          <Shield size={40} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Portal de Apoio</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.text + '05' }]}>
        <Text style={[styles.message, { color: theme.text }]}>
          Se você chegou até aqui, saiba de uma coisa importante:{"\n\n"}
          <Text style={styles.bold}>sua vida tem valor.</Text>{"\n\n"}
          Existem momentos em que tudo parece pesado demais — pensamentos confusos, sentimentos difíceis de explicar, silêncio por dentro. Mas você não precisa enfrentar isso sozinho.{"\n\n"}
          <Text style={styles.cvvTitle}>CENTRO DE VALORIZAÇÃO DA VIDA (CVV)</Text>{"\n"}
          O Centro de Valorização da Vida está aqui para ouvir você.{"\n"}
          Sem julgamentos, sem pressa, com respeito, anonimato e total sigilo sobre tudo que for dito.{"\n\n"}
          Nossos voluntários são treinados para conversar com qualquer pessoa que esteja precisando de apoio emocional. Às vezes, tudo que precisamos é de alguém disposto a escutar de verdade.
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.text + '15' }]} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Phone size={18} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Outras formas de contato</Text>
          </View>
          <Text style={[styles.sectionText, { color: theme.text }]}>
            • Ligar gratuitamente para <Text style={styles.bold}>188 (24h)</Text>{"\n"}
          </Text>
          <TouchableOpacity onPress={handleEmailCVV}>
            <Text style={[styles.sectionText, { color: theme.text }]}>
              • Enviar um e-mail para{"\n"}
              <Text style={[styles.bold, { color: theme.primary }]}>apoioemocional@cvv.org.br</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.text + '15' }]} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horários do chat</Text>
          </View>
          <Text style={[styles.sectionText, { color: theme.text }]}>
            <Text style={styles.bold}>• Domingos:</Text> 15h às 00h{"\n"}
            <Text style={styles.bold}>• Segunda a Quinta:</Text> 08h às 00h{"\n"}
            <Text style={styles.bold}>• Sextas:</Text> 13h às 00h{"\n"}
            <Text style={styles.bold}>• Sábados:</Text> 13h às 00h
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.text + '15' }]} />

        <Text style={[styles.message, { color: theme.text, marginTop: 12 }]}>
          Se você estiver passando por um momento difícil, considere dar esse passo. Falar pode aliviar, compartilhar pode ajudar, e ser ouvido pode fazer diferença.{"\n\n"}
          <Text style={styles.bold}>Você importa. Sua história importa.</Text>{"\n\n"}
          E mesmo que agora não pareça, <Text style={styles.bold}>isso pode melhorar.</Text>{"\n\n"}
          Conte com a gente. Sempre.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.callBtn, { backgroundColor: theme.primary }]}
        onPress={handleCallCVV}
      >
        <Phone size={24} color="#FFF" />
        <Text style={styles.callBtnText}>Ligar para o 188</Text>
      </TouchableOpacity>

      <View style={styles.footerSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  card: { padding: 24, borderRadius: 32, marginBottom: 32 },
  message: { fontSize: 16, lineHeight: 26, textAlign: 'center', opacity: 0.9 },
  bold: { fontWeight: '800' },
  cvvTitle: { fontWeight: '900', fontSize: 17, marginTop: 12, display: 'flex' },
  divider: { height: 1, width: '100%', marginVertical: 20 },
  section: { marginVertical: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionText: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  callBtn: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
  callBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  footerSpacing: { height: 40 }
});
