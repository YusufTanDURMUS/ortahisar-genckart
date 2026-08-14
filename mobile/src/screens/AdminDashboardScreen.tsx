import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface AdminDashboardScreenProps {
  user: any;
  onLogout: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ user, onLogout }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Yönetici Paneli</Text>
      <Text style={styles.subtitle}>Hoş geldiniz, {user.email}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1,204</Text>
          <Text style={styles.statLabel}>Aktif Öğrenci</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>45</Text>
          <Text style={styles.statLabel}>Kayıtlı Esnaf</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₺12K</Text>
          <Text style={styles.statLabel}>Toplam İndirim</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Sistemden Çık</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8, marginTop: 40 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 32 },
  statsContainer: { gap: 16, marginBottom: 40 },
  statCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#38bdf8', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  logoutButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', alignItems: 'center' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});
