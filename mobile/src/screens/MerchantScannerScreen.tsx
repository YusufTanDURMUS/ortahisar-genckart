import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MerchantScannerScreenProps {
  user: any;
  onLogout: () => void;
}

export const MerchantScannerScreen: React.FC<MerchantScannerScreenProps> = ({ user, onLogout }) => {
  return (
    <View style={styles.container}>
      {/* Blue Header */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerBadge}>ORTAHİSAR BELEDİYESİ</Text>
        <Text style={styles.headerTitle}>Esnaf QR Tarayıcı</Text>
        <Text style={styles.headerSub}>Hoş geldiniz, {user.businessName || 'Esnaf'}</Text>
      </View>
      <View style={styles.ribbon} />

      <View style={styles.body}>
        {/* Camera Box */}
        <View style={styles.cameraBox}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraTitle}>QR / Barkod Okuyucu</Text>
          <Text style={styles.cameraSub}>Öğrenci Genç Kart kodunu bu alana okutun</Text>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            🔵 Öğrenci kartını ekrana göstermesini isteyin, ardından QR kodu tarayın.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },

  // Header
  headerBanner: { backgroundColor: '#1a7ec8', paddingTop: 52, paddingBottom: 28, paddingHorizontal: 24, alignItems: 'center' },
  headerBadge: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  ribbon: { width: '100%', height: 5, backgroundColor: '#0f5fa0' },

  // Body
  body: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 20 },

  cameraBox: { width: 280, height: 280, backgroundColor: '#ffffff', borderRadius: 24, borderWidth: 3, borderColor: '#1a7ec8', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', shadowColor: '#1a7ec8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6 },
  cameraIcon: { fontSize: 52, marginBottom: 12 },
  cameraTitle: { fontSize: 16, fontWeight: '800', color: '#1e3a5f', marginBottom: 8 },
  cameraSub: { fontSize: 12, color: '#64748b', textAlign: 'center', paddingHorizontal: 16, lineHeight: 18 },

  infoCard: { backgroundColor: '#e8f4fd', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#c2ddf0', width: '100%' },
  infoText: { color: '#1e3a5f', fontSize: 13, fontWeight: '600', lineHeight: 20, textAlign: 'center' },

  // Logout
  logoutBtn: { backgroundColor: '#fef2f2', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});
