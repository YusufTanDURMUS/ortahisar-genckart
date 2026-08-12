import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-[#0b0f19]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full text-center z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-semibold text-indigo-400 border border-indigo-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Ekosistem Bağlantısı Aktif (Node + Express + Prisma)
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          Esnaf & Akıllı Şehir <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Yönetim Portalı
          </span>
        </h1>

        <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
          Tek bir Next.js mimarisi altında Yönetici (Admin) ve Esnaf (PWA) panellerine anında erişin.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <Link
            href="/admin"
            className="glass-card p-6 rounded-2xl text-left border border-indigo-500/20 hover:border-indigo-500/50 group transition"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
              Sistem Admin Paneli
              <span className="text-indigo-400 text-sm">→</span>
            </h2>
            <p className="text-sm text-gray-400">
              Şehir haritası, tüm esnaf kayıtları, coğrafi analizler ve sistem istatistikleri.
            </p>
          </Link>

          <Link
            href="/esnaf"
            className="glass-card p-6 rounded-2xl text-left border border-emerald-500/20 hover:border-emerald-500/50 group transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
              Esnaf PWA Paneli
              <span className="text-emerald-400 text-sm">→</span>
            </h2>
            <p className="text-sm text-gray-400">
              Anlık QR ödeme alıcı, hızlı satış paneli, kasa durumu ve Windows Ajan senkronizasyonu.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
