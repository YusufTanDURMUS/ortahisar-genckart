import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

interface ProfileScreenProps {
  user: any;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const InfoRow = ({ label, value, accent, icon }: { label: string; value: string; accent?: boolean; icon?: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelRow}>
        {icon && <Text style={styles.infoIcon}>{icon}</Text>}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, accent && styles.infoValueAccent]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.headerTitle}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.headerSub}>Ortahisar Genç Kart Sahibi</Text>

        <View style={[styles.statusBadge, user.isEligible === false && styles.statusBadgeInactive]}>
          <View style={[styles.statusDot, user.isEligible === false && styles.statusDotInactive]} />
          <Text style={[styles.statusText, user.isEligible === false && styles.statusTextInactive]}>
            {user.isEligible === false ? 'Pasif' : 'Aktif Genç Kart Üyesi'}
          </Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Öğrenci & Kimlik Bilgileri</Text>

        <InfoRow icon="👤" label="Ad Soyad" value={`${user.firstName} ${user.lastName}`} />
        <InfoRow icon="🪪" label="TC Kimlik No" value={user.tcKn ? user.tcKn.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2') : '—'} />
        <InfoRow icon="🎂" label="Doğum Yılı" value={String(user.birthYear || 'Belirtilmedi')} />
        <InfoRow icon="🎓" label="Eğitim Kurumu" value={user.schoolName || 'Karadeniz Teknik Üniversitesi (KTÜ)'} accent />
        <InfoRow icon="📍" label="İkametgah / İlçe" value={user.district || 'Ortahisar / Trabzon'} />

        {user.isEligible === false && user.revokedNote && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ {user.revokedNote || user.statusReason || 'Şartları sağlamıyorsunuz.'}</Text>
          </View>
        )}
      </View>

      {/* Cultural & Municipality Club Badge */}
      <View style={styles.badgeCard}>
        <Text style={styles.badgeIcon}>🏛️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.badgeName}>Trabzon Ortahisar Belediyesi</Text>
          <Text style={styles.badgeSub}>Akıllı Şehir & Gençlik Hizmetleri · v2.2</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>🚪 Güvenli Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  content: { flexGrow: 1, paddingBottom: 32 },

  // Header
  headerBanner: { backgroundColor: '#0284c7', alignItems: 'center', paddingTop: 48, paddingBottom: 28, paddingHorizontal: 24 },
  logoBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ffffff', padding: 2, borderWidth: 2, borderColor: '#38bdf8', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  logoImg: { width: '100%', height: '100%' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff', marginBottom: 2 },
  headerSub: { fontSize: 12, fontWeight: '600', color: '#e0f2fe', marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', gap: 6 },
  statusBadgeInactive: { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)' },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
  statusDotInactive: { backgroundColor: '#ef4444' },
  statusText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  statusTextInactive: { color: '#fca5a5' },

  // Info Card
  card: { backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 18, borderRadius: 24, padding: 20, shadowColor: '#0284c7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#e0f2fe' },
  cardTitle: { fontSize: 12, fontWeight: '800', color: '#0369a1', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
  infoRow: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12, marginBottom: 12 },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  infoIcon: { fontSize: 12 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  infoValueAccent: { color: '#0284c7' },

  warningBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 12, marginTop: 4 },
  warningText: { color: '#dc2626', fontSize: 13, fontWeight: '600', lineHeight: 20 },

  // Badge Card
  badgeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 14, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#e0f2fe', shadowColor: '#0284c7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  badgeIcon: { fontSize: 26 },
  badgeName: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  badgeSub: { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 1 },

  // Logout
  logoutBtn: { marginHorizontal: 16, marginTop: 18, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', paddingVertical: 14, borderRadius: 18, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontSize: 14, fontWeight: '800' },
});
