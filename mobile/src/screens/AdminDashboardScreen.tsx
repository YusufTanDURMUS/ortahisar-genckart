import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface AdminDashboardScreenProps {
  user: any;
  onLogout: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ user, onLogout }) => {
  return (
    <View style={styles.container}>
      {/* Blue Header */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerBadge}>ORTAHİSAR BELEDİYESİ</Text>
        <Text style={styles.headerTitle}>Yönetici Paneli</Text>
        <Text style={styles.headerSub}>{user.email}</Text>
      </View>
      <View style={styles.ribbon} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Sistem İstatistikleri</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👨‍🎓</Text>
            <Text style={styles.statNumber}>1,204</Text>
            <Text style={styles.statLabel}>Aktif Öğrenci</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏪</Text>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Kayıtlı Esnaf</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardWide]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statNumber}>₺12K</Text>
            <Text style={styles.statLabel}>Toplam İndirim</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sistemden Çık</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },

  // Header
  headerBanner: { backgroundColor: '#1a7ec8', paddingTop: 52, paddingBottom: 28, paddingHorizontal: 24 },
  headerBadge: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#ffffff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  ribbon: { width: '100%', height: 5, backgroundColor: '#0f5fa0' },

  // Content
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1a7ec8', textTransform: 'uppercase', letterSpacing: 2, marginTop: 20, marginBottom: 16 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#ffffff', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#c2ddf0', shadowColor: '#1a7ec8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  statCardWide: { flex: 1 },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#1a7ec8', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', textAlign: 'center' },

  // Logout
  logoutBtn: { backgroundColor: '#fef2f2', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center', marginTop: 32 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
