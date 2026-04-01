import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity,
} from 'react-native';
import { Heart, X } from 'lucide-react-native';

interface ManifestoModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

/**
 * 🕊️ Manifesto Modal (Acolhimento Manifesto)
 * Camada: UI (Apresentação pura)
 */
export function ManifestoModal({ visible, onClose, theme }: ManifestoModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={onClose}
          >
            <X size={24} color={theme.text} opacity={0.5} />
          </TouchableOpacity>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Heart size={32} color={theme.primary} fill={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Leia e lembre-se</Text>
            </View>

            <Text style={[styles.body, { color: theme.text }]}>
              Gostaríamos que você tirasse um momento para ler isso.{"\n\n"}
              Antes de qualquer coisa: <Text style={styles.bold}>você importa.</Text>{"\n"}
              E talvez você não perceba, mas também pode ser extremamente importante na vida de outras pessoas — especialmente aquelas que sentem o mesmo que você.{"\n\n"}
              Aqui no <Text style={[styles.bold, { color: theme.primary }]}>Mitoo.life</Text>, você nunca está sozinho.{"\n\n"}
              Este é um espaço de acolhimento, respeito e conexão. Um lugar onde palavras sinceras têm valor, onde ajudar o outro também é uma forma de se ajudar. Não há julgamentos, não há desprezo — apenas pessoas reais vivendo sentimentos reais.{"\n\n"}
              Você pode ser quem quiser aqui.{"\n"}
              Pode falar, pode ouvir, pode apenas sentir.{"\n"}
              O anonimato é bem-vindo, mas a coragem de se expressar também.{"\n\n"}
              Compartilhe o que carrega, apoie quem precisa e permita-se ser apoiado. Histórias diferentes ou parecidas, todas têm valor.{"\n\n"}
              Hoje, lembre-se disso:{"\n"}
              <Text style={styles.bold}>você é importante — e faz parte disso aqui.</Text>{"\n\n"}
              Conte com a gente. Sempre.
            </Text>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
              onPress={onClose}
            >
              <Text style={styles.actionBtnText}>Eu entendi. Obrigado.</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  content: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
    padding: 8
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center'
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'left',
    opacity: 0.8,
    marginBottom: 40
  },
  bold: {
    fontWeight: '800'
  },
  actionBtn: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800'
  }
});
