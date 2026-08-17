'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Store, Lock, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function EsnafLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('esnaf@copycenter.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/merchant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        const token = data.data.token;
        const merchant = data.data.merchant;
        localStorage.setItem('merchant_token', token);
        localStorage.setItem('merchant_profile', JSON.stringify(merchant));
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `user_role=MERCHANT; path=/; max-age=86400; SameSite=Lax`;
        router.push('/esnaf');
      } else {
        setError(data.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
      }
    } catch (err: any) {
      setError('Sunucuya bağlanılamadı. Lütfen API servisinin çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-[#e0f2fe]/60 to-[#ffffff] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-200/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-200/60 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-teal-100 shadow-sm"
          >
            <ArrowLeft size={14} />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-8 border border-teal-100 shadow-2xl shadow-teal-500/10 relative overflow-hidden">
          {/* Top accent gradient line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-sky-500" />

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full bg-white p-1 border-2 border-teal-400 flex items-center justify-center mx-auto shadow-md">
                <Image
                  src="/logo.png"
                  alt="Ortahisar Belediyesi"
                  width={76}
                  height={76}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
            </div>

            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              ESNAF PORTALI
            </h1>
            <p className="text-xs font-bold text-teal-600 tracking-wide uppercase mt-0.5">
              Ortahisar Belediyesi Anlaşmalı İşletmeler
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                İşletme E-Posta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-teal-100 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-slate-400"
                  placeholder="esnaf@isletme.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-teal-100 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Store size={16} />
                  İşletme Girişi Yap
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Info */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 font-semibold">
              <CheckCircle2 size={13} className="text-teal-500" />
              Test Hesabı: esnaf@copycenter.com / admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
