import React from 'react';
import { Map, MapPin, Database, Activity, Layers, Settings, Compass, ShieldCheck } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'map', label: 'Coğrafi Harita', icon: Map },
    { id: 'locations', label: 'Konum Listesi', icon: MapPin },
    { id: 'database', label: 'PostGIS Veritabanı', icon: Database },
    { id: 'redis', label: 'Redis Önbellek', icon: Activity },
  ];

  return (
    <aside className="w-64 h-full glass-panel border-r border-gray-800 flex flex-col justify-between p-4 z-20">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-gray-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
              GeoSpatial HQ
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">PostGIS & Redis Dashboard</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footbar */}
      <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-300">Sistem Aktif</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500 px-2 py-0.5 rounded bg-gray-800 border border-gray-700">v1.0.0</span>
      </div>
    </aside>
  );
}
