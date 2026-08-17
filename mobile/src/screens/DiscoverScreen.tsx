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
        placeholderTextColor="#475569"
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
          <ActivityIndicator size="large" color="#2dd4bf" />
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
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#1a7ec8', paddingTop: 48 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2, marginBottom: 4 },
  searchInput: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 12,
    backgroundColor: '#ffffff', borderRadius: 16, padding: 14,
    color: '#1e3a5f', borderWidth: 1.5, borderColor: '#c2ddf0', fontSize: 15,
  },
  categoriesWrapper: { marginBottom: 12, paddingLeft: 16, height: 46 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, marginRight: 8, borderWidth: 1.5, borderColor: '#c2ddf0',
  },
  activeCategoryChip: { backgroundColor: '#1a7ec8', borderColor: '#1a7ec8' },
  categoryChipIcon: { fontSize: 14, marginRight: 4 },
  categoryChipText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  activeCategoryText: { color: '#ffffff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748b', fontSize: 14 },
  merchantCard: {
    backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 14,
    borderWidth: 1, borderColor: '#c2ddf0', overflow: 'hidden',
    shadowColor: '#1a7ec8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  categoryIconBadge: {
    width: 46, height: 46, backgroundColor: '#e8f4fd',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#c2ddf0',
  },
  categoryIconText: { fontSize: 22 },
  titleContainer: { flex: 1 },
  businessName: { fontSize: 17, fontWeight: 'bold', color: '#1e3a5f' },
  categoryText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  branchCountText: { fontSize: 11, color: '#1a7ec8', marginTop: 3, fontWeight: '600' },
  discountBadge: {
    backgroundColor: '#e8f4fd', paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 12, alignItems: 'center', minWidth: 52,
    borderWidth: 1, borderColor: '#c2ddf0',
  },
  discountText: { color: '#1a7ec8', fontWeight: 'bold', fontSize: 15 },
  discountLabel: { color: '#1a7ec8', fontSize: 10, fontWeight: '600', opacity: 0.85 },
  collapsedAddress: { paddingHorizontal: 14, paddingBottom: 12 },
  expandHint: { color: '#1a7ec8', fontSize: 11, marginTop: 4, fontWeight: '600' },
  addressText: { color: '#64748b', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  branchesContainer: {
    borderTopWidth: 1, borderTopColor: '#e8f4fd', padding: 12, gap: 10, backgroundColor: '#f0f7ff',
  },
  branchItem: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#c2ddf0',
  },
  mainBranchItem: { borderColor: '#1a7ec8', borderWidth: 1.5 },
  branchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  branchName: { color: '#1e3a5f', fontSize: 14, fontWeight: 'bold', flex: 1 },
  mainBadge: {
    backgroundColor: '#e8f4fd', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#c2ddf0',
  },
  mainBadgeText: { color: '#1a7ec8', fontSize: 10, fontWeight: '700' },
  mapButton: {
    backgroundColor: '#e8f4fd', paddingVertical: 8,
    borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#c2ddf0',
  },
  mapButtonText: { color: '#1a7ec8', fontWeight: '600', fontSize: 13 },
  emptyContainer: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#64748b', fontSize: 16, textAlign: 'center' },
});

