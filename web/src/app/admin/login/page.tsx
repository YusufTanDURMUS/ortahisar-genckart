'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, AlertCircle, User, CheckCircle2, Lock } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        localStorage.setItem('admin_token', data.data.token);
        document.cookie = `token=${data.data.token}; path=/; max-age=604800; samesite=strict`;
        document.cookie = `user_role=ADMIN; path=/; max-age=604800; samesite=strict`;
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      setError('Sunucu bağlantısı kurulamadı. Backend servisinin çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060d13] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative w-full max-w-[420px] z-10">
        {/* Login Card */}
        <div className="bg-[#0e1720]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          
          {/* Logo with Glow */}
          <div className="flex flex-col items-center mb-7">
            <div className="relative group mb-3">
              <div className="absolute -inset-3 bg-cyan-400/35 rounded-full blur-xl animate-pulse" />
              <div className="relative w-32 h-32 rounded-full bg-white p-1 border-2 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.4)] flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Ortahisar Belediyesi"
                  width={130}
                  height={130}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
            </div>
            <h2 className="text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase mt-1">
              Ortahisar Belediyesi
            </h2>
            <h1 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              Yönetici Girişi
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Kurumsal E-Posta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ortahisar.bel.tr"
                  className="w-full bg-[#070d14] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                />
                {email.length > 3 && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#070d14] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                />
                {password.length >= 6 && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-1.5">
                <a href="#" className="text-[11px] text-cyan-400/80 hover:text-cyan-300 transition-colors">
                  Şifremi Unuttum
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] flex items-center justify-center gap-2 mt-4 active:scale-[0.98] disabled:opacity-60 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Giriş Yapılıyor...
                </>
              ) : 'Giriş Yap'}
            </button>
          </form>

          {/* Status footer */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center flex items-center justify-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Aktif
            </span>
            <span>•</span>
            <span>v2.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
