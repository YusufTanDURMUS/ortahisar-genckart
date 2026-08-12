import React, { useState, useEffect } from 'react';
import { X, MapPin, Tag, AlignLeft, Check } from 'lucide-react';

export default function LocationModal({ isOpen, onClose, onSubmit, initialCoords }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('station');
  const [latitude, setLatitude] = useState(41.0082);
  const [longitude, setLongitude] = useState(28.9784);

  useEffect(() => {
    if (initialCoords) {
      setLatitude(initialCoords.lat);
      setLongitude(initialCoords.lng);
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({
      name,
      description,
      category,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-panel bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">Yeni PostGIS Konumu Ekle</h3>
            <p className="text-xs text-gray-400">Coğrafi veritabanına nokta (Point) kaydı oluşturun</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Konum Adı</label>
            <input
              type="text"
              required
              placeholder="Örn: Taksim Meydanı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500 text-sm text-gray-100 px-3.5 py-2.5 rounded-xl outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500 text-sm text-gray-100 px-3.5 py-2.5 rounded-xl outline-none transition-all"
            >
              <option value="station">İstasyon & Ulaşım</option>
              <option value="restaurant">Restoran & Kafe</option>
              <option value="hospital">Hastane & Sağlık</option>
              <option value="park">Park & Açık Alan</option>
              <option value="logistics">Lojistik Merkezi</option>
              <option value="custom">Diğer Özel Konum</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Enlem (Latitude)</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500 text-sm text-gray-100 px-3.5 py-2.5 rounded-xl outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Boylam (Longitude)</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500 text-sm text-gray-100 px-3.5 py-2.5 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Açıklama (Opsiyonel)</label>
            <textarea
              rows="3"
              placeholder="Konum hakkında detaylar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500 text-sm text-gray-100 px-3.5 py-2.5 rounded-xl outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-800 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              <Check className="w-4 h-4" />
              Veritabanına Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
