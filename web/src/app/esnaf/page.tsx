'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EsnafPWADashboard() {
  const [amount, setAmount] = useState('');
  const [lastQR, setLastQR] = useState<{ code: string; amount: string; expires: string } | null>(null);
  const [agentStatus, setAgentStatus] = useState<'connected' | 'idle'>('connected');

  const handleGenerateQR = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const newQR = {
      code: `ESNAF-QR-${Math.floor(100000 + Math.random() * 900000)}`,
      amount,
      expires: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('tr-TR'),
    };
    setLastQR(newQR);

    // Call Express API
    fetch('http://localhost:3000/api/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, esnafId: 'esnaf-demo-1' }),
    }).catch(() => {
      // client side offline/fallback handling
    });
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
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            C# Windows Ajanı: Entegre
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick QR Generator Card */}
          <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                💳 QR Kod ile Ödeme Al
              </h2>
              <span className="text-xs text-gray-400">Anlık İşlem</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Ödeme Tutarı (TL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-2xl font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₺</span>
              </div>
            </div>

            <button
              onClick={handleGenerateQR}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
            >
              ⚡ QR Kodu Oluştur & Ekranına Gönder
            </button>

            {lastQR && (
              <div className="mt-4 p-4 rounded-xl bg-gray-900/90 border border-emerald-500/30 text-center space-y-2">
                <p className="text-xs text-gray-400">Oluşturulan Dinamik QR Kodu</p>
                <div className="w-36 h-36 bg-white mx-auto rounded-lg flex items-center justify-center p-2">
                  {/* Visual QR representation placeholder */}
                  <div className="w-full h-full bg-gray-900 rounded p-2 flex flex-col justify-between items-center text-[8px] font-mono text-emerald-400">
                    <div className="w-full flex justify-between">
                      <div className="w-6 h-6 bg-emerald-400" />
                      <div className="w-6 h-6 bg-emerald-400" />
                    </div>
                    <span className="text-white font-bold">{lastQR.code}</span>
                    <div className="w-full flex justify-between">
                      <div className="w-6 h-6 bg-emerald-400" />
                      <div className="w-6 h-6 bg-emerald-400" />
                    </div>
                  </div>
                </div>
                <p className="text-lg font-bold text-white">₺ {lastQR.amount}</p>
                <p className="text-[10px] text-gray-500">Son Kullanma: {lastQR.expires}</p>
              </div>
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
          </div>
        </div>
      </main>
    </div>
  );
}
