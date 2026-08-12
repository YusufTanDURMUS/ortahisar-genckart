'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EsnafItem {
  id: string;
  shopName: string;
  category: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export default function AdminDashboard() {
  const [esnaflar, setEsnaflar] = useState<EsnafItem[]>([
    {
      id: '1',
      shopName: 'Kardeşler Kuruyemiş',
      category: 'Market / Gıda',
      phone: '0532 111 2233',
      address: 'Moda Cad. No:12 Kadıköy',
      isActive: true,
    },
    {
      id: '2',
      shopName: 'Tarihi Çınar Restoran',
      category: 'Restoran',
      phone: '0533 444 5566',
      address: 'İstiklal Cad. No:104 Beyoğlu',
      isActive: true,
    },
    {
      id: '3',
      shopName: 'Lezzet Unlu Mamülleri',
      category: 'Fırın',
      phone: '0535 777 8899',
      address: 'Atatürk Cad. No:45 Beşiktaş',
      isActive: true,
    },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/esnaf')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setEsnaflar(data.data);
        }
      })
      .catch(() => {
        // use default mock list if API isn't running yet
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
            ← Ana Portal
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold text-white tracking-wide">
            🛡️ Admin Yönetim Paneli
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Express API: Bağlı
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Prisma ORM (PostgreSQL)
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-indigo-500/20">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Toplam Esnaf</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">{esnaflar.length} Kayıtlı</h3>
            <p className="text-xs text-emerald-400 mt-1">↑ %12 geçen aya göre artış</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Günlük İşlem Hacmi</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">₺ 42.850</h3>
            <p className="text-xs text-emerald-400 mt-1">↑ 148 QR Başarılı İşlem</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-purple-500/20">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Aktif Windows Ajanları</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">24 Ajan</h3>
            <p className="text-xs text-purple-400 mt-1">C# .NET SendKeys Entegre</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-amber-500/20">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mobil Expo Bağlantıları</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">89 Cihaz</h3>
            <p className="text-xs text-amber-400 mt-1">React Native QR Scanner</p>
          </div>
        </div>

        {/* Esnaf List Table */}
        <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-bold text-white">Esnaf & Üye İşyerleri Listesi</h2>
              <p className="text-xs text-gray-400 mt-0.5">Sistemde aktif kayıtlı esnaflar ve coğrafi konum bilgileri</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition">
              + Yeni Esnaf Ekle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-gray-900/60 text-gray-400">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">İşyeri Adı</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Adres</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {esnaflar.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-4 py-3.5 font-medium text-white">{item.shopName}</td>
                    <td className="px-4 py-3.5 text-xs text-indigo-400">{item.category}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{item.phone}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{item.address}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Aktif
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
