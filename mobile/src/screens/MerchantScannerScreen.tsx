import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MerchantScannerScreenProps {
  user: any;
  onLogout: () => void;
}

export const MerchantScannerScreen: React.FC<MerchantScannerScreenProps> = ({ user, onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esnaf QR Tarayıcı</Text>
      <Text style={styles.subtitle}>Hoş geldiniz, {user.businessName || 'Esnaf'}</Text>
      
      <View style={styles.cameraBox}>
        <Text style={styles.cameraText}>[Kamera Alanı]</Text>
        <Text style={styles.cameraSubtext}>Öğrenci QR kodunu bu alana okutun.</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 40 },
  cameraBox: { width: 300, height: 300, backgroundColor: '#1e293b', borderRadius: 20, borderWidth: 2, borderColor: '#38bdf8', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  cameraText: { fontSize: 20, color: '#38bdf8', fontWeight: 'bold', marginBottom: 8 },
  cameraSubtext: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20 },
  logoutButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});
