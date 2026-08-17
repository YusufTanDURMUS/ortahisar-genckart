import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface ProfileScreenProps {
  user: any;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const InfoRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, accent && styles.infoValueAccent]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.headerBanner}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Text>
        </View>
        <Text style={styles.headerTitle}>{user.firstName} {user.lastName}</Text>
        <View style={[styles.statusBadge, user.isEligible === false && styles.statusBadgeInactive]}>
          <View style={[styles.statusDot, user.isEligible === false && styles.statusDotInactive]} />
          <Text style={[styles.statusText, user.isEligible === false && styles.statusTextInactive]}>
            {user.isEligible === false ? 'Pasif' : 'Aktif Öğrenci'}
          </Text>
        </View>
      </View>

      <View style={styles.ribbon} />

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kişisel Bilgiler</Text>

        <InfoRow label="Ad Soyad" value={`${user.firstName} ${user.lastName}`} />
        <InfoRow label="TC Kimlik No" value={user.tcKn ? user.tcKn.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2') : '—'} />
        <InfoRow label="Doğum Yılı" value={String(user.birthYear || 'Belirtilmedi')} />
        <InfoRow label="Eğitim Kurumu" value={user.schoolName || 'Belirtilmedi'} />
        <InfoRow label="İkametgah / İlçe" value={user.district || 'Belirtilmedi'} />

        {user.isEligible === false && user.revokedNote && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ {user.revokedNote || user.statusReason || 'Şartları sağlamıyorsunuz.'}</Text>
          </View>
        )}
      </View>

      {/* Badge Card */}
      <View style={styles.badgeCard}>
        <Text style={styles.badgeIcon}>🏛️</Text>
        <View>
          <Text style={styles.badgeName}>Ortahisar Belediyesi</Text>
          <Text style={styles.badgeSub}>Trabzon · Genç Kart v2.1.0</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  content: { flexGrow: 1, paddingBottom: 32 },

  // Header
  headerBanner: { backgroundColor: '#1a7ec8', alignItems: 'center', paddingTop: 48, paddingBottom: 32, paddingHorizontal: 24 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#ffffff' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', gap: 6 },
  statusBadgeInactive: { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)' },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
  statusDotInactive: { backgroundColor: '#ef4444' },
  statusText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  statusTextInactive: { color: '#fca5a5' },

  ribbon: { width: '100%', height: 5, backgroundColor: '#0f5fa0' },

  // Info Card
  card: { backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 20, borderRadius: 24, padding: 24, shadowColor: '#1a7ec8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#c2ddf0' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1a7ec8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 },
  infoRow: { borderBottomWidth: 1, borderBottomColor: '#e8f4fd', paddingBottom: 14, marginBottom: 14 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#1e3a5f' },
  infoValueAccent: { color: '#1a7ec8' },

  warningBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12, marginTop: 4 },
  warningText: { color: '#dc2626', fontSize: 13, fontWeight: '600', lineHeight: 20 },

  // Badge Card
  badgeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#c2ddf0' },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontSize: 14, fontWeight: '800', color: '#1e3a5f' },
  badgeSub: { fontSize: 11, color: '#64748b', marginTop: 2 },

  // Logout
  logoutBtn: { marginTop: 24, marginHorizontal: 40, alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});
