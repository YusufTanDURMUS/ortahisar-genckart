'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';
import { CheckCircle2, XCircle, RefreshCw, Receipt, Store, LogOut } from 'lucide-react';
import { NEIGHBORHOODS, getStreetsByNeighborhood } from '@/lib/ortahisarAddress';

export default function EsnafPWADashboard() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedQR, setLastScannedQR] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<'connected' | 'idle'>('connected');

  // Talep State'leri
  // Talep State'leri
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingReq, setLoadingReq] = useState(false);

  // Şube State'leri
  const [activeBranch, setActiveBranch] = useState<any | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);

  // Yeni Form State
  const [reqType, setReqType] = useState('DISCOUNT_UPDATE');
  const [reqForm, setReqForm] = useState({
    requestedDiscountRate: '15',
    categoryDiscounts: [] as { categoryName: string, rate: string }[],
    targetLocationId: '',
    targetLocationTitle: '',
    city: 'Trabzon',
    district: 'Ortahisar',
    neighborhood: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
    fullAddress: '',
    customStreet: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('merchant_token');
    if (!token) {
      router.push('/esnaf/login');
      return;
    }
    
    // Talepleri ve Lokasyonları getir
    Promise.all([
      fetch('http://localhost:3000/api/v1/merchant/requests', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://localhost:3000/api/v1/merchant/locations', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([reqData, locData]) => {
      if (reqData.status === 'SUCCESS') setRequests(reqData.data);
      if (locData.status === 'SUCCESS') {
        setLocations(locData.data);
        // Varsayılan olarak merkez şubeyi seç
        const mainBranch = locData.data.find((l: any) => l.isMain) || locData.data[0] || null;
        setActiveBranch(mainBranch);
      }
    }).catch(console.error);
  }, [router]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReq(true);
    try {
      const token = localStorage.getItem('merchant_token');
      
      const payload: any = { type: reqType };
      
      if (reqType === 'DISCOUNT_UPDATE') {
        payload.requestedDiscountRate = Number(reqForm.requestedDiscountRate);
        payload.categoryDiscounts = reqForm.categoryDiscounts;
      } else if (reqType === 'LOCATION_UPDATE') {
        payload.targetLocationId = reqForm.targetLocationId;
        payload.city = reqForm.city;
        payload.district = reqForm.district;
        payload.neighborhood = reqForm.neighborhood;
        payload.street = reqForm.street === 'Diğer' ? reqForm.customStreet : reqForm.street;
        payload.buildingNo = reqForm.buildingNo;
        payload.apartmentNo = reqForm.apartmentNo;
        payload.fullAddress = reqForm.fullAddress || `${reqForm.neighborhood} Mah. ${payload.street} No:${reqForm.buildingNo} ${reqForm.apartmentNo ? `Daire:${reqForm.apartmentNo}` : ''} ${reqForm.district}/${reqForm.city}`;
      } else if (reqType === 'NEW_LOCATION') {
        payload.targetLocationTitle = reqForm.targetLocationTitle;
        payload.city = reqForm.city;
        payload.district = reqForm.district;
        payload.neighborhood = reqForm.neighborhood;
        payload.street = reqForm.street === 'Diğer' ? reqForm.customStreet : reqForm.street;
        payload.buildingNo = reqForm.buildingNo;
        payload.apartmentNo = reqForm.apartmentNo;
        payload.fullAddress = reqForm.fullAddress || `${reqForm.neighborhood} Mah. ${payload.street} No:${reqForm.buildingNo} ${reqForm.apartmentNo ? `Daire:${reqForm.apartmentNo}` : ''} ${reqForm.district}/${reqForm.city}`;
      }
      
      const res = await fetch('http://localhost:3000/api/v1/merchant/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        alert("Talep başarıyla oluşturuldu.");
        setShowRequestModal(false);
        setRequests([data.data, ...requests]);
      } else {
        alert(data.message || "Hata oluştu.");
      }
    } catch (e) {
      alert("Sunucuya ulaşılamadı.");
    } finally {
      setLoadingReq(false);
    }
  };

  // Tarayıcı Akışı Fonksiyonları
  const handleScanSuccess = async (qrData: string) => {
    if (loadingScan || qrData === lastScannedQR || !amount) return;
    
    setLoadingScan(true);
    setError(null);
    setLastScannedQR(qrData);

    try {
      const token = localStorage.getItem('merchant_token');
      
      const res = await fetch('http://localhost:3000/api/v1/discount/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrData: qrData,
          originalAmount: Number(amount),
          integrationType: 'PWA_SCAN',
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        setIsScanning(false);
        setResult(data.data);
      } else {
        setError(data.message || 'İndirim onaylanamadı. Geçersiz QR/Barkod.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoadingScan(false);
      setTimeout(() => setLastScannedQR(null), 3000);
    }
  };

  const handleCompleteTransaction = async () => {
    if (!result || !result.transactionId) return;
    setLoadingScan(true);
    try {
      const token = localStorage.getItem('merchant_token');
      const res = await fetch('http://localhost:3000/api/v1/discount/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId: result.transactionId }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        alert('İşlem başarıyla onaylandı ve kaydedildi.');
        resetScanner();
      } else {
        alert(data.message || 'İşlem tamamlanamadı.');
      }
    } catch (err) {
      alert('Sunucuya bağlanılamadı.');
    } finally {
      setLoadingScan(false);
    }
  };

  const startScanning = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Lütfen geçerli bir tutar girin.');
      return;
    }
    setError(null);
    setIsScanning(true);
  };

  const resetScanner = () => {
    setIsScanning(false);
    setAmount('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
            ← Ana Portal
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold text-white tracking-wide">
            🏪 Esnaf PWA Arayüzü
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Aktif Şube Göstergesi */}
          {activeBranch && (
            <button
              onClick={() => setShowBranchModal(true)}
              className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-sky-500/20 transition"
              title="Aktif Şubeyi Değiştir"
            >
              <Store size={13} />
              <span className="hidden sm:inline">{activeBranch.title}</span>
              <span className="sm:hidden">Şube</span>
            </button>
          )}
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            C# Windows Ajanı: Entegre
          </span>
          <button 
            onClick={() => {
              localStorage.removeItem('merchant_token');
              localStorage.removeItem('merchant_info');
              document.cookie = 'token=; Max-Age=0; path=/';
              document.cookie = 'user_role=; Max-Age=0; path=/';
              window.location.href = '/';
            }}
            className="p-2 ml-2 text-gray-400 hover:text-red-400 bg-gray-900/50 rounded-xl transition"
            title="Çıkış Yap"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick QR Generator Card */}
          <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 shadow-xl relative overflow-hidden flex flex-col justify-center">
            {result ? (
              <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  İNDİRİM ONAYLANDI
                </span>
                <h3 className="text-xl font-bold text-white mb-1">
                  {result.student.firstName} {result.student.lastName}
                </h3>
                <p className="text-xs text-emerald-300/80 mb-4">Ortahisar Genç Kart Doğrulandı</p>
                <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-3 space-y-2 mb-4 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Genel Tutar:</span>
                    <span className="text-slate-300 line-through font-medium">{result.financials.originalAmount} TL</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">İndirim Oranı:</span>
                    <span className="text-emerald-400 font-bold">{result.financials.discountRate}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">İndirim Tutarı:</span>
                    <span className="text-emerald-400 font-semibold">-{result.financials.savedAmount} TL</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                    <span className="text-white font-bold text-sm">Tahsil Edilecek:</span>
                    <span className="text-xl font-extrabold text-emerald-400">{result.financials.discountedAmount} TL</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mb-4">Onay Kodu: <span className="font-mono text-slate-300">{result.verificationCode}</span></p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCompleteTransaction}
                    disabled={loadingScan}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {loadingScan ? 'Onaylanıyor...' : 'Ödeme Alındı / İşlemi Tamamla'}
                  </button>
                  <button
                    onClick={resetScanner}
                    disabled={loadingScan}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                  >
                    İptal Et / İşlemden Vazgeç
                  </button>
                </div>
              </div>
            ) : isScanning ? (
              <div className="space-y-4 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1">Müşteri QR Kodunu Okutun</h3>
                  <p className="text-xs text-slate-400 mb-6">Fatura Tutarı: <span className="text-emerald-400 font-bold">{amount} TL</span></p>

                  {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs text-left">
                      <XCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className={loadingScan ? 'hidden' : 'block'}>
                    <QRScanner onScanSuccess={handleScanSuccess} />
                  </div>

                  {loadingScan && (
                    <div className="py-20 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-300 font-medium text-sm">İndirim Doğrulanıyor...</p>
                    </div>
                  )}

                  <button
                    onClick={() => setIsScanning(false)}
                    disabled={loadingScan}
                    className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                  >
                    İptal Et
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">QR Kod ile Ödeme Al</h3>
                    <p className="text-xs text-gray-400">Anlık İşlem</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs relative z-10">
                    <XCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={startScanning} className="space-y-6 relative z-10">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Ödeme Tutarı (TL)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-4 text-3xl font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 transition text-center"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₺</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!amount}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Store size={20} />
                    Kamerayı Aç ve Öğrenciyi Oku
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Windows Agent Status & Fast Actions */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                🖥️ Windows Esnaf Ajanı Durumu
              </h2>
              <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Ajan Türü:</span>
                  <span className="font-semibold text-white">C# .NET 8 WPF / Windows API</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">SendKeys Modu:</span>
                  <span className="font-semibold text-emerald-400">Otomatik Yazar Kasaya Aktif</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Port / Soket:</span>
                  <span className="font-mono text-indigo-400">localhost:8080 (Active)</span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Son Başarılı İşlemler</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/50 text-xs">
                  <div>
                    <p className="font-semibold text-white">QR Mobil Ödeme</p>
                    <p className="text-[10px] text-gray-500">10:42 • Müşteri #9421</p>
                  </div>
                  <span className="font-bold text-emerald-400">+ ₺ 120.00</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-900/50 text-xs">
                  <div>
                    <p className="font-semibold text-white">POS / Temassız Transfer</p>
                    <p className="text-[10px] text-gray-500">09:15 • Müşteri #8812</p>
                  </div>
                  <span className="font-bold text-emerald-400">+ ₺ 450.50</span>
                </div>
              </div>
            </div>

            {/* Talepler */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3 mt-6">
              <h3 className="text-sm font-bold text-white flex justify-between items-center">
                Yönetim Talepleri
                <button onClick={() => setShowRequestModal(true)} className="text-xs bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-sky-500/20">
                  Yeni Talep
                </button>
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {requests.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">Henüz oluşturulmuş bir talep yok.</p>
                ) : (
                  requests.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-900/50 text-xs border border-gray-800/50">
                      <div>
                        <p className="font-semibold text-white">
                          {r.type === 'DISCOUNT_UPDATE' ? 'İndirim Güncelleme' : r.type === 'LOCATION_UPDATE' ? 'Adres Güncelleme' : r.type === 'NEW_LOCATION' ? 'Yeni Şube/Konum' : r.type}
                        </p>
                        <p className="text-[10px] text-gray-500">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <span className={`font-bold px-2 py-1 rounded-md text-[10px] ${r.status === 'PENDING' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : r.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>
                        {r.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Yeni Talep Modalı */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl p-6 w-full max-w-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Yeni Talep Oluştur</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Talep Türü</label>
                <select 
                  value={reqType} 
                  onChange={e => setReqType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="DISCOUNT_UPDATE">İndirim Oranı Değişikliği</option>
                  <option value="LOCATION_UPDATE">Mevcut Adres Güncellemesi</option>
                  <option value="NEW_LOCATION">Yeni Şube / Konum Ekleme</option>
                </select>
              </div>

              {reqType === 'DISCOUNT_UPDATE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Yeni İndirim Oranı (%)</label>
                    <input 
                      type="number"
                      required
                      value={reqForm.requestedDiscountRate}
                      onChange={e => setReqForm({...reqForm, requestedDiscountRate: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-gray-400">Kategori İndirimleri (Opsiyonel)</label>
                      <button 
                        type="button" 
                        onClick={() => setReqForm({...reqForm, categoryDiscounts: [...reqForm.categoryDiscounts, { categoryName: '', rate: '' }]})}
                        className="text-[10px] bg-slate-800 text-sky-400 px-2 py-1 rounded"
                      >
                        + Kategori Ekle
                      </button>
                    </div>
                    {reqForm.categoryDiscounts.map((cat, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input 
                          type="text" placeholder="Kategori Adı" value={cat.categoryName}
                          onChange={e => {
                            const newCats = [...reqForm.categoryDiscounts];
                            newCats[idx].categoryName = e.target.value;
                            setReqForm({...reqForm, categoryDiscounts: newCats});
                          }}
                          className="flex-2 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs w-full"
                        />
                        <input 
                          type="number" placeholder="%" value={cat.rate}
                          onChange={e => {
                            const newCats = [...reqForm.categoryDiscounts];
                            newCats[idx].rate = e.target.value;
                            setReqForm({...reqForm, categoryDiscounts: newCats});
                          }}
                          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs w-20"
                        />
                        <button type="button" onClick={() => {
                          const newCats = reqForm.categoryDiscounts.filter((_, i) => i !== idx);
                          setReqForm({...reqForm, categoryDiscounts: newCats});
                        }} className="text-red-400 px-2">X</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(reqType === 'LOCATION_UPDATE' || reqType === 'NEW_LOCATION') && (
                <div className="space-y-3">
                  {reqType === 'LOCATION_UPDATE' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Şube Seçimi</label>
                      <select 
                        value={reqForm.targetLocationId} 
                        onChange={e => setReqForm({...reqForm, targetLocationId: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Merkez Şube / Ana Adres</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>[ID: {loc.id.substring(0,8)}] - {loc.title || 'Şube'}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {reqType === 'NEW_LOCATION' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Yeni Şube Adı</label>
                      <input 
                        type="text" required placeholder="Örn: Meydan Şubesi"
                        value={reqForm.targetLocationTitle}
                        onChange={e => setReqForm({...reqForm, targetLocationTitle: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">İl</label>
                      <input type="text" readOnly value={reqForm.city} className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-2 py-1.5 text-gray-400 text-xs cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">İlçe</label>
                      <input type="text" readOnly value={reqForm.district} className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-2 py-1.5 text-gray-400 text-xs cursor-not-allowed" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Mahalle</label>
                      <select 
                        value={reqForm.neighborhood} 
                        onChange={e => setReqForm({...reqForm, neighborhood: e.target.value, street: '', customStreet: ''})} 
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Seçiniz...</option>
                        {NEIGHBORHOODS.map(mah => (
                          <option key={mah} value={mah}>{mah}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">
                        Cadde/Sokak
                        {!reqForm.neighborhood && <span className="ml-1 text-orange-400">(önce mahalle seçin)</span>}
                      </label>
                      <select 
                        value={reqForm.street} 
                        onChange={e => setReqForm({...reqForm, street: e.target.value})} 
                        disabled={!reqForm.neighborhood}
                        className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-sky-500 transition-opacity ${
                          reqForm.neighborhood
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-900/40 border-gray-700/40 text-gray-600 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <option value="">{reqForm.neighborhood ? 'Seçiniz...' : '— Önce mahalle seçin —'}</option>
                        {reqForm.neighborhood && getStreetsByNeighborhood(reqForm.neighborhood).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {reqForm.street === 'Diğer' && (
                        <input 
                          type="text" 
                          placeholder="Cadde/Sokak adını giriniz..." 
                          value={reqForm.customStreet}
                          onChange={e => setReqForm({...reqForm, customStreet: e.target.value})}
                          className="w-full bg-gray-900 border border-sky-500/50 rounded-lg px-2 py-1.5 text-white text-xs mt-2 focus:outline-none focus:border-sky-400" 
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Dış Kapı / Bina No</label>
                      <select 
                        value={reqForm.buildingNo} 
                        onChange={e => setReqForm({...reqForm, buildingNo: e.target.value})} 
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Seçiniz...</option>
                        {Array.from({ length: 100 }, (_, i) => (i + 1).toString()).map(no => (
                          <option key={no} value={no}>{no}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">İç Kapı / Daire (Opsiyonel)</label>
                      <select 
                        value={reqForm.apartmentNo} 
                        onChange={e => setReqForm({...reqForm, apartmentNo: e.target.value})} 
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Yok / Boş Bırak</option>
                        {Array.from({ length: 50 }, (_, i) => (i + 1).toString()).map(no => (
                          <option key={no} value={no}>{no}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Tam Adres Metni (Opsiyonel)</label>
                    <textarea 
                      rows={2} placeholder="Sadece yukarıdaki alanlar yetmezse detay yazın..."
                      value={reqForm.fullAddress} onChange={e => setReqForm({...reqForm, fullAddress: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-2.5 rounded-xl text-gray-400 bg-gray-800 hover:bg-gray-700 text-sm font-semibold transition">İptal</button>
                <button type="submit" disabled={loadingReq} className="flex-1 py-2.5 rounded-xl text-white bg-sky-600 hover:bg-sky-500 text-sm font-semibold flex items-center justify-center transition">
                  {loadingReq ? 'Gönderiliyor...' : 'Talebi İlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Şube Seçici Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Store size={18} className="text-sky-400" /> Şube Seç
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">İşlem yapacağınız şubeyi seçin</p>
              </div>
              <button onClick={() => setShowBranchModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition">✕</button>
            </div>

            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {locations.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">Kayıtlı şube bulunamadı.</p>
              ) : (
                locations.map((loc: any) => (
                  <button
                    key={loc.id}
                    onClick={() => { setActiveBranch(loc); setShowBranchModal(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      activeBranch?.id === loc.id
                        ? 'bg-sky-500/15 border-sky-500/50 text-sky-300'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{loc.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{loc.address}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {loc.isMain && (
                          <span className="text-[10px] px-2 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full font-bold">Merkez</span>
                        )}
                        {activeBranch?.id === loc.id && (
                          <span className="text-sky-400 text-lg">✓</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => { setShowRequestModal(true); setShowBranchModal(false); }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition flex items-center justify-center gap-2"
              >
                + Yeni Şube Ekle / Güncelleme Talep Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
