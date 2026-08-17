'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Users, Clock, CheckCircle2, CircleDollarSign, Plus, List, Store, AlertCircle, X, Trash2, Check, XCircle, MapPin, Building2, UserPlus, Link2 } from 'lucide-react';
import Image from 'next/image';
import { NEIGHBORHOODS, getStreetsByNeighborhood } from '@/lib/ortahisarAddress';

interface MerchantItem {
  id: string;
  businessName: string;
  category: string;
  address: string | null;
  taxNumber: string | null;
  defaultDiscountRate: number;
  qrCodeIdentifier: string;
  createdAt: string;
  user?: { id: string; email: string; phoneNumber: string | null; createdAt: string };
}

interface DiscountRequestItem {
  id: string;
  merchantId: string;
  currentRate: number;
  requestedRate: number;
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
  role: 'STUDENT' | 'MERCHANT' | 'ADMIN';
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
  const [activeTab, setActiveTab] = useState<'requests' | 'merchants' | 'users'>('requests');
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [requests, setRequests] = useState<DiscountRequestItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'STUDENT' | 'MERCHANT' | 'ADMIN'>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    category: 'Kırtasiye',
    neighborhood: '',
    street: '',
    customStreet: '',
    buildingNo: '',
    taxNumber: '',
    defaultDiscountRate: '15',
    accountMode: 'new' as 'new' | 'existing',
    selectedExistingEmail: '',
    email: '',
    phoneNumber: '',
    password: ''
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
  }, [router]);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const [mRes, rRes, sRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/admin/merchants`, { headers }),
        fetch(`${API_BASE}/admin/discount-requests`, { headers }),
        fetch(`${API_BASE}/admin/stats`, { headers }),
        fetch(`${API_BASE}/admin/users`, { headers })
      ]);

      if (mRes.status === 401 || mRes.status === 403) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      const [mData, rData, sData, uData] = await Promise.all([
        mRes.json(),
        rRes.json(),
        sRes.json(),
        uRes.json()
      ]);

      if (mData.status === 'SUCCESS') setMerchants(mData.data);
      if (rData.status === 'SUCCESS') setRequests(rData.data);
      if (sData.status === 'SUCCESS') setStats(sData.data);
      if (uData.status === 'SUCCESS') setUsers(uData.data);
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

  const handleDeleteMerchant = async (merchantId: string, businessName: string) => {
    if (!confirm(`"${businessName}" işletmesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    setActionLoading(merchantId);
    try {
      const res = await fetch(`${API_BASE}/admin/merchants/${merchantId}`, { method: 'DELETE', headers });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Silme işlemi başarısız.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'user_role=; Max-Age=0; path=/';
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d13] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0e1720] border border-cyan-500/30 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="animate-pulse h-6 w-6 text-cyan-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Yönetim Paneli Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d13] text-slate-200 font-sans relative overflow-x-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* ── NAVBAR (Image 2 Style) ── */}
      <header className="bg-[#0b131c]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-6 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-1 bg-cyan-400/30 rounded-full blur-sm" />
              <div className="relative w-12 h-12 rounded-full bg-white p-0.5 border border-cyan-400/80 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.3)]">
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
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Ortahisar Belediyesi
              </h1>
              <p className="text-[11px] text-cyan-400 font-medium">
                Akıllı Şehir Yönetim Portalı
              </p>
            </div>
          </div>

          {/* Right Action Badges & Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveTab('merchants'); setShowAddModal(true); }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-xs font-bold transition-all"
            >
              <Plus size={14} />
              Sistem Aktif
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0e1720] hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all border border-white/5 hover:border-red-500/20"
            >
              <LogOut size={14} />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 relative z-10">

        {/* ─── 4 Stat Cards (Image 2 Style) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Aktif Anlaşmalı Esnaf */}
          <div className="bg-[#0e1720]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-cyan-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Store size={20} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white mb-1">{stats?.totalMerchants ?? merchants.length}</p>
              <p className="text-xs text-slate-400 font-medium">Aktif Anlaşmalı Esnaf</p>
            </div>
          </div>

          {/* Card 2: Onay Bekleyen Talep */}
          <div className="bg-[#0e1720]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-amber-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white mb-1">{stats?.pendingRequests ?? requests.length}</p>
              <p className="text-xs text-slate-400 font-medium">Onay Bekleyen İşlem/Talep</p>
            </div>
          </div>

          {/* Card 3: Toplam QR İşlemi */}
          <div className="bg-[#0e1720]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white mb-1">{stats?.totalTransactions ?? 0}</p>
              <p className="text-xs text-slate-400 font-medium">Toplam QR İşlemi</p>
            </div>
          </div>

          {/* Card 4: Toplam Tasarruf */}
          <div className="bg-[#0e1720]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-purple-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <CircleDollarSign size={20} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white mb-1">
                ₺{(stats?.totalSaved ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-400 font-medium">Öğrencilere Toplam Tasarruf</p>
            </div>
          </div>
        </div>

        {/* ─── Tabs & Add Button ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap gap-2 bg-[#0a121a] p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'requests'
                  ? 'bg-[#152230] text-cyan-400 shadow-md border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List size={15} />
              Oran Talepleri ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('merchants')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'merchants'
                  ? 'bg-[#152230] text-cyan-400 shadow-md border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store size={15} />
              İşletmeler ({merchants.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'users'
                  ? 'bg-[#152230] text-cyan-400 shadow-md border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users size={15} />
              Kullanıcılar ({users.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#060d13] font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)]"
          >
            <Plus size={16} />
            Yeni Esnaf Ekle
          </button>
        </div>

        {/* ─── TAB 1: ORAN TALEPLERİ ─── */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-20 bg-[#0e1720]/60 rounded-3xl border border-white/5 backdrop-blur-md">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0a151f] border border-white/5 mb-3 text-slate-600">
                  <AlertCircle size={26} />
                </div>
                <p className="text-slate-300 font-semibold text-sm">Bekleyen oran güncelleme talebi bulunmuyor.</p>
                <p className="text-slate-500 text-xs mt-1">Esnaflar yeni bir indirim oranı talep ettiğinde burada listelenir.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#0e1720]/80 backdrop-blur-md rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5 hover:border-cyan-500/20 transition-all shadow-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-base font-bold text-white">{req.merchant.businessName}</h3>
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        BEKLEMEDE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Kategori: <span className="text-slate-200">{req.merchant.category}</span>
                      <span className="mx-2 text-slate-600">•</span>
                      Tarih: <span className="text-slate-200">{new Date(req.createdAt).toLocaleDateString('tr-TR')}</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="bg-[#070d14] px-3 py-1.5 rounded-lg text-slate-400 border border-white/5">
                        Mevcut: <span className="text-white">%{req.currentRate}</span>
                      </span>
                      <span className="text-cyan-400">➜</span>
                      <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg">
                        Talep Edilen: %{req.requestedRate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                      onClick={() => handleReviewRequest(req.id, 'APPROVED')}
                      disabled={actionLoading === req.id}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                    >
                      <Check size={16} />
                      Onayla
                    </button>
                    <button
                      onClick={() => handleReviewRequest(req.id, 'REJECTED')}
                      disabled={actionLoading === req.id}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                    >
                      <XCircle size={16} />
                      Reddet
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 2: ESNAF LİSTESİ (Image 2 Style) ─── */}
        {activeTab === 'merchants' && (
          <div className="space-y-3">
            {merchants.length === 0 ? (
              <div className="text-center py-20 bg-[#0e1720]/60 rounded-3xl border border-white/5 backdrop-blur-md">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0a151f] border border-white/5 mb-3 text-slate-600">
                  <Store size={26} />
                </div>
                <p className="text-slate-300 font-semibold text-sm">Henüz kayıtlı esnaf bulunmuyor.</p>
                <p className="text-slate-500 text-xs mt-1">&quot;Yeni Esnaf Ekle&quot; butonuyla sisteme işletme tanımlayabilirsiniz.</p>
              </div>
            ) : (
              merchants.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#0e1720]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-base font-bold text-white truncate">{m.businessName}</h3>
                      <span className="flex-shrink-0 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                        Aktif
                      </span>
                      <span className="flex-shrink-0 bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                        %{m.defaultDiscountRate} İndirim
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-500">📍</span>
                        <span className="truncate max-w-xs">{m.address || 'Trabzon Merkez'}</span>
                      </span>
                      {m.user?.email && (
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-500">✉️</span>
                          <span className="truncate">{m.user.email}</span>
                        </span>
                      )}
                      <span className="text-slate-500">
                        VKN: {m.taxNumber || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDeleteMerchant(m.id, m.businessName)}
                      disabled={actionLoading === m.id}
                      className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all border border-red-500/20 flex items-center justify-center opacity-80 hover:opacity-100"
                      title="İşletmeyi Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 3: TÜM KULLANICILAR (Image/Dashboard Style) ─── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0e1720]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-lg">
              {/* Search input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="İsim, TC No, Telefon veya E-posta ile ara..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-[#070d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center gap-1.5 bg-[#070d14] p-1 rounded-xl border border-white/5 self-start sm:self-auto overflow-x-auto">
                {(['ALL', 'STUDENT', 'MERCHANT', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      userRoleFilter === r
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r === 'ALL' ? 'Tümü' : r === 'STUDENT' ? 'Öğrenciler' : r === 'MERCHANT' ? 'Esnaflar' : 'Admin'}
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
                  className="bg-[#0e1720]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <h3 className="text-base font-extrabold text-white">{u.displayName}</h3>
                      
                      {/* Role Badge */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                          u.role === 'STUDENT'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : u.role === 'MERCHANT'
                            ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}
                      >
                        {u.role === 'STUDENT' ? 'ÖĞRENCİ' : u.role === 'MERCHANT' ? 'ESNAF' : 'ADMİN'}
                      </span>

                      {/* Student Eligibility or Discount Badge */}
                      {u.role === 'STUDENT' && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                            u.isEligible
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {u.isEligible ? 'Aktif Genç Kart' : 'Pasif / Şart Sağlamıyor'}
                        </span>
                      )}

                      {u.role === 'MERCHANT' && u.discountRate && (
                        <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-cyan-500/20">
                          %{u.discountRate} İndirim
                        </span>
                      )}
                    </div>

                    {/* Metadata details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-2">
                      {/* TC Kimlik No */}
                      {u.tcKn && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-mono text-[11px]">TC:</span>
                          <span className="text-slate-200 font-mono font-semibold">{u.tcKn}</span>
                        </div>
                      )}

                      {/* Telefon */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">📞</span>
                        <span className="text-slate-200 font-mono">{u.phoneNumber || 'Belirtilmedi'}</span>
                      </div>

                      {/* E-Posta */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">✉️</span>
                        <span className="text-slate-200 truncate">{u.email || '—'}</span>
                      </div>

                      {/* Ek Bilgi (Okul/Kategori/İlçe) */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">{u.role === 'STUDENT' ? '🎓' : '🏷️'}</span>
                        <span className="text-slate-300 truncate">
                          {u.schoolName || u.category || u.district || 'Ortahisar'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono self-end lg:self-center">
                    Kayıt: {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* ─── YENİ ESNAF EKLEME MODALI ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#060d13]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0e1720] rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden my-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <Building2 size={20} className="text-cyan-400" />
                  Yeni Esnaf Tanımla
                </h2>
                <p className="text-xs text-cyan-400/80 mt-0.5">Sisteme anlaşmalı işletme ve şube adresi tanımlayın</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-[#070d14] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-4 text-xs">
              {/* 1. İŞLETME BİLGİLERİ */}
              <div className="space-y-3 bg-[#070d14]/60 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                  <Store size={14} />
                  İşletme Bilgileri
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                      İşletme Adı (Yeni) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                      placeholder="Örn: Boztepe Kitabevi & Kafe"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                      Kategori *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                      İndirim Oranı (%) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={form.defaultDiscountRate}
                      onChange={(e) => setForm({ ...form, defaultDiscountRate: e.target.value })}
                      className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                      Vergi Kimlik No (VKN)
                    </label>
                    <input
                      type="text"
                      value={form.taxNumber}
                      onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                      className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                      placeholder="6100000001"
                    />
                  </div>
                </div>
              </div>

              {/* 2. ADRES SEÇİMİ (Image Style) */}
              <div className="space-y-3 bg-[#070d14]/60 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                  <MapPin size={14} />
                  Adres Bilgileri
                </div>

                {/* İl / İlçe */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">İL</label>
                    <input
                      type="text"
                      value="Trabzon"
                      disabled
                      className="w-full bg-[#0a121a] border border-white/5 rounded-xl p-2.5 text-slate-400 text-xs font-semibold cursor-not-allowed select-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">İLÇE</label>
                    <input
                      type="text"
                      value="Ortahisar"
                      disabled
                      className="w-full bg-[#0a121a] border border-white/5 rounded-xl p-2.5 text-slate-400 text-xs font-semibold cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                {/* Mahalle / Cadde-Sokak */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">MAHALLE *</label>
                    <select
                      required
                      value={form.neighborhood}
                      onChange={(e) => {
                        setForm({ ...form, neighborhood: e.target.value, street: '', customStreet: '' });
                      }}
                      className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
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
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">CADDE/SOKAK *</label>
                    {!form.neighborhood ? (
                      <select
                        disabled
                        className="w-full bg-[#0a121a] border border-white/5 rounded-xl p-2.5 text-slate-600 text-xs cursor-not-allowed"
                      >
                        <option>— Önce mahalle —</option>
                      </select>
                    ) : (
                      <select
                        required
                        value={form.street}
                        onChange={(e) => setForm({ ...form, street: e.target.value })}
                        className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
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
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Özel Cadde/Sokak</label>
                      <input
                        type="text"
                        required
                        value={form.customStreet}
                        onChange={(e) => setForm({ ...form, customStreet: e.target.value })}
                        className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                        placeholder="Cadde / Sokak adı yazın..."
                      />
                    </div>
                  ) : null}

                  <div className={form.street === 'Diğer' ? '' : 'sm:col-span-2'}>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                      Bina / Kapı / Daire No (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={form.buildingNo}
                      onChange={(e) => setForm({ ...form, buildingNo: e.target.value })}
                      className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                      placeholder="Örn: No:14 Kat:2 D:5"
                    />
                  </div>
                </div>
              </div>

              {/* 3. ESNAF HESABI & E-POSTA BAĞLANTISI */}
              <div className="space-y-3 bg-[#070d14]/60 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                    <UserPlus size={14} />
                    Esnaf Hesabı & E-Posta Bağlantısı
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex gap-1 bg-[#0a121a] p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, accountMode: 'new' })}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        form.accountMode === 'new'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white'
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
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'text-slate-400 hover:text-white'
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
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                        Sistemde Kayıtlı Esnaf Maili Seçin *
                      </label>
                      <select
                        required
                        value={form.selectedExistingEmail}
                        onChange={(e) => setForm({ ...form, selectedExistingEmail: e.target.value })}
                        className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all"
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
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                        Şifre Güncelle (İsteğe Bağlı)
                      </label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Giriş E-Posta *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                        placeholder="esnaf@isletme.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Telefon No</label>
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                        placeholder="0530 000 00 00"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Esnaf Şifre *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-[#0a121a] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
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
                  className="flex-1 bg-[#0a121a] hover:bg-white/10 text-slate-300 font-bold py-3 rounded-xl text-xs transition-all border border-white/5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create'}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#060d13] font-extrabold py-3 rounded-xl text-xs shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'create' ? 'Kaydediliyor...' : 'Esnafı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
