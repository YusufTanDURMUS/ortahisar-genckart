import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Linking, ActivityIndicator, TextInput, ScrollView
} from 'react-native';
import { API_BASE_URL } from '../config/api';

interface Branch {
  id: string;
  title: string;
  address: string;
  isMain: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface Merchant {
  id: string;
  businessName: string;
  category: string;
  address: string;
  defaultDiscountRate: number;
  storeLocations: Branch[];
}

const CATEGORIES = ['TÜMÜ', 'Kırtasiye', 'Kafe/Restoran', 'Market', 'Giyim', 'Teknoloji', 'Kuaför/Berber', 'Spor/Eğlence', 'Kozmetik', 'Diğer'];

const CATEGORY_ICONS: Record<string, string> = {
  'TÜMÜ': '🏪',
  'Kırtasiye': '✏️',
  'Kafe/Restoran': '☕',
  'Market': '🛒',
  'Giyim': '👗',
  'Teknoloji': '💻',
  'Kuaför/Berber': '✂️',
  'Spor/Eğlence': '🏋️',
  'Kozmetik': '💄',
  'Diğer': '📦',
};

const CULTURAL_HUBS = [
  { name: 'Ganita Sahili', icon: '🌅', desc: 'Deniz kenarı kafe & çay bahçeleri' },
  { name: 'Boztepe & Teleferik', icon: '🏔️', desc: 'Panoramik şehir & çay terası' },
  { name: 'Kalkınma & KTÜ', icon: '🎓', desc: 'Öğrenci meydanı, kırtasiye & kitap' },
  { name: 'Meydan & Uzun Sokak', icon: '🛍️', desc: 'Giyim, teknoloji & lezzet durakları' },
];

export const DiscoverScreen: React.FC<{ user: any }> = ({ user }) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('TÜMÜ');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/student/merchants?`;
      if (activeCategory !== 'TÜMÜ') {
        url += `category=${encodeURIComponent(activeCategory)}&`;
      }
      if (searchQuery.trim() !== '') {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }

      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'SUCCESS') {
        setMerchants(json.data);
      }
    } catch (err) {
      console.log('Esnaflar çekilemedi', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMerchants();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery]);

  const openMap = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const renderMerchant = ({ item }: { item: Merchant }) => {
    const branches = item.storeLocations || [];
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.merchantCard}>
        {/* Kart Başlığı */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.categoryIconBadge}>
            <Text style={styles.categoryIconText}>{CATEGORY_ICONS[item.category] || '🏪'}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.businessName}>{item.businessName}</Text>
            <Text style={styles.categoryText}>{item.category} · Ortahisar</Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>%{item.defaultDiscountRate}</Text>
            <Text style={styles.discountSub}>İNDİRİM</Text>
          </View>
        </TouchableOpacity>

        {/* Ana Adres & Hızlı Buton */}
        <View style={styles.mainAddressRow}>
          <Text style={styles.mainAddressText} numberOfLines={2}>
            📍 {item.address || 'Trabzon Merkez'}
          </Text>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => openMap(item.address || 'Ortahisar Trabzon')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.mapBtnText}>Haritada Aç ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Şubeler Butonu (Eğer 1'den fazla şube varsa) */}
        {branches.length > 0 && (
          <TouchableOpacity
            style={styles.branchToggleBtn}
            onPress={() => setExpandedId(isExpanded ? null : item.id)}
          >
            <Text style={styles.branchToggleText}>
              {branches.length} Şube Mevcut {isExpanded ? '▲ Gizle' : '▼ Görüntüle'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Şube Listesi Açılır Alanı */}
        {isExpanded && branches.length > 0 && (
          <View style={styles.branchListContainer}>
            {branches.map((b) => (
              <View key={b.id} style={styles.branchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.branchTitle}>
                    {b.isMain ? '⭐ ' : '🏢 '}
                    {b.title}
                  </Text>
                  <Text style={styles.branchAddress}>{b.address}</Text>
                </View>
                <TouchableOpacity
                  style={styles.branchMapBtn}
                  onPress={() => openMap(b.address)}
                >
                  <Text style={styles.branchMapText}>Yol Tarifi</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>TRABZON ORTAHİSAR BELEDİYESİ</Text>
        </View>
        <Text style={styles.headerTitle}>Ortahisar’ı Keşfet</Text>
        <Text style={styles.headerSubtitle}>
          Ganita’dan Boztepe’ye Genç Kart İndirim Noktaları
        </Text>

        {/* Arama Çubuğu */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="İşletme adı veya mekan ara..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Kültürel Rotalar Yatay Şerit */}
      <View style={styles.culturalContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.culturalScroll}>
          {CULTURAL_HUBS.map((hub, idx) => (
            <View key={idx} style={styles.hubChip}>
              <Text style={styles.hubIcon}>{hub.icon}</Text>
              <View>
                <Text style={styles.hubTitle}>{hub.name}</Text>
                <Text style={styles.hubDesc}>{hub.desc}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Kategori Yatay Listesi */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, activeCategory === cat && styles.activeCategoryBtn]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryBtnText, activeCategory === cat && styles.activeCategoryBtnText]}>
                {CATEGORY_ICONS[cat] || '🏷️'} {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Esnaf Kartları Listesi */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>İşletmeler Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={merchants}
          keyExtractor={(item) => item.id}
          renderItem={renderMerchant}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌊</Text>
              <Text style={styles.emptyTitle}>İşletme Bulunamadı</Text>
              <Text style={styles.emptySub}>
                Bu kategoride veya aramada henüz kayıtlı esnaf bulunmuyor.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },

  // Header
  header: { backgroundColor: '#0284c7', paddingTop: 48, paddingBottom: 20, paddingHorizontal: 20 },
  headerBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  headerBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#ffffff', marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: '#e0f2fe', fontWeight: '500', marginBottom: 16 },

  // Arama
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500' },
  clearIcon: { fontSize: 14, color: '#94a3b8', padding: 4 },

  // Kültürel Rotalar
  culturalContainer: { backgroundColor: '#e0f2fe', paddingVertical: 10 },
  culturalScroll: { paddingHorizontal: 16, gap: 10 },
  hubChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: '#bae6fd' },
  hubIcon: { fontSize: 18 },
  hubTitle: { fontSize: 11, fontWeight: '800', color: '#0369a1' },
  hubDesc: { fontSize: 9, color: '#64748b', fontWeight: '500' },

  // Kategoriler
  categoriesContainer: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 10 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  activeCategoryBtn: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  categoryBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  activeCategoryBtnText: { color: '#ffffff' },

  // Liste
  listContent: { padding: 16, paddingBottom: 32 },
  merchantCard: { backgroundColor: '#ffffff', borderRadius: 22, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e0f2fe', shadowColor: '#0284c7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  categoryIconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryIconText: { fontSize: 20 },
  titleContainer: { flex: 1 },
  businessName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  categoryText: { fontSize: 11, color: '#0284c7', fontWeight: '600', marginTop: 2 },
  discountBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' },
  discountText: { fontSize: 15, fontWeight: '900', color: '#16a34a' },
  discountSub: { fontSize: 8, fontWeight: '800', color: '#15803d', letterSpacing: 1 },

  mainAddressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  mainAddressText: { fontSize: 12, color: '#475569', flex: 1, marginRight: 8 },
  mapBtn: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  mapBtnText: { fontSize: 11, fontWeight: '700', color: '#0369a1' },

  branchToggleBtn: { marginTop: 10, paddingVertical: 6, alignItems: 'center' },
  branchToggleText: { fontSize: 11, fontWeight: '700', color: '#0284c7' },

  branchListContainer: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  branchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  branchTitle: { fontSize: 12, fontWeight: '700', color: '#334155' },
  branchAddress: { fontSize: 11, color: '#64748b', marginTop: 2 },
  branchMapBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  branchMapText: { fontSize: 10, fontWeight: '700', color: '#475569' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 13, color: '#64748b', fontWeight: '600' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#64748b', textAlign: 'center', maxWidth: 260 },
});
