import React from 'react';
import { MapPin, Zap, Database, Plus, Search, Layers } from 'lucide-react';

export default function Header({ locationCount, onAddClick, mapStyle, setMapStyle }) {
  return (
    <header className="h-16 glass-panel border-b border-gray-800 px-6 flex items-center justify-between z-10">
      {/* Search & Quick Filter */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Konum veya enlem/boylam ara..."
            className="w-64 bg-gray-900/80 border border-gray-800 focus:border-blue-500 text-sm text-gray-200 pl-9 pr-4 py-1.5 rounded-lg outline-none transition-all"
          />
        </div>

        {/* Mapbox Style Switcher */}
        <div className="flex items-center bg-gray-900/90 border border-gray-800 p-1 rounded-lg text-xs font-medium text-gray-400">
          <button
            onClick={() => setMapStyle('mapbox/dark-v11')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapStyle === 'mapbox/dark-v11' ? 'bg-blue-600 text-white font-semibold shadow' : 'hover:text-gray-200'
            }`}
          >
            Dark Mode
          </button>
          <button
            onClick={() => setMapStyle('mapbox/satellite-streets-v12')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapStyle === 'mapbox/satellite-streets-v12' ? 'bg-blue-600 text-white font-semibold shadow' : 'hover:text-gray-200'
            }`}
          >
            Uydu
          </button>
          <button
            onClick={() => setMapStyle('mapbox/streets-v12')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapStyle === 'mapbox/streets-v12' ? 'bg-blue-600 text-white font-semibold shadow' : 'hover:text-gray-200'
            }`}
          >
            Sokak
          </button>
        </div>
      </div>

      {/* KPI Stats & Add Action Button */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Kayıtlı Konum: <strong className="text-gray-100 font-bold">{locationCount}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>PostGIS SRID: <strong className="text-gray-100 font-bold">4326</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Redis Önbellek: <strong className="text-emerald-400 font-bold">Aktif</strong></span>
          </div>
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Yeni Konum Ekle
        </button>
      </div>
    </header>
  );
}
