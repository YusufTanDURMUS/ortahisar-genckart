'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Store, Sparkles, MapPin, Compass, ArrowRight, Award, Waves, HeartHandshake, Trees, Building2, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  const culturalSpots = [
    {
      title: 'Ganita Sahili & Gün Batımı',
      tag: 'Gençlik & Sahil',
      desc: 'Karadeniz esintisiyle gençlerin buluştuğu kafe, yürüyüş yolu ve gün batımı terasları.',
      icon: '🌅',
      gradient: 'from-amber-400/20 to-sky-400/20',
      border: 'border-amber-400/30',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'Boztepe Seyir Terası & Teleferik',
      tag: 'Panoramik Doğa',
      desc: 'Tarihi çay bahçeleri ve cam terastan Trabzon ve Karadeniz’in eşsiz panoramik manzarası.',
      icon: '🏔️',
      gradient: 'from-emerald-400/20 to-sky-400/20',
      border: 'border-emerald-400/30',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Zağnos & Tabakhane Vadileri',
      tag: 'Tarih & Yeşil Alan',
      desc: 'Tarihi surların gölgesinde yemyeşil vadiler, botanik yürüyüş parkurları ve gençlik etkinlikleri.',
      icon: '🌳',
      gradient: 'from-teal-400/20 to-cyan-400/20',
      border: 'border-teal-400/30',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      title: 'KTÜ & Kalkınma Gençlik Hattı',
      tag: 'Üniversite Yaşamı',
      desc: 'Karadeniz Teknik Üniversitesi çevresinde kitap kafeler, kırtasiyeler ve gençlere özel esnaf indirimleri.',
      icon: '🎓',
      gradient: 'from-blue-400/20 to-indigo-400/20',
      border: 'border-blue-400/30',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  ];

  const highlights = [
    { number: '%10 - %50', title: 'Özel Genç İndirimi', desc: 'Ortahisar esnaflarında geçerli anlık tasarruf' },
    { number: '15-25 Yaş', title: 'Tüm Gençlere Açık', desc: 'Ortahisar’da ikamet eden veya okuyan öğrencilere' },
    { number: '80+ Mahalle', title: 'İlçe Genelinde Geçerli', desc: 'Ganita’dan Boztepe’ye, Kalkınma’dan Beşirli’ye' },
    { number: 'Anında QR', title: 'Hızlı & Dijital Kart', desc: 'Mobil uygulama ile temassız anında kullanım' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe]/40 to-[#ffffff] text-slate-800 font-sans relative overflow-x-hidden">
      {/* Dynamic Background Waves & Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-sky-200/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[650px] h-[650px] bg-teal-100/60 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── TOP NAVBAR ─── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-sky-100 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-sky-400 flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Ortahisar Belediyesi"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-sky-950 tracking-tight block">
                TRABZON ORTAHİSAR BELEDİYESİ
              </span>
              <span className="text-[11px] font-bold text-sky-600 tracking-wider uppercase block">
                Genç Kart & Akıllı Şehir Yönetim Portalı
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 transition-all shadow-sm"
            >
              <ShieldCheck size={15} className="text-sky-600" />
              Belediye Girişi
            </Link>
            <Link
              href="/esnaf/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all shadow-md shadow-sky-500/20"
            >
              <Store size={15} />
              Esnaf Portalı
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        {/* Cultural Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-sky-200 text-sky-700 text-xs font-bold shadow-sm mb-6 animate-pulse">
          <Sparkles size={14} className="text-amber-500" />
          <span>Boztepe’den Ganita’ya, Gençliğin ve Doğanın Şehri Trabzon</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          <span className="text-sky-900 font-extrabold">Ortahisar Genç Kart</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Ortahisar’da Genç Olmak,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-600 to-blue-600">
            Ayrıcalıktır.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Ortahisar Belediyesi tarafından 15-25 yaş arası gençlerimiz ve üniversite öğrencilerimiz için hazırlanan 
          <strong className="text-sky-900 font-bold"> Genç Kart</strong> ile yerel esnaflarda indirimler, kültürel etkinlikler ve sosyal ayrıcalıklar tek bir dijital platformda!
        </p>

        {/* Portal Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-12">
          {/* Card 1: Admin */}
          <Link
            href="/admin/login"
            className="group relative bg-white/90 backdrop-blur-xl p-7 rounded-3xl border border-sky-100 hover:border-sky-300 shadow-xl shadow-sky-500/5 hover:shadow-sky-500/15 transition-all duration-300 flex flex-col justify-between text-left hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-100 to-transparent rounded-tr-3xl rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center mb-4 shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-extrabold uppercase tracking-wider border border-sky-100 mb-2">
                Yönetim & Denetim
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Belediye Admin Paneli</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Öğrenci onayları, esnaf başvuruları, indirim oranları denetimi ve sistem kullanıcı yönetimi.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sky-600 font-bold text-xs group-hover:text-sky-700">
              <span>Yönetim Girişi</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Esnaf */}
          <Link
            href="/esnaf/login"
            className="group relative bg-white/90 backdrop-blur-xl p-7 rounded-3xl border border-teal-100 hover:border-teal-300 shadow-xl shadow-teal-500/5 hover:shadow-teal-500/15 transition-all duration-300 flex flex-col justify-between text-left hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-100 to-transparent rounded-tr-3xl rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center mb-4 shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
                <Store size={24} />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-extrabold uppercase tracking-wider border border-teal-100 mb-2">
                İşletmeler İçin
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Anlaşmalı Esnaf Portalı</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Genç Kart QR tarayıcısı, indirim uygulama ekranı, şube yönetimi ve indirim oranı güncelleme talepleri.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-teal-600 font-bold text-xs group-hover:text-teal-700">
              <span>Esnaf Girişi</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ─── ORTAHİSAR CULTURAL & NATURE SPOTS ─── */}
      <section className="py-14 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100/80 text-sky-800 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Compass size={14} className="text-sky-600" />
            Ortahisar’ın Kültürel Rotaları
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Tarihin, Denizin ve Doğanın Kalbinde Gençlik
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Genç Kart avantajları Ortahisar’ın tüm simge noktalarında ve üniversite çevresinde yanınızda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {culturalSpots.map((spot, idx) => (
            <div
              key={idx}
              className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-sky-100/80 shadow-md shadow-sky-500/5 hover:shadow-lg hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{spot.icon}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${spot.badgeColor}`}>
                    {spot.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-sky-600 transition-colors">
                  {spot.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{spot.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HIGHLIGHT STATS ─── */}
      <section className="py-10 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-2xl shadow-sky-600/20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {highlights.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl sm:text-4xl font-black tracking-tight">{h.number}</div>
                <div className="text-xs sm:text-sm font-bold text-sky-100">{h.title}</div>
                <div className="text-[11px] text-sky-200/80">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="mt-16 border-t border-sky-100 bg-white/60 backdrop-blur-md py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sky-950">Trabzon Ortahisar Belediyesi</span>
            <span>•</span>
            <span>Akıllı Şehir ve Gençlik Hizmetleri Birimi</span>
          </div>
          <div>
            Ortahisar Genç Kart Projesi © {new Date().getFullYear()} — Tüm Hakları Saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
