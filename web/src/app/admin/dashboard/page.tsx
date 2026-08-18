'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Users, CheckCircle2, CircleDollarSign, Plus, List, Store, AlertCircle, X, Trash2, Check, XCircle, MapPin, Building2, UserPlus, Link2, Sparkles, Search, Compass, RefreshCw, UserCheck, ShieldAlert, GitBranch } from 'lucide-react';
import Image from 'next/image';
import { NEIGHBORHOODS, getStreetsByNeighborhood } from '@/lib/ortahisarAddress';

interface MerchantItem {
  id: string;
  businessName: string;
  category: string;
  address: string | null;
  taxNumber: string | null;
  symbol: string | null;
  defaultDiscountRate: number;
  qrCodeIdentifier: string;
  createdAt: string;
  totalSavedAmount?: number;
  totalRevenue?: number;
  totalDiscountedAmount?: number;
  transactionCount?: number;
  user?: { id: string; email: string; phoneNumber: string | null; createdAt: string };
  storeLocations?: { id: string; title: string; address: string; symbol: string | null; isMain: boolean }[];
}

interface DiscountRequestItem {
  id: string;
  merchantId: string;
  type?: string;
  currentRate: number;
  requestedRate: number;
  targetLocationTitle?: string;
  fullAddress?: string;
  symbol?: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  merchant: {
    id: string;
    businessName: string;
    category: string;
  };
}

interface StatsData {
  totalMerchants: number;
  pendingRequests: number;
  totalTransactions: number;
  totalStudents: number;
  totalSaved: number;
  totalRevenue: number;
  totalDiscounted: number;
}

interface UserItem {
  id: string;
  role: 'STUDENT' | 'MERCHANT' | 'MODERATOR' | 'ADMIN';
  email: string | null;
  phoneNumber: string | null;
  createdAt: string;
  displayName: string;
  tcKn: string | null;
  birthYear: number | null;
  schoolName: string | null;
  district: string | null;
  isEligible: boolean;
  statusReason: string | null;
  businessName: string | null;
  category: string | null;
  discountRate: number | null;
  taxNumber: string | null;
  address: string | null;
}

