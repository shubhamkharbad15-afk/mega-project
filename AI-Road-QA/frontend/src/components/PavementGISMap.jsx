import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Crosshair, Maximize2, ShieldAlert, AlertTriangle, Info, MapPin } from 'lucide-react';

const KOLHAPUR_CENTER = [16.7050, 74.2433]; // Kolhapur city, Maharashtra
const DEFAULT_CENTER = KOLHAPUR_CENTER;

// Tile layer providers - 100% public & keyless (zero API keys required)
const TILE_LAYERS = {
  streets: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
    subdomains: ['server', 'services'],
  },
};

export default function PavementGISMap({
  reports = [],
  selectedReport = null,
  onSelectReport = () => {},
  userCoordinates = DEFAULT_CENTER,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [activeTileType, setActiveTileType] = useState('streets');
  const [activeReportId, setActiveReportId] = useState(selectedReport?.id || null);
  const [liveCoordinates, setLiveCoordinates] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Location not shared');
  const [locationError, setLocationError] = useState('');
  const displayedCoordinates = liveCoordinates || userCoordinates || DEFAULT_CENTER;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add minimal attribution bottom-right
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    // Initial tile layer - 100% free OpenStreetMap (no API key required)
    const initialTile = TILE_LAYERS.streets;
    const tileLayer = L.tileLayer(initialTile.url, {
      attribution: initialTile.attribution,
      maxZoom: initialTile.maxZoom,
      subdomains: initialTile.subdomains || ['a', 'b', 'c'],
    }).addTo(map);

    tileLayer.on('tileerror', (e) => {
      // Graceful fallback for occasional network timeouts
    });

    // Layer group for pins
    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersLayer;

    // Invalidate size on mount to ensure full tile rendering
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer on switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    const config = TILE_LAYERS[activeTileType] || TILE_LAYERS.streets;
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || ['a', 'b', 'c'],
    }).addTo(map);

    newTileLayer.on('tileerror', () => {});

    tileLayerRef.current = newTileLayer;
  }, [activeTileType]);

  // Update Markers when reports or userCoordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // 1. Add User Location Marker
    const userLat = displayedCoordinates[0] || DEFAULT_CENTER[0];
    const userLng = displayedCoordinates[1] || DEFAULT_CENTER[1];

    const userHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-sky-500/30 border border-sky-400 animate-ping"></span>
        <span class="w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-md z-10 flex items-center justify-center">
          <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
        </span>
        <span class="absolute -bottom-5 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">
          ${liveCoordinates ? 'Your live location' : 'Kolhapur district view'}
        </span>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'gis-user-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 })
      .bindPopup(`
        <div class="p-1 font-sans text-xs">
          <p class="font-bold text-slate-900">${liveCoordinates ? 'Your Live Location' : 'Kolhapur Map Center'}</p>
          <p class="text-[11px] text-slate-500 font-mono">${userLat.toFixed(4)}° N, ${userLng.toFixed(4)}° E</p>
          <p class="text-[11px] text-sky-700 font-semibold mt-1">${liveCoordinates ? 'Browser-provided GPS coordinates' : 'Kolhapur, Maharashtra'}</p>
        </div>
      `)
      .addTo(markersLayer);

    // 2. Add Defect Incidents
    reports.forEach((rep) => {
      const lat = Number(rep.latitude);
      const lng = Number(rep.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const isHigh = rep.severity === 'high';
      const isMedium = rep.severity === 'medium';
      const badgeBg = isHigh ? 'bg-red-600' : isMedium ? 'bg-amber-500' : 'bg-sky-600';
      const pulseRing = isHigh ? 'ring-4 ring-red-400/40' : isMedium ? 'ring-4 ring-amber-400/40' : '';

      const markerHtml = `
        <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
          <div class="w-7 h-7 rounded-full ${badgeBg} ${pulseRing} flex items-center justify-center text-white font-black text-[11px] shadow-lg border-2 border-white transition-transform duration-200 hover:scale-125">
            !
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none border border-slate-700">
            ${rep.title}
          </div>
        </div>
      `;

      const incidentIcon = L.divIcon({
        html: markerHtml,
        className: 'gis-incident-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon: incidentIcon }).addTo(markersLayer);

      const statusBadge = rep.status === 'resolved'
        ? '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Resolved</span>'
        : rep.status === 'in_progress'
        ? '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">In Progress</span>'
        : '<span class="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">Confirmed</span>';

      const popupHtml = `
        <div class="p-1 font-sans text-xs w-56">
          ${rep.imageUrl ? `<img src="${rep.imageUrl}" alt="${rep.title}" class="w-full h-24 object-cover rounded-lg border border-slate-200 mb-2" />` : ''}
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">${rep.defect_type || 'Road Defect'}</span>
            ${statusBadge}
          </div>
          <h4 class="font-bold text-slate-900 leading-snug mb-1">${rep.title}</h4>
          <p class="text-[11px] text-slate-500 mb-2">${rep.location_name || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`}</p>
          <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-600">Severity: <span class="capitalize text-red-600">${rep.severity}</span></span>
            <button id="gis-popup-btn-${rep.id}" class="px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold transition-all">
              Inspect Audit &rarr;
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`gis-popup-btn-${rep.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectReport(rep);
          };
        }
      });
    });

    // Invalidate size once after rendering
    map.invalidateSize();
  }, [reports, userCoordinates, liveCoordinates]);

  // Smoothly fly to selected report if changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedReport) return;
    const lat = Number(selectedReport.latitude);
    const lng = Number(selectedReport.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.0 });
    }
  }, [selectedReport]);

  // Center on user action
  const handleCenterOnUser = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationStatus('Location unavailable');
      setLocationError('This browser does not support geolocation.');
      return;
    }
    setLocationStatus('Waiting for permission…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setLiveCoordinates(coords);
        setLocationStatus('Live location enabled');
        setLocationError('');
        mapInstanceRef.current?.flyTo(coords, 16, { duration: 1.2 });
      },
      (error) => {
        const message = error.code === 1
          ? 'Location permission was denied. Allow location access in your browser settings and try again.'
          : error.code === 2
          ? 'Your location could not be determined. Check your device location services and try again.'
          : 'Location request timed out. Please try again.';
        setLocationStatus('Location not available');
        setLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleShowKolhapur = () => {
    setLocationError('');
    mapInstanceRef.current?.flyTo(KOLHAPUR_CENTER, 10, { duration: 1.2 });
  };

  // Fit all reports in view
  const handleFitAllBounds = () => {
    if (!mapInstanceRef.current || reports.length === 0) return;
    const validPoints = reports
      .map((r) => [Number(r.latitude), Number(r.longitude)])
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

    validPoints.push(userCoordinates);

    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100 ${className}`}>
      {/* Real Interactive Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-[440px] sm:h-[480px] z-0" />

      {/* Floating Modern Toolbar Controls */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2">
        {/* Layer Switcher */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 p-1 flex items-center text-xs font-semibold text-slate-700">
          <button
            onClick={() => setActiveTileType('streets')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTileType === 'streets'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Street Map
          </button>
          <button
            onClick={() => setActiveTileType('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTileType === 'satellite'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Satellite View
          </button>
        </div>

        {/* Center on Me */}
        <button
          onClick={handleCenterOnUser}
          className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 hover:text-slate-950 rounded-xl px-2.5 py-1.5 shadow-md border border-slate-200/80 text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition-all"
          title="Center on Your GPS"
        >
          <Crosshair className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden sm:inline">Use My Location</span>
        </button>

        <button
          onClick={handleShowKolhapur}
          className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 rounded-xl px-2.5 py-1.5 shadow-md border border-slate-200/80 text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition-all"
          title="Show Kolhapur district"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kolhapur District</span>
        </button>

        {/* Fit Bounds */}
        <button
          onClick={handleFitAllBounds}
          className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 hover:text-slate-950 rounded-xl px-2.5 py-1.5 shadow-md border border-slate-200/80 text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition-all"
          title="Fit All Incidents"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Fit All Incidents</span>
        </button>
      </div>

      <div className="absolute top-16 left-3 z-[400] max-w-[min(90%,360px)] rounded-lg bg-white/95 border border-slate-200 px-3 py-2 shadow-md text-xs" role="status" aria-live="polite">
        <div className="font-bold text-slate-800">{locationStatus}</div>
        {locationError && <div className="mt-1 text-red-700">{locationError}</div>}
        {!liveCoordinates && !locationError && <div className="mt-1 text-slate-600">Map opens on Kolhapur. Select “Use My Location” to request GPS permission.</div>}
      </div>

      {/* Floating Legend Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl p-2.5 shadow-md text-[11px] font-sans flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-200"></span>
          <span className="font-semibold text-slate-700">High Risk</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
          <span className="font-semibold text-slate-700">Medium</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
          <span className="font-semibold text-slate-700">Map center / You</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono hidden sm:inline">
          SRID: 4326 PostGIS
        </div>
      </div>
    </div>
  );
}
