import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const DEFAULT_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

export default function MapView({ locations, onMapClick, mapStyle }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    mapboxgl.accessToken = DEFAULT_MAPBOX_TOKEN;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: `mapbox://styles/${mapStyle || 'mapbox/dark-v11'}`,
        center: [28.9784, 41.0082], // Istanbul Default Coordinates
        zoom: 11,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }), 'top-right');

      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        if (onMapClick) {
          onMapClick({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
        }
      });

      mapRef.current = map;

      return () => {
        map.remove();
      };
    } catch (err) {
      console.warn("Mapbox initialization error (Check token):", err);
    }
  }, []);

  // Update map style when changed
  useEffect(() => {
    if (mapRef.current && mapStyle) {
      mapRef.current.setStyle(`mapbox://styles/${mapStyle}`);
    }
  }, [mapStyle]);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-125 transition-transform duration-200';
      el.innerHTML = `
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      `;

      const popupHtml = `
        <div class="p-1">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              ${loc.category || 'Konum'}
            </span>
          </div>
          <h4 class="font-bold text-sm text-gray-100 mb-1">${loc.name}</h4>
          ${loc.description ? `<p class="text-xs text-gray-400 mb-2">${loc.description}</p>` : ''}
          <div class="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
            Enlem: ${loc.latitude.toFixed(4)} | Boylam: ${loc.longitude.toFixed(4)}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [locations]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Info Overlay */}
      <div className="absolute bottom-6 left-6 z-10 glass-panel p-3.5 rounded-2xl border border-gray-800 text-xs text-gray-300 shadow-2xl flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></div>
        <div>
          <p className="font-semibold text-gray-100">Haritada Tıkla & Konum Ekle</p>
          <p className="text-[11px] text-gray-400">Harita üzerinde istediğin noktaya tıklayarak direkt PostGIS kaydı oluşturabilirsin.</p>
        </div>
      </div>
    </div>
  );
}
