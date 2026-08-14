import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProfileScreenProps {
  user: any;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Öğrenci Profili</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Ad Soyad</Text>
        <Text style={styles.value}>{user.firstName} {user.lastName}</Text>

        <Text style={styles.label}>TC Kimlik Numarası</Text>
        <Text style={styles.value}>{user.tcKn ? user.tcKn.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2') : ''}</Text>

        <Text style={styles.label}>Doğum Yılı</Text>
        <Text style={styles.value}>{user.birthYear || 'Belirtilmedi'}</Text>

        <Text style={styles.label}>Eğitim Kurumu</Text>
        <Text style={styles.value}>{user.schoolName || 'Belirtilmedi'}</Text>

        <Text style={styles.label}>İkametgah / Okul İlçesi</Text>
        <Text style={styles.value}>{user.district || 'Belirtilmedi'}</Text>

        <Text style={styles.label}>Durum</Text>
        <Text style={[styles.value, { color: user.isEligible === false ? '#ef4444' : '#22c55e', marginBottom: user.isEligible === false ? 4 : 16 }]}>
          {user.isEligible === false ? 'Pasif' : 'Aktif Öğrenci'}
        </Text>
        {user.isEligible === false && (
          <Text style={styles.reasonText}>
            Sebep: {user.revokedNote || user.statusReason || 'Şartları sağlamıyorsunuz.'}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  label: { fontSize: 13, color: '#94a3b8', marginBottom: 4 },
  value: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 16 },
  logoutButton: { marginTop: 40, alignSelf: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  reasonText: { color: '#f87171', fontSize: 12, fontStyle: 'italic', marginBottom: 16, marginTop: -4 },
});