const API_BASE = 'http://localhost:3000/api/v1';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'MODERATOR' | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'requests' | 'merchants' | 'users'>('requests');
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [requests, setRequests] = useState<DiscountRequestItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'STUDENT' | 'MERCHANT' | 'MODERATOR' | 'ADMIN'>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Yeni Esnaf Ekleme Modalı
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    category: 'Kırtasiye',
    neighborhood: '',
    street: '',
    customStreet: '',
    buildingNo: '',
    taxNumber: '',
    symbol: '📚',
    defaultDiscountRate: '15',
    accountMode: 'new' as 'new' | 'existing',
    selectedExistingEmail: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  // Yeni Şube / Dükkan Ekleme Modalı
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [selectedMerchantForBranch, setSelectedMerchantForBranch] = useState<MerchantItem | null>(null);
  const [branchForm, setBranchForm] = useState({
    title: '',
    neighborhood: '',
    street: '',
    customStreet: '',
    buildingNo: '',
    symbol: '📍',
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      document.cookie = 'token=; Max-Age=0; path=/';
      document.cookie = 'user_role=; Max-Age=0; path=/';
      window.location.href = '/admin/login';
      return null;
    }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const [mRes, rRes, sRes, uRes, meRes] = await Promise.all([
        fetch(`${API_BASE}/admin/merchants`, { headers }),
        fetch(`${API_BASE}/admin/discount-requests`, { headers }),
        fetch(`${API_BASE}/admin/stats`, { headers }),
        fetch(`${API_BASE}/admin/users`, { headers }),
        fetch(`${API_BASE}/admin/me`, { headers })
      ]);

      if (mRes.status === 401 || mRes.status === 403) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      const [mData, rData, sData, uData, meData] = await Promise.all([
        mRes.json(),
        rRes.json(),
        sRes.json(),
        uRes.json(),
        meRes.json()
      ]);

      if (mData.status === 'SUCCESS') setMerchants(mData.data);
      if (rData.status === 'SUCCESS') setRequests(rData.data);
      if (sData.status === 'SUCCESS') setStats(sData.data);
      if (uData.status === 'SUCCESS') setUsers(uData.data);
      if (meData.status === 'SUCCESS' && meData.data) {
        setCurrentUserRole(meData.data.role);
        setCurrentUserEmail(meData.data.email || '');
      } else {
        const storedRole = localStorage.getItem('admin_role') as 'ADMIN' | 'MODERATOR' | null;
        if (storedRole) setCurrentUserRole(storedRole);
      }
    } catch (err) {
      console.error('Veri çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReviewRequest = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_BASE}/admin/discount-requests/${requestId}/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        await fetchData();
      } else {
        alert('İşlem başarısız oldu.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return;

    const targetEmail = form.accountMode === 'existing' ? form.selectedExistingEmail : form.email;
    if (!targetEmail) {
      alert('Lütfen bir esnaf e-posta adresi seçin veya girin.');
      return;
    }

    const selectedStreet = form.street === 'Diğer' ? form.customStreet : form.street;
    const addressParts = [
      form.neighborhood ? `${form.neighborhood} Mah.` : '',
      selectedStreet || '',
      form.buildingNo ? `No:${form.buildingNo}` : '',
      'Ortahisar/Trabzon'
    ].filter(Boolean);
    const fullAddress = addressParts.join(' ');

    setActionLoading('create');
    try {
      const res = await fetch(`${API_BASE}/admin/merchants`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          businessName: form.businessName,
          category: form.category,
          address: fullAddress,
          taxNumber: form.taxNumber,
          symbol: form.symbol || null,
          defaultDiscountRate: form.defaultDiscountRate,
          email: targetEmail,
          phoneNumber: form.phoneNumber,
          password: form.accountMode === 'new' ? form.password : (form.password || undefined)
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        setShowAddModal(false);
        setForm({
          businessName: '',
          category: 'Kırtasiye',
          neighborhood: '',
          street: '',
          customStreet: '',
          buildingNo: '',
          taxNumber: '',
          symbol: '📚',
          defaultDiscountRate: '15',
          accountMode: 'new',
          selectedExistingEmail: '',
          email: '',
          phoneNumber: '',
          password: ''
        });
        await fetchData();
      } else {
        alert(data.message || 'Esnaf eklenemedi.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchantForBranch) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    const selectedStreet = branchForm.street === 'Diğer' ? branchForm.customStreet : branchForm.street;
    const addressParts = [
      branchForm.neighborhood ? `${branchForm.neighborhood} Mah.` : '',
      selectedStreet || '',
      branchForm.buildingNo ? `No:${branchForm.buildingNo}` : '',
      'Ortahisar/Trabzon'
    ].filter(Boolean);
    const fullAddress = addressParts.join(' ');

    if (!fullAddress.trim()) {
      alert('Lütfen şube adresini eksiksiz girin.');
      return;
    }

    setActionLoading('create-branch');
    try {
      const res = await fetch(`${API_BASE}/admin/merchants/${selectedMerchantForBranch.id}/locations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: branchForm.title || `${selectedMerchantForBranch.businessName} (Şube)`,
          address: fullAddress,
          symbol: branchForm.symbol || null,
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        setShowAddBranchModal(false);
        setSelectedMerchantForBranch(null);
        setBranchForm({
          title: '',
          neighborhood: '',
          street: '',
          customStreet: '',
          buildingNo: '',
          symbol: '📍',
        });
        await fetchData();
      } else {
        alert(data.message || 'Şube eklenemedi.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, targetUserDisplayName: string, newRole: string) => {
    if (currentUserRole !== 'ADMIN') {
      alert('Kullanıcı rollerini yalnızca Sistem Yöneticisi (ADMIN) hesabı değiştirebilir.');
      return;
    }

    if (!confirm(`"${targetUserDisplayName}" kullanıcısının rolünü "${newRole}" olarak değiştirmek istediğinize emin misiniz?`)) {
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setActionLoading(`role-${userId}`);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        await fetchData();
      } else {
        alert(data.message || 'Rol güncellenemedi.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMerchant = async (merchantId: string, businessName: string) => {
    if (currentUserRole !== 'ADMIN') {
      alert('Esnaf kaydını tamamen silme yetkisi yalnızca Sistem Yöneticisi (ADMIN) hesabına aittir.');
      return;
    }

    if (!confirm(`"${businessName}" işletmesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    setActionLoading(merchantId);
    try {
      const res = await fetch(`${API_BASE}/admin/merchants/${merchantId}`, { method: 'DELETE', headers });
      if (res.ok) {
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Silme işlemi başarısız.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'user_role=; Max-Age=0; path=/';
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-sky-200 mb-4 shadow-lg shadow-sky-500/10">
            <ShieldCheck className="animate-pulse h-7 w-7 text-sky-600" />
          </div>
          <p className="text-slate-600 text-sm font-bold">Yönetim Paneli Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9ff] via-[#f8fafc] to-[#ffffff] text-slate-800 font-sans relative overflow-x-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-[140px] pointer-events-none" />

      {/* ── NAVBAR ── */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-sky-100 sticky top-0 z-30 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative group flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-sky-400 flex items-center justify-center overflow-hidden shadow-md">
                <Image
                  src="/logo.png"
                  alt="Ortahisar Belediyesi"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-sky-950 tracking-tight flex items-center gap-2">
                TRABZON ORTAHİSAR BELEDİYESİ
                {currentUserRole === 'ADMIN' ? (
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                    👑 Sistem Yöneticisi (ADMIN)
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                    ⚖️ Moderatör (MODERATOR)
                  </span>
                )}
              </h1>
              <p className="text-[11px] font-bold text-sky-600 tracking-wide uppercase">
                Akıllı Şehir & Esnaf İndirim Sistemi Denetim Merkezi
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData()}
              className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Yenile"
            >
              <RefreshCw size={14} />
              <span className="hidden md:inline">Yenile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">

        {/* ─── Top Stats Grid (4 Colorful Cards) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. Kayıtlı Esnaflar */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-sky-100 shadow-md shadow-sky-500/5 hover:border-sky-300 transition-all flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform flex-shrink-0">
              <Store size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none mb-1">{stats?.totalMerchants ?? 0}</p>
              <p className="text-xs text-slate-500 font-bold">Kayıtlı Anlaşmalı Esnaf</p>
              <p className="text-[10px] text-sky-600 font-semibold mt-0.5">Ortahisar Geneli</p>
            </div>
          </div>

          {/* 2. Bekleyen Talepler */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-amber-100 shadow-md shadow-amber-500/5 hover:border-amber-300 transition-all flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform flex-shrink-0">
              <List size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none mb-1">{stats?.pendingRequests ?? 0}</p>
              <p className="text-xs text-slate-500 font-bold">Bekleyen Talep</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">İndirim & Şube Onayı</p>
            </div>
          </div>

          {/* 3. Kayıtlı Gençler */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-emerald-100 shadow-md shadow-emerald-500/5 hover:border-emerald-300 transition-all flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform flex-shrink-0">
              <Users size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none mb-1">{stats?.totalStudents ?? 0}</p>
              <p className="text-xs text-slate-500 font-bold">Genç Kart Sahibi</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">15-25 Yaş Gençler</p>
            </div>
          </div>

          {/* 4. Toplam Tasarruf */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-indigo-100 shadow-md shadow-indigo-500/5 hover:border-indigo-300 transition-all flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform flex-shrink-0">
              <CircleDollarSign size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none mb-1">
                ₺{(stats?.totalSaved ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-500 font-bold">Gençlere Toplam Tasarruf</p>
              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Yerel Esnaf Katkısı</p>
            </div>
          </div>
        </div>

        {/* ─── Tabs & Action Bar ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-sky-100 shadow-sm">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'requests'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <List size={15} />
              Onay Talepleri ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('merchants')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'merchants'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Store size={15} />
              İşletmeler & Şubeler ({merchants.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'users'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users size={15} />
              Kullanıcı & Rol Yönetimi ({users.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-sky-500/25"
          >
            <Plus size={16} />
            Yeni Esnaf Ekle
          </button>
        </div>

        {/* ─── TAB 1: ONAY TALEPLERİ (İndirim & Şube) ─── */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-20 bg-white/90 rounded-3xl border border-sky-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-50 border border-sky-200 mb-3 text-sky-600">
                  <AlertCircle size={26} />
                </div>
                <p className="text-slate-800 font-bold text-sm">Bekleyen esnaf onay talebi bulunmuyor.</p>
                <p className="text-slate-500 text-xs mt-1">Esnaflar yeni bir indirim oranı veya yeni şube talep ettiğinde burada listelenir.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-sky-100 hover:border-sky-300 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-base font-bold text-slate-900">{req.merchant.businessName}</h3>
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {req.type === 'NEW_LOCATION' ? 'YENİ ŞUBE TALEBİ' : req.type === 'LOCATION_UPDATE' ? 'ADRES GÜNCELLEME' : 'İNDİRİM ORANI TALEBİ'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Kategori: <span className="text-slate-800 font-semibold">{req.merchant.category}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      Tarih: <span className="text-slate-800 font-semibold">{new Date(req.createdAt).toLocaleDateString('tr-TR')}</span>
                    </p>

                    {req.type === 'NEW_LOCATION' || req.type === 'LOCATION_UPDATE' ? (
                      <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 text-xs space-y-1">
                        <div className="font-bold text-sky-900 flex items-center gap-1.5">
                          <span>📍</span>
                          <span>{req.targetLocationTitle || 'Yeni Şube'}</span>
                        </div>
                        <div className="text-slate-600">{req.fullAddress || 'Adres bilgisi'}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="bg-slate-50 px-3 py-1.5 rounded-lg text-slate-600 border border-slate-200">
                          Mevcut: %{req.currentRate}
                        </span>
                        <span className="text-sky-500">➔</span>
                        <span className="bg-emerald-50 px-3 py-1.5 rounded-lg text-emerald-700 border border-emerald-200">
                          Talep Edilen: %{req.requestedRate}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleReviewRequest(req.id, 'REJECTED')}
                      disabled={actionLoading === req.id}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-red-200 shadow-sm"
                    >
                      <XCircle size={15} />
                      Reddet
                    </button>
                    <button
                      onClick={() => handleReviewRequest(req.id, 'APPROVED')}
                      disabled={actionLoading === req.id}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Check size={15} />
                      Onayla
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 2: İŞLETMELER VE ŞUBELER ─── */}
        {activeTab === 'merchants' && (
          <div className="space-y-4">
            {merchants.length === 0 ? (
              <div className="text-center py-20 bg-white/90 rounded-3xl border border-sky-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-50 border border-sky-200 mb-3 text-sky-600">
                  <Store size={26} />
                </div>
                <p className="text-slate-800 font-bold text-sm">Henüz kayıtlı esnaf bulunmuyor.</p>
                <p className="text-slate-500 text-xs mt-1">&quot;Yeni Esnaf Ekle&quot; butonuyla sisteme işletme tanımlayabilirsiniz.</p>
              </div>
            ) : (
              merchants.map((m) => (
                <div
                  key={m.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-sky-100 hover:border-sky-300 transition-all flex flex-col gap-4 shadow-sm hover:shadow-md group"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Symbol / Emoji Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                        {m.symbol || (m.category === 'Kırtasiye' ? '📚' : m.category === 'Kafe/Restoran' ? '☕' : m.category === 'Market' ? '🛒' : m.category === 'Giyim' ? '👗' : m.category === 'Teknoloji' ? '💻' : m.category === 'Kuaför/Berber' ? '✂️' : m.category === 'Spor/Eğlence' ? '🏋️' : m.category === 'Kozmetik' ? '💄' : '🏪')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-slate-900 truncate">{m.businessName}</h3>
                          <span className="flex-shrink-0 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Aktif
                          </span>
                          <span className="flex-shrink-0 bg-sky-50 text-sky-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-200">
                            %{m.defaultDiscountRate} İndirim
                          </span>
                          <span className="flex-shrink-0 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                            {m.category}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1.5">
                            <span>📍</span>
                            <span className="truncate max-w-xs">{m.address || 'Ortahisar/Trabzon'}</span>
                          </span>
                          {m.user?.email && (
                            <span className="flex items-center gap-1.5">
                              <span>✉️</span>
                              <span className="truncate">{m.user.email}</span>
                            </span>
                          )}
                          <span>
                            VKN: <strong className="text-slate-700">{m.taxNumber || '—'}</strong>
                          </span>
                        </div>

                        {/* ── İŞLEM VE TOPLAM İNDİRİM TUTARI ŞERİDİ ── */}
                        <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200/80 font-bold shadow-xs">
                            <span>💰</span>
                            <span>Uygulanan Toplam İndirim:</span>
                            <span className="text-emerald-950 font-black">
                              ₺{(m.totalSavedAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 bg-sky-50 text-sky-800 px-3 py-1 rounded-xl border border-sky-200/80 font-bold shadow-xs">
                            <span>📊</span>
                            <span>İşlem:</span>
                            <span className="text-sky-950 font-black">{m.transactionCount || 0} Adet</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedMerchantForBranch(m);
                          setShowAddBranchModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all shadow-xs"
                      >
                        <Plus size={14} />
                        <span>Şube Ekle</span>
                      </button>

                      {currentUserRole === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteMerchant(m.id, m.businessName)}
                          disabled={actionLoading === m.id}
                          className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-500 text-red-600 hover:text-white transition-all border border-red-200 flex items-center justify-center shadow-sm"
                          title="İşletmeyi Sil (Yalnızca Admin)"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Şubeler / Lokasyonlar Listesi */}
                  {m.storeLocations && m.storeLocations.length > 0 && (
                    <div className="mt-1 pt-2 border-t border-slate-100 bg-slate-50/60 p-3 rounded-xl space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <GitBranch size={13} className="text-sky-600" />
                        <span>Kayıtlı Şubeler ({m.storeLocations.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {m.storeLocations.map((loc) => (
                          <div key={loc.id} className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-xs">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <span>{loc.symbol || '📍'}</span>
                              <span className="truncate">{loc.title}</span>
                              {loc.isMain && (
                                <span className="bg-sky-50 text-sky-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-sky-200 ml-auto">
                                  Merkez
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{loc.address}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 3: KULLANICI & ROL YÖNETİMİ ─── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Moderatör Bilgilendirme Rozeti (Eğer moderatör ise) */}
            {currentUserRole === 'MODERATOR' && (
              <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-medium shadow-xs">
                <ShieldAlert size={20} className="text-amber-600 flex-shrink-0" />
                <div>
                  <strong className="font-bold">Moderatör Yetki Kısıtlaması:</strong> Bu alanda kayıtlı kullanıcıları ve rollerini inceleyebilirsiniz. Yeni moderatör veya yönetici atama gibi <strong>rol değişiklikleri yalnızca Sistem Yöneticisi (ADMIN)</strong> tarafından yapılabilir.
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-sm">
              {/* Search input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500">
                  <Search size={15} />
                </div>
                <input
                  type="text"
                  placeholder="İsim, TC No, Telefon veya E-posta ile ara..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-sky-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all font-medium"
                />
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto overflow-x-auto">
                {(['ALL', 'STUDENT', 'MERCHANT', 'MODERATOR', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      userRoleFilter === r
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'ALL' ? 'Tümü' : r === 'STUDENT' ? 'Öğrenciler' : r === 'MERCHANT' ? 'Esnaflar' : r === 'MODERATOR' ? 'Moderatörler' : 'Adminler'}
                  </button>
                ))}
              </div>
            </div>

            {/* User Cards List */}
            {users
              .filter((u) => {
                const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                const q = userSearchQuery.toLowerCase().trim();
                if (!q) return matchesRole;
                return (
                  matchesRole &&
                  (u.displayName.toLowerCase().includes(q) ||
                    (u.tcKn && u.tcKn.includes(q)) ||
                    (u.phoneNumber && u.phoneNumber.includes(q)) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.schoolName && u.schoolName.toLowerCase().includes(q)))
                );
              })
              .map((u) => (
                <div
                  key={u.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-sky-100 hover:border-sky-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm hover:shadow-md group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <h3 className="text-base font-bold text-slate-900">{u.displayName}</h3>
                      
                      {/* Role Badge */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          u.role === 'STUDENT'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : u.role === 'MERCHANT'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : u.role === 'MODERATOR'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {u.role === 'STUDENT' ? '👨‍🎓 ÖĞRENCİ' : u.role === 'MERCHANT' ? '🏪 ESNAF' : u.role === 'MODERATOR' ? '⚖️ MODERATÖR' : '👑 ADMİN'}
                      </span>

                      {/* Student Eligibility or Discount Badge */}
                      {u.role === 'STUDENT' && (
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            u.isEligible
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {u.isEligible ? 'Aktif Genç Kart' : 'Pasif / Şart Sağlamıyor'}
                        </span>
                      )}

                      {u.role === 'MERCHANT' && u.discountRate && (
                        <span className="bg-sky-50 text-sky-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-200">
                          %{u.discountRate} İndirim
                        </span>
                      )}
                    </div>

                    {/* Metadata details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2">
                      {/* TC Kimlik No */}
                      {u.tcKn && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-mono text-[11px]">TC:</span>
                          <span className="text-slate-800 font-mono font-bold">{u.tcKn}</span>
                        </div>
                      )}

                      {/* Telefon */}
                      <div className="flex items-center gap-1.5">
                        <span>📞</span>
                        <span className="text-slate-700 font-mono">{u.phoneNumber || 'Belirtilmedi'}</span>
                      </div>

                      {/* E-Posta */}
                      <div className="flex items-center gap-1.5">
                        <span>✉️</span>
                        <span className="text-slate-700 truncate">{u.email || '—'}</span>
                      </div>

                      {/* Ek Bilgi */}
                      <div className="flex items-center gap-1.5">
                        <span>{u.role === 'STUDENT' ? '🎓' : u.role === 'MERCHANT' ? '🏷️' : '🏛️'}</span>
                        <span className="text-slate-800 font-medium truncate">
                          {u.schoolName || u.category || (u.role === 'MODERATOR' ? 'Belediye Moderasyon' : u.role === 'ADMIN' ? 'Belediye Bilgi İşlem' : 'Ortahisar')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Role changer (ADMIN only) or info */}
                  <div className="flex items-center gap-3 self-end lg:self-center">
                    {currentUserRole === 'ADMIN' ? (
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 pl-1 uppercase">Rol Ata:</span>
                        <select
                          value={u.role}
                          disabled={actionLoading === `role-${u.id}`}
                          onChange={(e) => handleUpdateUserRole(u.id, u.displayName, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 transition-all cursor-pointer shadow-2xs"
                        >
                          <option value="STUDENT">Öğrenci (STUDENT)</option>
                          <option value="MERCHANT">Esnaf (MERCHANT)</option>
                          <option value="MODERATOR">Moderatör (MODERATOR)</option>
                          <option value="ADMIN">Yönetici (ADMIN)</option>
                        </select>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Kayıt: {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* ─── YENİ ESNAF EKLEME MODALI ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-sky-100 shadow-2xl relative overflow-hidden my-8">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-teal-500 to-blue-600" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Building2 size={20} className="text-sky-600" />
                  Yeni Esnaf Tanımla
                </h2>
                <p className="text-xs text-sky-600 font-medium mt-0.5">Sisteme anlaşmalı işletme ve şube adresi tanımlayın</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-4 text-xs">
              {/* 1. İŞLETME BİLGİLERİ */}
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-[11px] uppercase tracking-wider">
                  <Store size={14} />
                  İşletme Bilgileri
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                      İşletme Adı (Yeni) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                      placeholder="Örn: Boztepe Kitabevi & Kafe"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                      Kategori *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                    >
                      {['Kırtasiye', 'Kafe/Restoran', 'Market', 'Giyim', 'Teknoloji', 'Kuaför/Berber', 'Spor/Eğlence', 'Kozmetik', 'Diğer'].map(
                        (cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* İşletme Sembolü / İkonu Seçimi */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                    İşletme Sembolü / Simgesi (İsteğe Bağlı)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {['📚', '☕', '🛒', '🛍️', '💻', '✂️', '🏋️', '💄', '🍕', '🎨', '🌟', '🏢'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setForm({ ...form, symbol: emoji })}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                          form.symbol === emoji
                            ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300'
                            : 'bg-white border border-slate-200 hover:bg-sky-50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, symbol: '' })}
                      className={`px-2.5 h-8 rounded-lg text-[10px] font-bold transition-all ${
                        !form.symbol
                          ? 'bg-slate-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Boş Bırak
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Özel emoji veya sembol girebilirsiniz (Örn: ☕ veya boş)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                      İndirim Oranı (%) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={form.defaultDiscountRate}
                      onChange={(e) => setForm({ ...form, defaultDiscountRate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                      Vergi Kimlik No (VKN)
                    </label>
                    <input
                      type="text"
                      value={form.taxNumber}
                      onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                      placeholder="6100000001"
                    />
                  </div>
                </div>
              </div>

              {/* 2. ADRES SEÇİMİ */}
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-[11px] uppercase tracking-wider">
                  <MapPin size={14} />
                  Adres Bilgileri (Trabzon / Ortahisar)
                </div>

                {/* İl / İlçe */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">İL</label>
                    <input
                      type="text"
                      value="Trabzon"
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 text-xs font-bold cursor-not-allowed select-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">İLÇE</label>
                    <input
                      type="text"
                      value="Ortahisar"
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 text-xs font-bold cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                {/* Mahalle / Cadde-Sokak */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">MAHALLE *</label>
                    <select
                      required
                      value={form.neighborhood}
                      onChange={(e) => {
                        setForm({ ...form, neighborhood: e.target.value, street: '', customStreet: '' });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                    >
                      <option value="">Seçiniz...</option>
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">CADDE/SOKAK *</label>
                    {!form.neighborhood ? (
                      <select
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-400 text-xs cursor-not-allowed"
                      >
                        <option>— Önce mahalle —</option>
                      </select>
                    ) : (
                      <select
                        required
                        value={form.street}
                        onChange={(e) => setForm({ ...form, street: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                      >
                        <option value="">Seçiniz...</option>
                        {getStreetsByNeighborhood(form.neighborhood).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Diğer Cadde veya Bina No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.street === 'Diğer' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">Özel Cadde/Sokak</label>
                      <input
                        type="text"
                        required
                        value={form.customStreet}
                        onChange={(e) => setForm({ ...form, customStreet: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Cadde / Sokak adı yazın..."
                      />
                    </div>
                  ) : null}

                  <div className={form.street === 'Diğer' ? '' : 'sm:col-span-2'}>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                      Bina / Kapı / Daire No (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={form.buildingNo}
                      onChange={(e) => setForm({ ...form, buildingNo: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                      placeholder="Örn: No:14 Kat:2 D:5"
                    />
                  </div>
                </div>
              </div>

              {/* 3. ESNAF HESABI & E-POSTA BAĞLANTISI */}
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-700 font-bold text-[11px] uppercase tracking-wider">
                    <UserPlus size={14} />
                    Esnaf Hesabı & E-Posta Bağlantısı
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, accountMode: 'new' })}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        form.accountMode === 'new'
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Plus size={12} />
                      Yeni Hesap
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, accountMode: 'existing' })}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        form.accountMode === 'existing'
                          ? 'bg-teal-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Link2 size={12} />
                      Kayıtlı Maili Bağla
                    </button>
                  </div>
                </div>

                {form.accountMode === 'existing' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                        Sistemde Kayıtlı Esnaf Maili Seçin *
                      </label>
                      <select
                        required
                        value={form.selectedExistingEmail}
                        onChange={(e) => setForm({ ...form, selectedExistingEmail: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                      >
                        <option value="">Kayıtlı esnaflardan seçiniz...</option>
                        {users
                          .filter((u) => u.role === 'MERCHANT' && u.email)
                          .map((u) => (
                            <option key={u.id} value={u.email!}>
                              {u.displayName} ({u.email})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                        Şifre Güncelle (İsteğe Bağlı)
                      </label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">Giriş E-Posta *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                        placeholder="esnaf@isletme.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">Telefon No</label>
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                        placeholder="0530 000 00 00"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">Esnaf Şifre *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create'}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold py-3 rounded-xl text-xs shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'create' ? 'Kaydediliyor...' : 'Esnafı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── YENİ ŞUBE / DÜKKAN EKLEME MODALI ─── */}
      {showAddBranchModal && selectedMerchantForBranch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-sky-100 shadow-2xl relative overflow-hidden my-8">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <GitBranch size={20} className="text-sky-600" />
                  Yeni Şube / Dükkan Ekle
                </h2>
                <p className="text-xs text-sky-600 font-medium mt-0.5">
                  <strong>{selectedMerchantForBranch.businessName}</strong> için yeni şube adresi tanımlayın
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddBranchModal(false);
                  setSelectedMerchantForBranch(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs">
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                    Şube Başlığı / Tanımı *
                  </label>
                  <input
                    type="text"
                    required
                    value={branchForm.title}
                    onChange={(e) => setBranchForm({ ...branchForm, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Örn: Ganita Şubesi, Boztepe Şubesi, KTÜ Şubesi"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                    Şube Simgesi / Emojisi
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {['📍', '⭐', '🏢', '☕', '📚', '🛒', '🛍️', '💻'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setBranchForm({ ...branchForm, symbol: emoji })}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                          branchForm.symbol === emoji
                            ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300'
                            : 'bg-white border border-slate-200 hover:bg-sky-50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adres Seçimi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">MAHALLE *</label>
                    <select
                      required
                      value={branchForm.neighborhood}
                      onChange={(e) => {
                        setBranchForm({ ...branchForm, neighborhood: e.target.value, street: '', customStreet: '' });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                    >
                      <option value="">Seçiniz...</option>
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">CADDE/SOKAK *</label>
                    {!branchForm.neighborhood ? (
                      <select
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-400 text-xs cursor-not-allowed"
                      >
                        <option>— Önce mahalle —</option>
                      </select>
                    ) : (
                      <select
                        required
                        value={branchForm.street}
                        onChange={(e) => setBranchForm({ ...branchForm, street: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                      >
                        <option value="">Seçiniz...</option>
                        {getStreetsByNeighborhood(branchForm.neighborhood).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {branchForm.street === 'Diğer' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">Özel Cadde/Sokak</label>
                      <input
                        type="text"
                        required
                        value={branchForm.customStreet}
                        onChange={(e) => setBranchForm({ ...branchForm, customStreet: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Cadde / Sokak adı yazın..."
                      />
                    </div>
                  ) : null}

                  <div className={branchForm.street === 'Diğer' ? '' : 'sm:col-span-2'}>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-widest">
                      Bina / Kapı No (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={branchForm.buildingNo}
                      onChange={(e) => setBranchForm({ ...branchForm, buildingNo: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 font-medium"
                      placeholder="Örn: No:8 Kat:1"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBranchModal(false);
                    setSelectedMerchantForBranch(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create-branch'}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold py-3 rounded-xl text-xs shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'create-branch' ? 'Ekleniyor...' : 'Şubeyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
