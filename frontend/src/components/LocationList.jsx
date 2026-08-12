import React, { useState } from 'react';
import { MapPin, Trash2, Navigation, Search, Filter } from 'lucide-react';

export default function LocationList({ locations, onDelete, onFindNearby }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = locations.filter((loc) => {
    const matchesCat = filterCategory === 'all' || loc.category === filterCategory;
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-4 overflow-y-auto">
      {/* Header & Filters */}
      <div className="flex items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-gray-100">Kayıtlı Coğrafi Noktalar</h2>
            <p className="text-xs text-gray-400">PostGIS veritabanındaki aktif koordinat kayıtları</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İsim ile filtrele..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-gray-200 pl-9 pr-3 py-2 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-xs text-gray-200 px-3 py-2 rounded-xl outline-none focus:border-blue-500"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="station">İstasyonlar</option>
            <option value="restaurant">Restoranlar</option>
            <option value="hospital">Hastaneler</option>
            <option value="park">Parklar</option>
            <option value="logistics">Lojistik</option>
          </select>
        </div>
      </div>

      {/* Location Data Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((loc) => (
          <div
            key={loc.id}
            className="glass-card bg-[#111827]/70 border border-gray-800/80 p-4 rounded-2xl hover:border-blue-500/40 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {loc.category}
                </span>
                <button
                  onClick={() => onDelete(loc.id)}
                  className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                  title="Konumu Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-sm text-gray-100 group-hover:text-blue-400 transition-colors mb-1">
                {loc.name}
              </h3>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{loc.description || 'Açıklama girilmemiş.'}</p>
            </div>

            <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs">
              <div className="font-mono text-[11px] text-gray-400">
                {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
              </div>
              <button
                onClick={() => onFindNearby(loc.latitude, loc.longitude)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-[11px]"
              >
                <Navigation className="w-3.5 h-3.5" />
                Yakınındakiler (5km)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
