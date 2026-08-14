'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, KeyRound, AlertCircle } from 'lucide-react';

export default function EsnafLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/merchant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.status === 'SUCCESS') {
        localStorage.setItem('merchant_token', data.data.token);
        localStorage.setItem('merchant_info', JSON.stringify(data.data.merchant));
        
        // Middleware için cookie'leri ayarla
        document.cookie = `token=${data.data.token}; path=/; max-age=604800; samesite=strict`; // 7 days
        document.cookie = `user_role=MERCHANT; path=/; max-age=604800; samesite=strict`;

        window.location.href = '/esnaf';
      } else {
        setError(data.message || 'Giriş bilgileri hatalı.');
      }
    } catch (err) {
      setError('Backend API sunucusuna bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center text-sky-400 mb-4">
            <Store size={32} />
          </div>
          <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">TRABZON ORTAHİSAR BELEDİYESİ</span>
          <h1 className="text-2xl font-bold text-white mt-1">Akıllı Esnaf Portalı</h1>
          <p className="text-slate-400 text-sm mt-1">Genç Kart indirimlerini kolayca uygulayın</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">İşletme E-Posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="esnaf@akbuzsoğutma.com"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
