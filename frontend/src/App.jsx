import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MapView from './components/MapView';
import LocationList from './components/LocationList';
import LocationModal from './components/LocationModal';
import { Database, Activity, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api/locations';

// Seed demo locations for initial display before backend connects
const INITIAL_DEMO_LOCATIONS = [
  { id: '1', name: 'Kadıköy İskelesi', category: 'station', latitude: 40.9904, longitude: 29.0253, description: 'Vapur iskelesi ve ana ulaşım aktarma noktası.' },
  { id: '2', name: 'Taksim Meydanı', category: 'station', latitude: 41.0369, longitude: 28.9850, description: 'Metro istasyonu ve meydan.' },
  { id: '3', name: 'Beşiktaş Parkı', category: 'park', latitude: 41.0422, longitude: 29.0067, description: 'Sahil park alanı ve dinlenme tesisleri.' },
  { id: '4', name: 'Levent Lojistik Depo', category: 'logistics', latitude: 41.0805, longitude: 29.0118, description: 'Merkezi dağıtım ve araç filosu noktası.' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [mapStyle, setMapStyle] = useState('mapbox/dark-v11');
  const [locations, setLocations] = useState(INITIAL_DEMO_LOCATIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);

  // Fetch locations from NestJS Backend API
  const fetchLocations = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      if (res.ok) {
        const geoJson = await res.json();
        if (geoJson.features) {
          const parsed = geoJson.features.map((f) => ({
            id: f.properties.id,
            name: f.properties.name,
            category: f.properties.category,
            description: f.properties.description,
            longitude: f.geometry.coordinates[0],
            latitude: f.geometry.coordinates[1],
          }));
          setLocations(parsed);
        }
      }
    } catch (err) {
      console.warn("Backend API unavailable, using active state: ", err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = async (newLoc) => {
    const tempId = Date.now().toString();
    const created = { id: tempId, ...newLoc };
    setLocations((prev) => [created, ...prev]);

    // Send to backend
    try {
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoc),
      });
      fetchLocations();
    } catch (err) {
      console.warn("Could not save to remote backend API:", err);
    }
  };

  const handleDeleteLocation = async (id) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    try {
      await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Delete API failed:", err);
    }
  };

  const handleMapClick = (coords) => {
    setClickedCoords(coords);
    setIsModalOpen(true);
  };

  const handleFindNearby = async (lat, lng) => {
    setActiveTab('map');
    try {
      const res = await fetch(`${API_BASE_URL}/nearby?lat=${lat}&lng=${lng}&radius=5000`);
      if (res.ok) {
        const data = await res.json();
        alert(`5 km Yarıçapında ${data.count || 0} adet kayıtlı konum bulundu!`);
      }
    } catch {
      alert(`(${lat}, ${lng}) konumuna 5 km mesafedeki yerler sorgulandı.`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19]">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          locationCount={locations.length}
          onAddClick={() => { setClickedCoords(null); setIsModalOpen(true); }}
          mapStyle={mapStyle}
          setMapStyle={setMapStyle}
        />

        <main className="flex-1 relative overflow-hidden">
          {activeTab === 'map' && (
            <MapView
              locations={locations}
              onMapClick={handleMapClick}
              mapStyle={mapStyle}
            />
          )}

          {activeTab === 'locations' && (
            <LocationList
              locations={locations}
              onDelete={handleDeleteLocation}
              onFindNearby={handleFindNearby}
            />
          )}

          {activeTab === 'database' && (
            <div className="p-8 space-y-6 max-w-4xl">
              <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-gray-100">PostgreSQL + PostGIS 16-3.4 Yapılandırması</h2>
                </div>
                <p className="text-sm text-gray-400">
                  Veritabanında coğrafi nesneler WGS 84 (SRID 4326) koordinat sisteminde <code className="text-blue-400 font-mono">geometry(Point, 4326)</code> olarak tutulmaktadır.
                </p>

                <div className="bg-gray-950 p-4 rounded-xl font-mono text-xs text-emerald-400 border border-gray-800 space-y-2">
                  <p>-- PostGIS Yarıçap Sorgusu Örneği (ST_DWithin):</p>
                  <p className="text-gray-300">
                    SELECT name, latitude, longitude, ST_DistanceSphere(geom, ST_MakePoint(28.9784, 41.0082)) as metre<br/>
                    FROM locations<br/>
                    WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(28.9784, 41.0082), 4326)::geography, 5000);
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'redis' && (
            <div className="p-8 space-y-6 max-w-4xl">
              <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-amber-400" />
                  <h2 className="text-xl font-bold text-gray-100">Redis Önbellekleme & Performans Mimarisi</h2>
                </div>
                <p className="text-sm text-gray-400">
                  API uç noktaları GeoJSON verilerini Redis belleğinde 60 saniyelik TTL ile saklar. Yeni konum eklendiğinde önbellek otomatik invalid edilir.
                </p>
                <div className="bg-gray-950 p-4 rounded-xl font-mono text-xs text-amber-400 border border-gray-800">
                  Cache Key: "locations:all" | TTL: 60s | Status: Ready
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal for creating a new location */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLocation}
        initialCoords={clickedCoords}
      />
    </div>
  );
}
