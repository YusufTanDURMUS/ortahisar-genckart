import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, Plus, ShieldCheck, Store } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-[#060d13] font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-4xl w-full text-center z-10 space-y-10 my-auto py-12">
        {/* Title Header */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ortahisar Belediyesi
          </h2>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-rose-400 bg-clip-text text-transparent">
            Akıllı Şehir Yönetim Portalı
          </h1>
        </div>

        {/* Center Logo with Bright Cyan Glow */}
        <div className="flex justify-center my-6">
          <div className="relative group">
            {/* Glowing halos */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/40 via-sky-400/30 to-teal-400/40 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 animate-pulse" />
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-teal-300 rounded-full opacity-60 blur-md" />
            
            {/* Logo Container */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white p-1 shadow-[0_0_50px_rgba(56,189,248,0.45)] border-2 border-cyan-400 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Ortahisar Belediyesi Logo"
                width={240}
                height={240}
                className="w-full h-full object-contain rounded-full scale-100 hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4">
          <Link
            href="/admin/login"
            className="group relative bg-[#0e1720]/80 hover:bg-[#14212e]/90 backdrop-blur-xl p-6 rounded-3xl text-left border border-white/5 hover:border-cyan-500/40 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Yönetici Paneli
                <span className="text-cyan-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Şehir haritası, tüm esnaf kayıtları, coğrafi ve sistem istatistikleri.
              </p>
            </div>
          </Link>

          <Link
            href="/esnaf/login"
            className="group relative bg-[#0e1720]/80 hover:bg-[#14212e]/90 backdrop-blur-xl p-6 rounded-3xl text-left border border-white/5 hover:border-teal-500/40 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(20,184,166,0.15)] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                <Plus size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
                Esnaf Portalı (PWA)
                <span className="text-teal-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anlık QR ödeme alıcı, hızlı satış paneli, senkron işlem ve Windows Ajan paneline erişim.
              </p>
            </div>
          </Link>
        </div>

        {/* Footer info */}
        <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistem Aktif
          </span>
          <span>•</span>
          <span>Ortahisar Belediyesi Genç Kart v2.1</span>
        </div>
      </div>
    </div>
  );
}
