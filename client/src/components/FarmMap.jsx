import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Maximize2, Minimize2, Loader } from 'lucide-react';

/**
 * FarmMap — Interactive Leaflet map showing real farm locations.
 * Uses OpenStreetMap tiles (free, no API key required).
 * Leaflet CSS & JS are loaded dynamically from CDN.
 */

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>';

const CATEGORY_COLORS = {
  vegetables: '#40916c',
  fruits: '#e76f51',
  grains: '#e9c46a',
  dairy: '#74c69d',
  herbs: '#95d5b2',
  honey: '#f4a261',
};

export default function FarmMap({
  farms = [],
  selectedFarmId = null,
  onSelectFarm = null,
  height = '420px',
  showControls = true,
  singleFarm = null,        // If set, show only this farm marker
  style = {},
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [leafletLoaded, setLeafletLoaded] = useState(!!window.L);
  const [expanded, setExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Load Leaflet CSS & JS from CDN if not already loaded
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Locate user
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !window.L) return;
    if (mapInstanceRef.current) return; // already initialized

    const L = window.L;
    const center = singleFarm
      ? [singleFarm.coordinates.lat, singleFarm.coordinates.lng]
      : [39.8283, -98.5795]; // Center of US

    const map = L.map(mapRef.current, {
      center,
      zoom: singleFarm ? 10 : 4,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTR,
      maxZoom: 18,
    }).addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Clean up
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLoaded, singleFarm]);

  // Add markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const locations = singleFarm ? [singleFarm] : farms;

    locations.forEach((farm) => {
      if (!farm.coordinates || !farm.coordinates.lat) return;

      const isSelected = farm.farmerId === selectedFarmId || farm._id === selectedFarmId;
      const color = isSelected ? '#081c15' : '#2d6a4f';
      const size = isSelected ? 36 : 28;

      const icon = L.divIcon({
        className: 'farm-marker-icon',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: ${size * 0.38}px;
              line-height: 1;
            ">🌿</span>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size + 4],
      });

      const marker = L.marker([farm.coordinates.lat, farm.coordinates.lng], { icon });

      // Popup
      const topProducts = (farm.topProducts || [])
        .map((p) => `<span style="display:inline-block;background:#edfbf1;color:#2d6a4f;padding:2px 6px;border-radius:8px;font-size:11px;margin:2px;">${p.name} $${p.price}/${p.unit}</span>`)
        .join('');

      const popupHtml = `
        <div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;min-width:200px;max-width:260px;">
          ${farm.coverImage ? `<img src="${farm.coverImage}" style="width:100%;height:90px;object-fit:cover;border-radius:8px 8px 0 0;margin:-12px -12px 8px;" />` : ''}
          <div style="font-weight:700;font-size:14px;color:#081c15;margin-bottom:2px;">
            ${farm.farmName} ${farm.isVerified ? '✓' : ''}
          </div>
          <div style="color:#52635a;font-size:12px;margin-bottom:6px;">
            📍 ${farm.city}, ${farm.state}
            ${farm.rating ? ` • ⭐ ${farm.rating.toFixed(1)}` : ''}
          </div>
          ${farm.productCount ? `<div style="color:#40916c;font-size:11px;font-weight:600;margin-bottom:4px;">${farm.productCount} products available</div>` : ''}
          <div style="display:flex;flex-wrap:wrap;gap:2px;">${topProducts}</div>
          ${farm.certifications?.length ? `<div style="margin-top:6px;font-size:10px;color:#7e9187;">${farm.certifications.slice(0, 2).join(' • ')}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'farm-popup',
      });

      marker.on('click', () => {
        if (onSelectFarm) onSelectFarm(farm.farmerId || farm._id);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // User location marker
    if (userLocation && !singleFarm) {
      const userIcon = L.divIcon({
        className: 'user-marker-icon',
        html: `
          <div style="
            width: 18px; height: 18px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.3), 0 2px 6px rgba(0,0,0,0.2);
          "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup('<strong>📍 Your Location</strong>');
      userMarker.addTo(map);
      markersRef.current.push(userMarker);
    }

    // Fit bounds
    if (markersRef.current.length > 1 && !singleFarm) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [farms, singleFarm, selectedFarmId, userLocation, leafletLoaded]);

  // Fly to selected farm
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedFarmId || singleFarm) return;
    const farm = farms.find((f) => f.farmerId === selectedFarmId || f._id === selectedFarmId);
    if (farm?.coordinates) {
      mapInstanceRef.current.flyTo([farm.coordinates.lat, farm.coordinates.lng], 8, { duration: 1 });
    }
  }, [selectedFarmId, farms, singleFarm]);

  const handleLocateMe = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 8, { duration: 1 });
    }
  };

  if (!leafletLoaded) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #edfbf1 0%, #d8f3dc 100%)',
        borderRadius: '16px',
        border: '1px solid var(--border-light)',
        ...style,
      }}>
        <div style={{ textAlign: 'center', color: '#52635a' }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: '8px', fontSize: '13px' }}>Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="farm-map-container"
      style={{
        position: expanded ? 'fixed' : 'relative',
        top: expanded ? 0 : 'auto',
        left: expanded ? 0 : 'auto',
        right: expanded ? 0 : 'auto',
        bottom: expanded ? 0 : 'auto',
        zIndex: expanded ? 9999 : 1,
        height: expanded ? '100vh' : height,
        borderRadius: expanded ? 0 : '16px',
        overflow: 'hidden',
        border: expanded ? 'none' : '1px solid var(--border-light)',
        boxShadow: expanded ? 'none' : 'var(--shadow-md)',
        ...style,
      }}
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Controls Overlay */}
      {showControls && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          {/* Title Badge */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#081c15',
          }}>
            <MapPin size={14} style={{ color: '#2d6a4f' }} />
            {singleFarm ? singleFarm.farmName : `${farms.length} Farm Locations`}
          </div>

          {/* Locate Me */}
          {userLocation && !singleFarm && (
            <button
              onClick={handleLocateMe}
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                borderRadius: '10px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#3b82f6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Navigation size={13} /> My Location
            </button>
          )}
        </div>
      )}

      {/* Expand/Collapse */}
      <button
        onClick={() => {
          setExpanded(!expanded);
          setTimeout(() => {
            mapInstanceRef.current?.invalidateSize();
          }, 100);
        }}
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          border: 'none',
          borderRadius: '8px',
          padding: '6px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={expanded ? 'Collapse' : 'Expand map'}
      >
        {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>

      {/* Custom CSS for markers */}
      <style>{`
        .farm-marker-icon {
          background: none !important;
          border: none !important;
        }
        .user-marker-icon {
          background: none !important;
          border: none !important;
        }
        .farm-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          padding: 0;
          overflow: hidden;
        }
        .farm-popup .leaflet-popup-content {
          margin: 12px;
        }
        .farm-popup .leaflet-popup-tip {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
