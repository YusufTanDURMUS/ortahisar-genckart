'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Tip Tanımlamaları ───
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

const API_BASE = 'http://localhost:3000/api/v1';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'merchants'>('requests');
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [requests, setRequests] = useState<DiscountRequestItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Yeni Esnaf Form State'leri
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    category: '',
    address: '',
    taxNumber: '',
    defaultDiscountRate: '15',
    email: '',
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
      const [mRes, rRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/admin/merchants`, { headers }),
        fetch(`${API_BASE}/admin/discount-requests`, { headers }),
        fetch(`${API_BASE}/admin/stats`, { headers })
      ]);

      // Eğer 401/403 gelirse login'e yönlendir
      if (mRes.status === 401 || mRes.status === 403) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      const [mData, rData, sData] = await Promise.all([
        mRes.json(),
        rRes.json(),
        sRes.json()
      ]);

      if (mData.status === 'SUCCESS') setMerchants(mData.data);
      if (rData.status === 'SUCCESS') setRequests(rData.data);
      if (sData.status === 'SUCCESS') setStats(sData.data);
    } catch (err) {
      console.error('Veri çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── İndirim Talebini Onayla/Reddet ───
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

  // ─── Yeni Esnaf Oluştur ───
  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return;

    setActionLoading('create');
    try {
      const res = await fetch(`${API_BASE}/admin/merchants`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        setShowAddModal(false);
        setForm({
          businessName: '', category: '', address: '', taxNumber: '',
          defaultDiscountRate: '15', email: '', password: ''
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

  // ─── Esnaf Sil ───
  const handleDeleteMerchant = async (merchantId: string, businessName: string) => {
    if (!confirm(`"${businessName}" işletmesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setActionLoading(merchantId);
    try {
      const res = await fetch(`${API_BASE}/admin/merchants/${merchantId}`, {
        method: 'DELETE',
        headers
      });

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

  // ─── Çıkış ───
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'user_role=; Max-Age=0; path=/';
    window.location.href = '/admin/login';
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 mb-4 shadow-sm">
            <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-slate-600 text-sm font-medium">Yönetim Paneli Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* ════════════════════════════════════════════ */}
      {/* ÜST NAVBAR                                  */}
      {/* ════════════════════════════════════════════ */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200 animate-slide-down">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center text-sky-600 shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Ortahisar Belediyesi — Genç Kart Yönetim Paneli
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Belediye Yetkili Kontrol Merkezi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-semibold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Aktif
          </span>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-medium transition-all border border-slate-200 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıkış
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════ */}
      {/* ANA İÇERİK                                  */}
      {/* ════════════════════════════════════════════ */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">

        {/* ─── İstatistik Özet Kartları ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Aktif Esnaf */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100">
                <svg className="w-4.5 h-4.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
                İŞLETME
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalMerchants ?? merchants.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Aktif Anlaşmalı Esnaf</p>
          </div>

          {/* Bekleyen Talepler */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <svg className="w-4.5 h-4.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {(stats?.pendingRequests ?? requests.length) > 0 && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
                  BEKLEYEN
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.pendingRequests ?? requests.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Onay Bekleyen İndirim Talebi</p>
          </div>

          {/* Toplam İşlem */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalTransactions ?? 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Toplam QR İşlemi</p>
          </div>

          {/* Toplam Tasarruf */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '240ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                <svg className="w-4.5 h-4.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              ₺{(stats?.totalSaved ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Öğrencilere Toplam Tasarruf</p>
          </div>
        </div>

        {/* ─── Sekmeler ve İşlem Butonları ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-200 gap-3">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              id="tab-requests"
              onClick={() => setActiveTab('requests')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'requests'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Oran Talepleri ({requests.length})
              </span>
            </button>
            <button
              id="tab-merchants"
              onClick={() => setActiveTab('merchants')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'merchants'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                İşletmeler ({merchants.length})
              </span>
            </button>
          </div>

          {activeTab === 'merchants' && (
            <button
              id="add-merchant-btn"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-600/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Esnaf Ekle
            </button>
          )}
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* TAB 1: ORAN DEĞİŞİKLİK TALEPLERİ          */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-fade-in">
            {requests.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-2xl border border-slate-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 mb-4">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-600 text-sm font-medium">Bekleyen oran güncelleme talebi bulunmuyor.</p>
                <p className="text-slate-500 text-xs mt-1">Esnaflar yeni bir oran talebi gönderdiğinde burada görünecektir.</p>
              </div>
            ) : (
              requests.map((req, index) => (
                <div
                  key={req.id}
                  className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 animate-slide-up shadow-sm"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{req.merchant.businessName}</h3>
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        BEKLEMEDE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Kategori: <span className="text-slate-700 font-medium">{req.merchant.category}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      Tarih: <span className="text-slate-700 font-medium">{new Date(req.createdAt).toLocaleDateString('tr-TR')}</span>
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 text-xs font-medium border border-slate-200">
                        Mevcut: <span className="font-bold">%{req.currentRate}</span>
                      </span>
                      <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="bg-sky-50 border border-sky-200 text-sky-700 px-3 py-1.5 rounded-lg font-bold text-xs">
                        Talep: %{req.requestedRate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      id={`approve-${req.id}`}
                      onClick={() => handleReviewRequest(req.id, 'APPROVED')}
                      disabled={actionLoading === req.id}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 text-emerald-600 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Onayla
                    </button>
                    <button
                      id={`reject-${req.id}`}
                      onClick={() => handleReviewRequest(req.id, 'REJECTED')}
                      disabled={actionLoading === req.id}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-600 border border-red-200 text-red-600 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Reddet
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB 2: ESNAF LİSTESİ                       */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === 'merchants' && (
          <div className="animate-fade-in">
            {merchants.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-2xl border border-slate-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 mb-4 shadow-sm">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                </div>
                <p className="text-slate-600 text-sm font-medium">Henüz kayıtlı esnaf bulunmuyor.</p>
                <p className="text-slate-500 text-xs mt-1">&quot;Yeni Esnaf Ekle&quot; butonuyla sisteme işletme tanımlayabilirsiniz.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {merchants.map((m, index) => (
                  <div
                    key={m.id}
                    className="glass-card rounded-2xl p-5 border border-slate-200 flex flex-col justify-between animate-slide-up shadow-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-base font-bold text-slate-900 leading-tight pr-2">{m.businessName}</h3>
                        <span className="flex-shrink-0 bg-sky-50 text-sky-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-sky-200">
                          %{m.defaultDiscountRate}
                        </span>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <p className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {m.category}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {m.address || 'Adres belirtilmemiş'}
                        </p>
                        {m.user?.email && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {m.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          VKN: {m.taxNumber || '—'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      </div>
                      <button
                        id={`delete-merchant-${m.id}`}
                        onClick={() => handleDeleteMerchant(m.id, m.businessName)}
                        disabled={actionLoading === m.id}
                        className="text-[10px] text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════ */}
      {/* YENİ ESNAF EKLEME MODALI                    */}
      {/* ════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-7 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Sisteme Yeni Esnaf Tanımla</h2>
                <p className="text-xs text-slate-500 mt-1">Anlaşmalı işletme bilgilerini girin</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateMerchant} className="space-y-4">
              {/* İşletme Adı */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  İşletme Adı *
                </label>
                <input
                  id="merchant-name"
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Örn: Akbuz Kitabevi"
                />
              </div>

              {/* Kategori + İndirim */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Kategori *
                  </label>
                  <input
                    id="merchant-category"
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="Örn: Kırtasiye"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                    İndirim Oranı (%)
                  </label>
                  <input
                    id="merchant-rate"
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={form.defaultDiscountRate}
                    onChange={(e) => setForm({ ...form, defaultDiscountRate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Adres */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Adres
                </label>
                <input
                  id="merchant-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Örn: Kalkınma Mah. No:12 Ortahisar/Trabzon"
                />
              </div>

              {/* Vergi No + E-posta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Vergi No
                  </label>
                  <input
                    id="merchant-tax"
                    type="text"
                    value={form.taxNumber}
                    onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="6100000001"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Giriş E-Posta *
                  </label>
                  <input
                    id="merchant-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="esnaf@isletme.com"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Esnaf Şifre *
                </label>
                <input
                  id="merchant-password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              {/* Butonlar */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-semibold py-3 rounded-xl text-sm transition-all border border-slate-200"
                >
                  İptal
                </button>
                <button
                  id="submit-merchant-btn"
                  type="submit"
                  disabled={actionLoading === 'create'}
                  className={`flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 ${
                    actionLoading === 'create' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {actionLoading === 'create' ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    'Esnafı Kaydet'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] text-slate-500">
          <span>© 2026 Ortahisar Belediyesi — Genç Kart Yönetim Sistemi v1.0</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Tüm Sistemler Çalışıyor
          </span>
        </div>
      </footer>
    </div>
  );
}
