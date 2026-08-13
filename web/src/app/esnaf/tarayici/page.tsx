'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';
import { CheckCircle2, XCircle, RefreshCw, LogOut, Receipt, Store } from 'lucide-react';

interface MerchantInfo {
  businessName: string;
  category: string;
}

export default function EsnafTarayiciPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [scannedQR, setScannedQR] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Oturum Kontrolü (JWT Token Var mı?)
  useEffect(() => {
    const token = localStorage.getItem('merchant_token');
    const info = localStorage.getItem('merchant_info');

    if (!token) {
      router.push('/esnaf/login');
      return;
    }

    if (info) {
      setMerchant(JSON.parse(info));
    }
  }, [router]);

  // 2. Kamera QR Okuduğunda Çalışan Metod
  const handleScanSuccess = (qrData: string) => {
    if (!scannedQR) {
      setScannedQR(qrData);
    }
  };

  // 3. Backend API'ye İndirim Doğrulama İsteği Gönder
  const handleVerifyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedQR || !amount) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('merchant_token');
      
      const res = await fetch('http://localhost:3000/api/v1/discount/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrData: scannedQR,
          originalAmount: Number(amount),
          integrationType: 'PWA_SCAN',
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        setResult(data.data); // Yeşil onay kartını tetikle
      } else {
        setError(data.message || 'İndirim onaylanamadı. QR kod süresi dolmuş veya geçersiz olabilir.');
      }
    } catch (err) {
      setError('Backend API sunucusuna bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Yeni İşlem İçin Ekranı Sıfırla
  const resetScanner = () => {
    setScannedQR(null);
    setAmount('');
    setResult(null);
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_info');
    router.push('/esnaf/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-center text-sky-400">
            <Store size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{merchant?.businessName || 'Esnaf Portalı'}</h2>
            <p className="text-xs text-slate-400">Ortahisar Genç Kart POS</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors"
          title="Çıkış Yap"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Ana İçerik */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col justify-center">
        
        {/* DURUM 1: İndirim Başarıyla Onaylandı (Yeşil Onay Kartı) */}
        {result ? (
          <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 size={48} />
            </div>

            <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              İNDİRİM ONAYLANDI
            </span>

            <h3 className="text-2xl font-bold text-white mb-1">
              {result.student.firstName} {result.student.lastName}
            </h3>
            <p className="text-xs text-emerald-300/80 mb-6">Ortahisar Genç Kart Doğrulandı</p>

            <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 space-y-3 mb-6 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Genel Tutar:</span>
                <span className="text-slate-300 line-through font-medium">{result.financials.originalAmount} TL</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">İndirim Oranı:</span>
                <span className="text-emerald-400 font-bold">{result.financials.discountRate}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">İndirim Tutarı:</span>
                <span className="text-emerald-400 font-semibold">-{result.financials.savedAmount} TL</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                <span className="text-white font-bold text-base">Tahsil Edilecek:</span>
                <span className="text-2xl font-extrabold text-emerald-400">{result.financials.discountedAmount} TL</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6">Onay Kodu: <span className="font-mono text-slate-300">{result.verificationCode}</span></p>

            <button
              onClick={resetScanner}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Yeni İşlem Yap
            </button>
          </div>
        ) : scannedQR ? (
          
          /* DURUM 2: QR Kod Okundu -> Fatura Tutarı Girme Ekranı */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Genç Kart Yakalandı</h3>
                <p className="text-xs text-slate-400">Hesap tutarını giriniz</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                <XCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyDiscount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Toplam Fatura Tutarı (TL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-3xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-center"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-4 rounded-xl transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading || !amount}
                  className="flex-[2] bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? 'Hesaplanıyor...' : 'İndirimi Uygula'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          
          /* DURUM 3: Kamera İle QR Okuma Ekranı */
          <div className="space-y-4 text-center">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Müşteri QR Kodunu Okutun</h3>
              <p className="text-xs text-slate-400 mb-6">Öğrencinin Genç Kart uygulamasındaki canlı QR kodunu kameraya tutun.</p>

              <QRScanner onScanSuccess={handleScanSuccess} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
