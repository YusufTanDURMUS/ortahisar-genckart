'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';
import { CheckCircle2, XCircle, RefreshCw, Receipt, Store, LogOut, ArrowLeft, ShieldCheck, MapPin, X, Plus } from 'lucide-react';
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
      document.cookie = 'token=; Max-Age=0; path=/';
      document.cookie = 'user_role=; Max-Age=0; path=/';
      window.location.href = '/esnaf/login';
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
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] via-[#f0f9ff] to-[#ffffff] text-slate-800 font-sans flex flex-col relative overflow-x-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[140px] pointer-events-none" />

      {/* ── NAVBAR ── */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-teal-100 sticky top-0 z-30 px-6 py-3.5 shadow-sm flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative group flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-teal-400 flex items-center justify-center overflow-hidden shadow-md">
              <img
                src="/logo.png"
                alt="Ortahisar Belediyesi"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              TRABZON ORTAHİSAR BELEDİYESİ
            </h1>
            <p className="text-[11px] text-teal-600 font-bold tracking-wide uppercase">
              Esnaf QR & Satış Portalı
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {activeBranch && (
            <button
              onClick={() => setShowBranchModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100 transition-all shadow-sm"
              title="Aktif Şubeyi Değiştir"
            >
              <Store size={14} />
              <span className="hidden sm:inline">{activeBranch.title}</span>
              <span className="sm:hidden">Şube</span>
            </button>
          )}
          <span className="hidden sm:flex px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold tracking-wider items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SİSTEM AKTİF
          </span>
          <button 
            onClick={() => {
              localStorage.removeItem('merchant_token');
              localStorage.removeItem('merchant_info');
              document.cookie = 'token=; Max-Age=0; path=/';
              document.cookie = 'user_role=; Max-Age=0; path=/';
              window.location.href = '/';
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-200 shadow-sm"
            title="Çıkış Yap"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - QR Scanner */}
          <div className="lg:col-span-7">
            <div className="bg-[#0e1720]/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[400px]">
              
              {/* Decorative Background */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

              {result ? (
                <div className="relative z-10 bg-[#0a151f]/80 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 border border-emerald-500/30">
                    İNDİRİM ONAYLANDI
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mb-1">
                    {result.student.firstName} {result.student.lastName}
                  </h3>
                  <p className="text-sm text-emerald-400/80 mb-6 font-medium tracking-wide">Ortahisar Genç Kart Doğrulandı</p>
                  
                  <div className="bg-[#060b11] border border-white/5 shadow-inner rounded-xl p-4 sm:p-5 space-y-3 mb-6 text-left">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Genel Tutar:</span>
                      <span className="text-slate-300 line-through decoration-red-500/50 decoration-2 font-semibold">{result.financials.originalAmount} TL</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">İndirim Oranı:</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">% {result.financials.discountRate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">İndirim Tutarı:</span>
                      <span className="text-emerald-400 font-bold">-{result.financials.savedAmount} TL</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center">
                      <span className="text-white font-bold">Tahsil Edilecek:</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        {result.financials.discountedAmount} TL
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-slate-500 mb-6 font-medium">Onay Kodu: <span className="font-mono text-slate-300 bg-[#060b11] px-2 py-1 rounded border border-white/5">{result.verificationCode}</span></p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={resetScanner}
                      disabled={loadingScan}
                      className="flex-1 order-2 sm:order-1 bg-[#060b11] hover:bg-white/5 text-slate-300 font-bold py-3.5 rounded-xl transition-all border border-white/5 disabled:opacity-50"
                    >
                      İptal Et
                    </button>
                    <button
                      onClick={handleCompleteTransaction}
                      disabled={loadingScan}
                      className="flex-[2] order-1 sm:order-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} />
                      {loadingScan ? 'Onaylanıyor...' : 'Ödeme Alındı'}
                    </button>
                  </div>
                </div>
              ) : isScanning ? (
                <div className="space-y-4 text-center relative z-10 w-full max-w-md mx-auto">
                  <div className="bg-[#0a151f]/80 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                    <h3 className="text-xl font-bold text-white mb-2">Müşteri QR Kodunu Okutun</h3>
                    <p className="text-sm text-slate-400 mb-6">Fatura Tutarı: <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded ml-1">{amount} TL</span></p>

                    {error && (
                      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-3 text-red-400 text-xs sm:text-sm text-left">
                        <XCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className={loadingScan ? 'hidden' : 'block rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]'}>
                      <QRScanner onScanSuccess={handleScanSuccess} />
                    </div>

                    {loadingScan && (
                      <div className="py-24 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-emerald-400 font-bold tracking-wide">İndirim Doğrulanıyor...</p>
                      </div>
                    )}

                    <button
                      onClick={() => setIsScanning(false)}
                      disabled={loadingScan}
                      className="mt-6 w-full bg-[#060b11] hover:bg-white/5 border border-white/5 text-slate-300 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <Receipt size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-white">Hızlı Ödeme Al</h3>
                      <p className="text-sm text-slate-400 font-medium mt-1">Öğrenci indirimini anında uygulayın</p>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                      <XCircle size={20} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={startScanning} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                        Ödeme Tutarı (TL)
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-[#060b11] border border-white/5 rounded-2xl px-6 py-5 text-4xl sm:text-5xl font-black text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-center shadow-inner placeholder:text-slate-700"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-2xl group-focus-within:text-emerald-500/50 transition-colors">₺</span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!amount}
                      className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none text-white font-extrabold text-lg rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3"
                    >
                      <Store size={24} />
                      Kamerayı Aç ve QR Oku
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Status & Requests */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Windows Agent Status */}
            <div className="bg-[#0f1923]/60 backdrop-blur-lg p-6 rounded-3xl border border-white/5 shadow-lg">
              <h2 className="text-lg font-bold text-white flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <ShieldCheck size={18} />
                </div>
                Windows Ajan Durumu
              </h2>
              <div className="p-4 rounded-2xl bg-[#060b11] border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Ajan Türü</span>
                  <span className="font-bold text-white bg-white/5 px-2 py-1 rounded">WPF / WinAPI</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Kasa Entegrasyonu</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Aktif
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Bağlantı</span>
                  <span className="font-mono text-indigo-400 text-xs bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">localhost:8080</span>
                </div>
              </div>
            </div>

            {/* Talepler */}
            <div className="bg-[#0f1923]/60 backdrop-blur-lg p-6 rounded-3xl border border-white/5 shadow-lg flex-1 flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                    <Store size={18} />
                  </div>
                  Taleplerim
                </h3>
                <button 
                  onClick={() => setShowRequestModal(true)} 
                  className="text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Plus size={14} /> Yeni Talep
                </button>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#060b11] flex items-center justify-center mb-3 border border-white/5">
                      <ShieldCheck size={20} className="text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Henüz talep oluşturmadınız.</p>
                  </div>
                ) : (
                  requests.map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-[#060b11] border border-white/5 hover:border-white/10 transition-colors">
                      <div>
                        <p className="font-bold text-white text-sm">
                          {r.type === 'DISCOUNT_UPDATE' ? 'İndirim Güncelleme' : r.type === 'LOCATION_UPDATE' ? 'Adres Güncelleme' : r.type === 'NEW_LOCATION' ? 'Yeni Şube/Konum' : r.type}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <span className={`font-bold px-2.5 py-1 rounded-lg text-[10px] tracking-wide border ${
                        r.status === 'PENDING' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                        r.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                        'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
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
        <div className="fixed inset-0 z-50 bg-[#060d13]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1923] rounded-3xl p-6 sm:p-8 w-full max-w-xl border border-sky-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto relative custom-scrollbar">
            {/* Modal Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-white">Yeni Talep Oluştur</h3>
                <p className="text-sm text-sky-400 mt-1 font-medium">Yönetime iletilecek değişikliği seçin</p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="w-10 h-10 rounded-xl bg-[#060b11] flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Talep Türü</label>
                <select 
                  value={reqType} 
                  onChange={e => setReqType(e.target.value)}
                  className="w-full bg-[#060b11] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors appearance-none"
                >
                  <option value="DISCOUNT_UPDATE">İndirim Oranı Değişikliği</option>
                  <option value="LOCATION_UPDATE">Mevcut Adres Güncellemesi</option>
                  <option value="NEW_LOCATION">Yeni Şube / Konum Ekleme</option>
                </select>
              </div>

              {reqType === 'DISCOUNT_UPDATE' && (
                <div className="space-y-5 p-5 bg-[#060b11] rounded-2xl border border-white/5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Yeni İndirim Oranı (%)</label>
                    <input 
                      type="number" required min="1" max="100"
                      value={reqForm.requestedDiscountRate}
                      onChange={e => setReqForm({...reqForm, requestedDiscountRate: e.target.value})}
                      className="w-full bg-[#0f1923] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Kategori İndirimleri</label>
                      <button 
                        type="button" 
                        onClick={() => setReqForm({...reqForm, categoryDiscounts: [...reqForm.categoryDiscounts, { categoryName: '', rate: '' }]})}
                        className="text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-lg hover:bg-sky-500/20 transition-colors"
                      >
                        + Kategori Ekle
                      </button>
                    </div>
                    {reqForm.categoryDiscounts.map((cat, idx) => (
                      <div key={idx} className="flex gap-3 mb-3 items-center bg-[#0f1923] p-2 rounded-xl border border-white/5">
                        <input 
                          type="text" placeholder="Kategori Adı" value={cat.categoryName}
                          onChange={e => {
                            const newCats = [...reqForm.categoryDiscounts];
                            newCats[idx].categoryName = e.target.value;
                            setReqForm({...reqForm, categoryDiscounts: newCats});
                          }}
                          className="flex-2 bg-transparent border-none px-2 py-1 text-white text-xs w-full focus:outline-none"
                        />
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        <input 
                          type="number" placeholder="%" value={cat.rate}
                          onChange={e => {
                            const newCats = [...reqForm.categoryDiscounts];
                            newCats[idx].rate = e.target.value;
                            setReqForm({...reqForm, categoryDiscounts: newCats});
                          }}
                          className="flex-1 bg-transparent border-none px-2 py-1 text-white text-xs w-20 focus:outline-none text-center"
                        />
                        <button type="button" onClick={() => {
                          const newCats = reqForm.categoryDiscounts.filter((_, i) => i !== idx);
                          setReqForm({...reqForm, categoryDiscounts: newCats});
                        }} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {reqForm.categoryDiscounts.length === 0 && (
                      <p className="text-[11px] text-slate-500">Kategori bazlı farklı indirimleriniz varsa ekleyebilirsiniz.</p>
                    )}
                  </div>
                </div>
              )}

              {(reqType === 'LOCATION_UPDATE' || reqType === 'NEW_LOCATION') && (
                <div className="space-y-4 p-5 bg-[#060b11] rounded-2xl border border-white/5">
                  {reqType === 'LOCATION_UPDATE' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Şube Seçimi</label>
                      <select 
                        value={reqForm.targetLocationId} 
                        onChange={e => setReqForm({...reqForm, targetLocationId: e.target.value})}
                        className="w-full bg-[#0f1923] border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 appearance-none"
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
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Yeni Şube Adı</label>
                      <input 
                        type="text" required placeholder="Örn: Meydan Şubesi"
                        value={reqForm.targetLocationTitle}
                        onChange={e => setReqForm({...reqForm, targetLocationTitle: e.target.value})}
                        className="w-full bg-[#0f1923] border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 placeholder:text-slate-600"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">İl</label>
                      <input type="text" readOnly value={reqForm.city} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-slate-400 text-sm cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">İlçe</label>
                      <input type="text" readOnly value={reqForm.district} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-slate-400 text-sm cursor-not-allowed" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Mahalle</label>
                      <select 
                        value={reqForm.neighborhood} 
                        onChange={e => setReqForm({...reqForm, neighborhood: e.target.value, street: '', customStreet: ''})} 
                        className="w-full bg-[#0f1923] border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 appearance-none"
                      >
                        <option value="">Seçiniz...</option>
                        {NEIGHBORHOODS.map(mah => (
                          <option key={mah} value={mah}>{mah}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                        Cadde/Sokak
                      </label>
                      <select 
                        value={reqForm.street} 
                        onChange={e => setReqForm({...reqForm, street: e.target.value})} 
                        disabled={!reqForm.neighborhood}
                        className={`w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500/50 transition-all appearance-none ${
                          reqForm.neighborhood
                            ? 'bg-[#0f1923] border border-white/5 text-white'
                            : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <option value="">{reqForm.neighborhood ? 'Seçiniz...' : '— Önce mahalle —'}</option>
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
                          className="w-full bg-[#0f1923] border border-sky-500/30 rounded-xl px-3 py-2.5 text-white text-sm mt-2 focus:outline-none focus:border-sky-500/50 placeholder:text-slate-600" 
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Bina No</label>
                      <select 
                        value={reqForm.buildingNo} 
                        onChange={e => setReqForm({...reqForm, buildingNo: e.target.value})} 
                        className="w-full bg-[#0f1923] border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 appearance-none"
                      >
                        <option value="">Seçiniz...</option>
                        {Array.from({ length: 100 }, (_, i) => (i + 1).toString()).map(no => (
                          <option key={no} value={no}>{no}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">İç Kapı</label>
                      <select 
                        value={reqForm.apartmentNo} 
                        onChange={e => setReqForm({...reqForm, apartmentNo: e.target.value})} 
                        className="w-full bg-[#0f1923] border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 appearance-none"
                      >
                        <option value="">Yok / Boş</option>
                        {Array.from({ length: 50 }, (_, i) => (i + 1).toString()).map(no => (
                          <option key={no} value={no}>{no}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Tam Adres Metni</label>
                    <textarea 
                      rows={2} placeholder="Sadece yukarıdaki alanlar yetmezse detay yazın..."
                      value={reqForm.fullAddress} onChange={e => setReqForm({...reqForm, fullAddress: e.target.value})}
                      className="w-full bg-[#0f1923] border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 placeholder:text-slate-600 resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-4 rounded-xl text-slate-300 bg-[#060b11] hover:bg-white/5 text-sm font-bold transition-all border border-white/5">İptal</button>
                <button type="submit" disabled={loadingReq} className="flex-1 py-4 rounded-xl text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-sm font-bold flex items-center justify-center transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:opacity-50">
                  {loadingReq ? 'Gönderiliyor...' : 'Talebi İlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Şube Seçici Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 bg-[#060d13]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#0f1923] border border-white/10 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a151f]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Store size={18} className="text-sky-400" /> Şube Seç
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">İşlem yapacağınız şubeyi seçin</p>
              </div>
              <button onClick={() => setShowBranchModal(false)} className="w-8 h-8 rounded-xl bg-[#060b11] flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {locations.length === 0 ? (
                <p className="text-center text-slate-500 py-8 text-sm font-medium">Kayıtlı şube bulunamadı.</p>
              ) : (
                locations.map((loc: any) => (
                  <button
                    key={loc.id}
                    onClick={() => { setActiveBranch(loc); setShowBranchModal(false); }}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all ${
                      activeBranch?.id === loc.id
                        ? 'bg-sky-500/10 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                        : 'bg-[#060b11] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="pr-2">
                        <p className={`font-bold text-sm ${activeBranch?.id === loc.id ? 'text-sky-400' : 'text-white'}`}>{loc.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                          <MapPin size={10} /> {loc.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {loc.isMain && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md tracking-wider">MERKEZ</span>
                        )}
                        {activeBranch?.id === loc.id && (
                          <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-5 border-t border-white/5 bg-[#0a151f]">
              <button
                onClick={() => { setShowRequestModal(true); setShowBranchModal(false); }}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Yeni Şube / Güncelleme Talebi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
