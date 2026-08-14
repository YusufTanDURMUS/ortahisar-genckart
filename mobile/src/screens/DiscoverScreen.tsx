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
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.branchCountText}>
              {branches.length > 1 ? `${branches.length} şube` : '1 şube'} · %{item.defaultDiscountRate} indirim
            </Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>%{item.defaultDiscountRate}</Text>
            <Text style={styles.discountLabel}>İndirim</Text>
          </View>
        </TouchableOpacity>

        {/* Şubeler */}
        {isExpanded && (
          <View style={styles.branchesContainer}>
            {branches.map((branch) => (
              <View key={branch.id} style={[styles.branchItem, branch.isMain && styles.mainBranchItem]}>
                <View style={styles.branchHeader}>
                  <Text style={styles.branchName}>
                    {branch.isMain ? '🏠 ' : '📍 '}{branch.title}
                  </Text>
                  {branch.isMain && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>Merkez</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>{branch.address}</Text>
                <TouchableOpacity style={styles.mapButton} onPress={() => openMap(branch.address)}>
                  <Text style={styles.mapButtonText}>🗺️ Haritada Göster</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Kapalıyken sadece merkez adres */}
        {!isExpanded && (
          <View style={styles.collapsedAddress}>
            <Text style={styles.addressText} numberOfLines={1}>
              📍 {branches.find(b => b.isMain)?.address || item.address}
            </Text>
            <Text style={styles.expandHint}>
              {branches.length > 1 ? `Tüm şubeleri gör ▼` : 'Detay için dokun ▼'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏪 Esnafları Keşfet</Text>
        <Text style={styles.headerSubtitle}>Anlaşmalı {merchants.length} işletme</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="İşletme veya adres ara..."
        placeholderTextColor="#64748b"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.activeCategoryChip]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={styles.categoryChipIcon}>{CATEGORY_ICONS[cat]}</Text>
              <Text style={[styles.categoryChipText, activeCategory === cat && styles.activeCategoryText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Esnaflar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={merchants}
          keyExtractor={(item) => item.id}
          renderItem={renderMerchant}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Bu kategoride işletme bulunamadı.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' }, // slate-50
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' }, // slate-900
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  searchInput: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#ffffff', borderRadius: 16, padding: 12,
    color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  categoriesWrapper: { marginBottom: 12, paddingLeft: 16, height: 46 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  activeCategoryChip: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' }, // ortahisar-blue
  categoryChipIcon: { fontSize: 14, marginRight: 4 },
  categoryChipText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  activeCategoryText: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748b', fontSize: 14 },
  merchantCard: {
    backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 14,
    borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  categoryIconBadge: {
    width: 46, height: 46, backgroundColor: '#f0f9ff', // sky-50
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#bae6fd', // sky-200
  },
  categoryIconText: { fontSize: 22 },
  titleContainer: { flex: 1 },
  businessName: { fontSize: 17, fontWeight: 'bold', color: '#0f172a' },
  categoryText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  branchCountText: { fontSize: 11, color: '#0ea5e9', marginTop: 3, fontWeight: '600' },
  discountBadge: {
    backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 8, // green-50
    borderRadius: 12, alignItems: 'center', minWidth: 52,
    borderWidth: 1, borderColor: '#bbf7d0', // green-200
  },
  discountText: { color: '#16a34a', fontWeight: 'bold', fontSize: 15 },
  discountLabel: { color: '#16a34a', fontSize: 10, fontWeight: '600', opacity: 0.85 },
  collapsedAddress: { paddingHorizontal: 14, paddingBottom: 12 },
  expandHint: { color: '#0ea5e9', fontSize: 11, marginTop: 4, fontWeight: '600' },
  addressText: { color: '#64748b', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  branchesContainer: {
    borderTopWidth: 1, borderTopColor: '#f1f5f9', padding: 12, gap: 10, backgroundColor: '#f8fafc',
  },
  branchItem: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  mainBranchItem: { borderColor: '#38bdf8', borderWidth: 1.5 },
  branchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  branchName: { color: '#0f172a', fontSize: 14, fontWeight: 'bold', flex: 1 },
  mainBadge: {
    backgroundColor: '#f0f9ff', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#bae6fd',
  },
  mainBadgeText: { color: '#0ea5e9', fontSize: 10, fontWeight: '700' },
  mapButton: {
    backgroundColor: '#f0f9ff', paddingVertical: 8,
    borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#bae6fd',
  },
  mapButtonText: { color: '#0ea5e9', fontWeight: '600', fontSize: 13 },
  emptyContainer: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#64748b', fontSize: 16, textAlign: 'center' },
});
