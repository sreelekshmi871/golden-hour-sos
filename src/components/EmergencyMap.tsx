import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, 
  MapPin, 
  Hospital as HospitalIcon, 
  ShieldAlert, 
  Clock, 
  Layers, 
  Maximize2,
  Minimize2,
  Compass,
  Crosshair,
  Car,
  Activity,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  ExternalLink,
  PhoneCall,
  Volume2
} from 'lucide-react';
import { Hospital, EmergencyAlert } from '../types';
import { CHENNAI_LOCALITIES } from '../data/hospitals';

interface EmergencyMapProps {
  userLocation: { lat: number; lng: number; address: string };
  selectedHospital: Hospital | null;
  allHospitals: Hospital[];
  alert?: EmergencyAlert | null;
  lang: 'en' | 'ta';
  onSelectHospital?: (hospital: Hospital) => void;
  compact?: boolean;
  height?: string;
  filterCurrentHospitalOnly?: boolean;
}

// Fallback high-fidelity road-following route in Chennai (Nungambakkam to Greams Road)
const DEFAULT_CHENNAI_ROUTE: [number, number][] = [
  [13.0645, 80.2460], // Sterling Road / Nungambakkam [lat, lng]
  [13.0630, 80.2475],
  [13.0612, 80.2505], // College Road
  [13.0590, 80.2530], // Haddows Road
  [13.0580, 80.2545],
  [13.0550, 80.2520], // Greams Road Junction
  [13.0538, 80.2514], // Apollo Apex Hospital
];

// Verified Real OSM Nearby Hospitals in Chennai for Overpass/OSM Layer
const REAL_OSM_HOSPITALS = [
  { name: 'Rajiv Gandhi Government General Hospital (RGGGH)', lat: 13.0805, lng: 80.2785, type: 'Govt Apex Trauma' },
  { name: 'Government Stanley Medical College Hospital', lat: 13.1070, lng: 80.2870, type: 'Govt Super Specialty' },
  { name: 'MIOT International Multispeciality Hospital', lat: 13.0232, lng: 80.1834, type: 'Private Ortho & Trauma' },
  { name: 'SIMS Hospital (SRM Institutes)', lat: 13.0489, lng: 80.2098, type: 'Tertiary Trauma & Stroke' },
  { name: 'Sri Ramachandra Institute of Higher Education', lat: 13.0372, lng: 80.1428, type: 'University Medical Center' },
  { name: 'Fortis Malar Hospital Adyar', lat: 13.0067, lng: 80.2568, type: 'Cardiac Care Unit' },
  { name: 'Kauvery Hospital Alwarpet', lat: 13.0376, lng: 80.2535, type: 'Comprehensive Care' },
];

const getHospitalCoords = (h: Hospital): [number, number] => {
  if (h.coordinates && typeof h.coordinates.lat === 'number') {
    return [h.coordinates.lat, h.coordinates.lng];
  }
  if (typeof h.lat === 'number' && typeof h.lng === 'number') {
    return [h.lat, h.lng];
  }
  return [13.0827, 80.2707];
};

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  userLocation,
  selectedHospital,
  allHospitals,
  alert,
  lang,
  onSelectHospital,
  compact = false,
  height,
  filterCurrentHospitalOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeShadowRef = useRef<L.Polyline | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const partnerMarkersRef = useRef<L.Marker[]>([]);
  const osmMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const localityMarkersRef = useRef<L.Marker[]>([]);

  // States
  const [activeProvider, setActiveProvider] = useState<'CARTO_DARK' | 'OSM_BACKUP'>('CARTO_DARK');
  const [usingBackupTiles, setUsingBackupTiles] = useState(false);
  const [showOsmHospitals, setShowOsmHospitals] = useState(false);
  const [showPartnerHospitals, setShowPartnerHospitals] = useState(true);
  const [showLocalities, setShowLocalities] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [followAmbulance, setFollowAmbulance] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(DEFAULT_CHENNAI_ROUTE);
  const [ambulanceProgress, setAmbulanceProgress] = useState(0.2);
  const [etaRemainingMins, setEtaRemainingMins] = useState<number>(selectedHospital?.estimatedDriveTimeMins || 8);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(selectedHospital?.distanceKm || 3.8);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Check ?debug=1 URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debug') === '1') {
        setShowDiagnostics(true);
      }
    }
  }, []);

  // 1. Fetch real road coordinates via /api/route endpoint (with OSRM / fallback)
  useEffect(() => {
    let isCancelled = false;
    const fetchRoute = async () => {
      if (!selectedHospital) return;
      try {
        const uLat = userLocation.lat;
        const uLng = userLocation.lng;
        const [hLat, hLng] = getHospitalCoords(selectedHospital);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `/api/route?from=${uLat},${uLng}&to=${hLat},${hLng}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Route API returned ${res.status}`);
        const data = await res.json();

        if (data?.coordinates && data.coordinates.length > 0 && !isCancelled) {
          setRouteCoordinates(data.coordinates);
          if (typeof data.distanceKm === 'number') {
            setRouteDistanceKm(data.distanceKm);
          }
          if (typeof data.durationMins === 'number') {
            setEtaRemainingMins(Math.max(3, Math.round(data.durationMins)));
          }
          return;
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('[Map Route] API fetch fallback to OSRM direct/interpolated:', err.message);
          setLastError(err.message);
        }
      }

      // Direct fallback: Fetch from public OSRM router
      try {
        const uLat = userLocation.lat;
        const uLng = userLocation.lng;
        const [hLat, hLng] = getHospitalCoords(selectedHospital);
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${hLng},${hLat}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        if (res.ok) {
          const data = await res.json();
          if (data?.routes?.[0]?.geometry?.coordinates && !isCancelled) {
            const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]]
            );
            setRouteCoordinates(coords);
            if (data.routes[0].distance) {
              setRouteDistanceKm(Number((data.routes[0].distance / 1000).toFixed(1)));
            }
            if (data.routes[0].duration) {
              setEtaRemainingMins(Math.max(3, Math.round(data.routes[0].duration / 60)));
            }
            return;
          }
        }
      } catch (e) {
        // Silent fall-through to geometric interpolation
      }

      // Final Geometry fallback: Generate curved realistic road points
      if (!isCancelled && selectedHospital) {
        const p1: [number, number] = [userLocation.lat, userLocation.lng];
        const [hLat, hLng] = getHospitalCoords(selectedHospital);
        const p4: [number, number] = [hLat, hLng];
        const midLat = (p1[0] + p4[0]) / 2 + 0.003;
        const midLng = (p1[1] + p4[1]) / 2 - 0.002;
        const points: [number, number][] = [
          p1,
          [p1[0] * 0.7 + midLat * 0.3, p1[1] * 0.7 + midLng * 0.3],
          [midLat, midLng],
          [p4[0] * 0.3 + midLat * 0.7, p4[1] * 0.3 + midLng * 0.7],
          p4
        ];
        setRouteCoordinates(points);
      }
    };

    fetchRoute();
    return () => {
      isCancelled = true;
    };
  }, [userLocation, selectedHospital]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default bounds: Greater Chennai region [[12.60, 79.70], [13.50, 80.60]]
    const map = L.map(containerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 12,
      zoomControl: !compact,
      attributionControl: true,
      maxBounds: [[12.40, 79.50], [13.70, 80.80]],
    });
    mapInstanceRef.current = map;

    // Add scale control
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Dark tiles from CARTO with automatic failover to OpenStreetMap
    let errorCount = 0;
    const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    cartoLayer.on('tileerror', (e) => {
      errorCount++;
      setLastError('Tile loading error on CARTO');
      if (errorCount >= 3) {
        console.warn('[Leaflet] CARTO dark tiles unavailable. Switching to OpenStreetMap backup tiles.');
        map.removeLayer(cartoLayer);
        const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
        osmLayer.addTo(map);
        tileLayerRef.current = osmLayer;
        setActiveProvider('OSM_BACKUP');
        setUsingBackupTiles(true);
      }
    });

    cartoLayer.addTo(map);
    tileLayerRef.current = cartoLayer;

    // Sizing Safety: Invalidate size after mount and delays
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    // ResizeObserver on container so map NEVER appears grey or half-loaded
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Render Markers, Localities & Route on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up previous layers
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (routeShadowRef.current) {
      routeShadowRef.current.remove();
      routeShadowRef.current = null;
    }
    if (ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current.remove();
      ambulanceMarkerRef.current = null;
    }
    partnerMarkersRef.current.forEach(m => m.remove());
    partnerMarkersRef.current = [];
    osmMarkersRef.current.forEach(m => m.remove());
    osmMarkersRef.current = [];
    localityMarkersRef.current.forEach(m => m.remove());
    localityMarkersRef.current = [];

    // A. Chennai Locality Chips (Poonamallee, Ambattur, Guindy, etc.)
    if (showLocalities) {
      CHENNAI_LOCALITIES.forEach(loc => {
        const locIcon = L.divIcon({
          className: 'chennai-locality-chip',
          html: `
            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(148, 163, 184, 0.4); border-radius: 6px; padding: 1px 5px; font-size: 9px; font-family: monospace; color: #cbd5e1; white-space: nowrap; pointer-events: none; box-shadow: 0 1px 4px rgba(0,0,0,0.4); backdrop-filter: blur(4px);">
              ${lang === 'ta' ? loc.nameTamil : loc.name}
            </div>
          `,
          iconSize: [60, 16],
          iconAnchor: [30, 8],
        });
        const marker = L.marker([loc.lat, loc.lng], { icon: locIcon, interactive: false }).addTo(map);
        localityMarkersRef.current.push(marker);
      });
    }

    // B. Patient Marker: Glowing blue/cyan circle with pulsing ring
    const patientIcon = L.divIcon({
      className: 'patient-marker-div',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(6, 182, 212, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background: #06b6d4; border: 2.5px solid #ffffff; box-shadow: 0 0 16px #06b6d4; display: flex; align-items: center; justify-content: center; color: #020617; font-weight: 900; font-size: 9px; font-family: monospace;">
            SOS
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: patientIcon }).addTo(map);
    userMarker.bindPopup(`
      <div style="font-family: sans-serif; min-width: 170px; color: #0f172a; padding: 2px;">
        <div style="font-weight: 800; font-size: 13px; color: #0284c7; margin-bottom: 2px;">
          📍 ${lang === 'ta' ? 'நோயாளி இடம்' : 'Patient Distress Location'}
        </div>
        <div style="font-size: 11px; color: #334155; margin-bottom: 4px;">
          ${userLocation.address || 'Chennai Emergency Point'}
        </div>
        <div style="font-size: 10px; font-family: monospace; color: #64748b;">
          Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}
        </div>
      </div>
    `);
    userMarkerRef.current = userMarker;

    // C. Partner Hospitals Markers
    const hospitalsToRender = filterCurrentHospitalOnly && selectedHospital
      ? [selectedHospital]
      : (showPartnerHospitals ? allHospitals : []);

    hospitalsToRender.forEach(hosp => {
      const isRecommended = selectedHospital?.id === hosp.id;
      const beds = hosp.availableIcuBeds + hosp.availableTraumaBays;
      const isGoodCapacity = beds >= 4;

      let icon: L.DivIcon;

      if (isRecommended) {
        icon = L.divIcon({
          className: 'recommended-hospital-marker',
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(244, 63, 94, 0.45); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 30px; height: 30px; border-radius: 9999px; background: linear-gradient(135deg, #f43f5e, #dc2626); border: 2.5px solid #ffffff; box-shadow: 0 0 22px rgba(244, 63, 94, 0.9); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 12px; font-family: sans-serif;">
                H+
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
      } else {
        const colorBg = isGoodCapacity ? '#059669' : '#d97706';
        const colorBorder = isGoodCapacity ? '#34d399' : '#fbbf24';
        icon = L.divIcon({
          className: 'partner-hospital-marker',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background: ${colorBg}; border: 1.5px solid ${colorBorder}; border-radius: 9999px; padding: 2px 6px; font-size: 10px; font-family: monospace; font-weight: bold; color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 3px;">
                <span>H</span>
                <span style="background: rgba(0,0,0,0.4); padding: 0 3px; border-radius: 4px; font-size: 9px;">${beds}b</span>
              </div>
              <div style="width: 6px; height: 6px; transform: rotate(45deg); margin-top: -3px; background: ${colorBg};"></div>
            </div>
          `,
          iconSize: [40, 24],
          iconAnchor: [20, 24],
        });
      }

      const [hospLat, hospLng] = getHospitalCoords(hosp);
      const marker = L.marker([hospLat, hospLng], { icon }).addTo(map);

      // Interactive popup
      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'sans-serif';
      popupContent.style.minWidth = '220px';
      popupContent.style.color = '#0f172a';
      popupContent.style.padding = '3px';

      popupContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 800; font-size: 13px; color: ${isRecommended ? '#e11d48' : '#0f172a'};">
            ${isRecommended ? '★ ' : ''}${hosp.name}
          </span>
          <span style="font-size: 9px; font-family: monospace; background: #e2e8f0; padding: 1px 4px; border-radius: 3px;">
            ${hosp.level}
          </span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${hosp.address}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; font-family: monospace; margin-bottom: 6px;">
          <div style="background: #f1f5f9; padding: 3px; border-radius: 4px;">
            📍 Dist: <strong>${hosp.distanceKm || 3.5} km</strong>
          </div>
          <div style="background: #fef3c7; color: #92400e; padding: 3px; border-radius: 4px;">
            ⏱ ETA: <strong>~${hosp.estimatedDriveTimeMins || 8} mins</strong>
          </div>
          <div style="background: #ecfdf5; color: #065f46; padding: 3px; border-radius: 4px;">
            🛏 ICU Beds: <strong>${hosp.availableIcuBeds}</strong>
          </div>
          <div style="background: #eff6ff; color: #1e40af; padding: 3px; border-radius: 4px;">
            ⚡ Bays: <strong>${hosp.availableTraumaBays}</strong>
          </div>
        </div>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">
          Cath Lab: <strong style="color: ${hosp.cathLabActive ? '#059669' : '#e11d48'};">${hosp.cathLabActive ? 'READY' : 'BUSY'}</strong>
        </div>
      `;

      if (!isRecommended && onSelectHospital) {
        const selectBtn = document.createElement('button');
        selectBtn.innerText = lang === 'ta' ? 'இந்த மருத்துவமனையை தேர்ந்தெடு' : 'Select This Hospital';
        selectBtn.style.width = '100%';
        selectBtn.style.padding = '6px';
        selectBtn.style.background = '#e11d48';
        selectBtn.style.color = '#ffffff';
        selectBtn.style.fontSize = '11px';
        selectBtn.style.fontWeight = 'bold';
        selectBtn.style.borderRadius = '6px';
        selectBtn.style.border = 'none';
        selectBtn.style.cursor = 'pointer';
        selectBtn.onclick = () => {
          onSelectHospital(hosp);
          map.closePopup();
        };
        popupContent.appendChild(selectBtn);
      } else if (isRecommended) {
        const recBadge = document.createElement('div');
        recBadge.innerText = lang === 'ta' ? '✓ சிறந்த மருத்துவமனை பரிந்துரை' : '✓ AI Recommended Primary Target';
        recBadge.style.textAlign = 'center';
        recBadge.style.fontSize = '10px';
        recBadge.style.fontWeight = 'bold';
        recBadge.style.color = '#059669';
        recBadge.style.background = '#d1fae5';
        recBadge.style.padding = '4px';
        recBadge.style.borderRadius = '4px';
        popupContent.appendChild(recBadge);
      }

      marker.bindPopup(popupContent);
      partnerMarkersRef.current.push(marker);
    });

    // D. Real OSM Nearby Hospitals Layer
    if (showOsmHospitals) {
      REAL_OSM_HOSPITALS.forEach(osm => {
        const osmIcon = L.divIcon({
          className: 'osm-hospital-marker',
          html: `
            <div style="width: 14px; height: 14px; border-radius: 9999px; background: rgba(71, 85, 105, 0.9); border: 1.5px solid #cbd5e1; box-shadow: 0 1px 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 8px; font-weight: bold;" title="${osm.name}">
              +
            </div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const osmMarker = L.marker([osm.lat, osm.lng], { icon: osmIcon }).addTo(map);
        osmMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; color: #0f172a; padding: 2px;">
            <div style="font-weight: bold; margin-bottom: 2px;">${osm.name}</div>
            <div style="font-size: 10px; color: #64748b;">${osm.type} (Public OSM Registry)</div>
          </div>
        `);
        osmMarkersRef.current.push(osmMarker);
      });
    }

    // E. Route Polyline: Glowing red line (#FF4D5A) with weight 5, opacity 0.85
    if (showRoute && routeCoordinates.length >= 2) {
      // Glow underlayer
      const shadowLine = L.polyline(routeCoordinates, {
        color: '#ff4d5a',
        weight: 10,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routeShadowRef.current = shadowLine;

      // Primary crisp route
      const polyline = L.polyline(routeCoordinates, {
        color: '#FF4D5A',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routePolylineRef.current = polyline;

      // Ambulance Icon moving on route
      const ambIndex = Math.min(
        Math.floor(ambulanceProgress * (routeCoordinates.length - 1)),
        routeCoordinates.length - 1
      );
      const ambPos = routeCoordinates[ambIndex] || routeCoordinates[0];

      const ambIcon = L.divIcon({
        className: 'ambulance-route-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: ping 1.2s infinite;"></div>
            <div style="position: relative; width: 26px; height: 26px; border-radius: 7px; background: #ffffff; border: 2px solid #ef4444; box-shadow: 0 0 14px rgba(239, 68, 68, 0.9); display: flex; align-items: center; justify-content: center; font-size: 13px;">
              🚑
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const ambMarker = L.marker(ambPos, { icon: ambIcon }).addTo(map);
      ambMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; color: #0f172a; padding: 2px;">
          <div style="font-weight: bold; color: #dc2626;">🚑 Emergency Ambulance En Route</div>
          <div style="font-size: 10px; color: #475569;">ETA: ~${etaRemainingMins} mins | Distance: ${routeDistanceKm} km</div>
        </div>
      `);
      ambulanceMarkerRef.current = ambMarker;

      if (followAmbulance) {
        map.panTo(ambPos, { animate: true, duration: 0.8 });
      } else if (selectedHospital) {
        const [hLat, hLng] = getHospitalCoords(selectedHospital);
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [hLat, hLng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [
    userLocation,
    selectedHospital,
    allHospitals,
    routeCoordinates,
    showPartnerHospitals,
    showOsmHospitals,
    showLocalities,
    showRoute,
    ambulanceProgress,
    followAmbulance,
    filterCurrentHospitalOnly,
    lang,
    onSelectHospital,
  ]);

  // 4. Animate Ambulance Progress along Route
  useEffect(() => {
    const timer = setInterval(() => {
      setAmbulanceProgress(prev => {
        if (prev >= 0.95) return 0.1;
        return prev + 0.04;
      });
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  // Controls Handlers
  const handleLocateMe = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
        duration: 1.2,
      });
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      // Default view: Chennai and surroundings, fitBounds [[12.60, 79.70], [13.50, 80.60]]
      mapInstanceRef.current.fitBounds(
        [
          [12.60, 79.70],
          [13.50, 80.60],
        ],
        { padding: [20, 20] }
      );
    }
  };

  const handleFitRoute = () => {
    if (mapInstanceRef.current && selectedHospital) {
      const [hLat, hLng] = getHospitalCoords(selectedHospital);
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [hLat, hLng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  const googleMapsUrl = selectedHospital
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${getHospitalCoords(selectedHospital)[0]},${getHospitalCoords(selectedHospital)[1]}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=hospitals+near+me`;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      style={{
        height: isFullscreen ? '100dvh' : height || (compact ? '360px' : '580px'),
        minHeight: compact ? '320px' : '420px',
      }}
    >
      {/* 2D Leaflet Container - ALWAYS Rendered and Visible */}
      <div
        ref={containerRef}
        className="w-full h-full z-0 bg-[#0A1A3C]"
        style={{ minHeight: '300px' }}
      />

      {/* Top Banner Status Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Dispatch & Route Info Pill */}
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xl flex items-center gap-2.5 text-xs font-mono text-white">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold text-rose-400 uppercase">
              {lang === 'ta' ? 'அவசர வழித்தடம்' : 'EMERGENCY RADAR'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ETA: <strong>~{etaRemainingMins} mins</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-300 hidden sm:inline">
            Dist: <strong>{routeDistanceKm} km</strong>
          </div>
          {usingBackupTiles && (
            <span className="bg-amber-950 text-amber-300 border border-amber-700 px-1.5 py-0.5 rounded text-[10px]">
              backup map
            </span>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-xl">
          <button
            onClick={handleLocateMe}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Locate patient distress position"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={handleFitRoute}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Fit user & recommended hospital into view"
          >
            <Compass className="w-4 h-4 text-rose-400" />
          </button>

          <button
            onClick={() => setFollowAmbulance(!followAmbulance)}
            className={`p-1.5 rounded-lg transition cursor-pointer text-[10px] font-mono px-2 font-bold flex items-center gap-1 ${
              followAmbulance ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Lock camera to follow the ambulance"
          >
            <Car className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Follow</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-mono"
            title="Open route in Google Maps navigation"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Google Maps</span>
          </a>

          <button
            onClick={handleResetView}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer text-[10px] font-mono px-2 font-bold"
            title="Reset to Chennai metropolitan region"
          >
            Reset
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Diagnostics Panel for ?debug=1 */}
      {showDiagnostics && (
        <div className="absolute top-14 left-3 z-20 pointer-events-auto bg-slate-950/95 border border-amber-500/80 rounded-xl p-3 shadow-2xl text-[10px] font-mono max-w-xs text-slate-200 space-y-1">
          <div className="font-bold text-amber-400 flex items-center justify-between">
            <span>MAP DIAGNOSTICS (?debug=1)</span>
            <button onClick={() => setShowDiagnostics(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div>Provider: <strong className="text-emerald-400">{activeProvider}</strong></div>
          <div>Backup Tiles Active: <strong className={usingBackupTiles ? 'text-amber-400' : 'text-slate-400'}>{String(usingBackupTiles)}</strong></div>
          <div>Points in Route: <strong className="text-sky-400">{routeCoordinates.length}</strong></div>
          <div>User Lat/Lng: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</div>
          <div>Target Hospital: {selectedHospital?.shortName || 'None'}</div>
          {lastError && <div className="text-rose-400 truncate">Last Err: {lastError}</div>}
        </div>
      )}

      {/* Bottom Layer Controls & Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Toggles */}
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 flex items-center gap-1 text-[11px] font-mono shadow-xl">
          <span className="text-slate-400 px-1 text-[10px] uppercase font-bold flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Layers:</span>
          </span>

          <button
            onClick={() => setShowPartnerHospitals(!showPartnerHospitals)}
            className={`px-2 py-0.5 rounded transition cursor-pointer font-bold ${
              showPartnerHospitals ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {lang === 'ta' ? 'மருத்துவமனைகள்' : 'Hospitals'}
          </button>

          <button
            onClick={() => setShowLocalities(!showLocalities)}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              showLocalities ? 'bg-slate-700 text-cyan-300 font-bold' : 'bg-slate-800 text-slate-400'
            }`}
            title="Toggle Greater Chennai Area Chips (Ambattur, Guindy, Tambaram...)"
          >
            {lang === 'ta' ? 'பகுதிகள்' : 'Areas'}
          </button>

          <button
            onClick={() => setShowOsmHospitals(!showOsmHospitals)}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              showOsmHospitals ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {lang === 'ta' ? 'அருகிலுள்ளவை' : 'Real OSM'}
          </button>

          <button
            onClick={() => setShowRoute(!showRoute)}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              showRoute ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {lang === 'ta' ? 'பாதை' : 'Route'}
          </button>
        </div>

        {/* Legend Pill & Google Maps navigation link */}
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-3 text-[10px] font-mono shadow-xl text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span>{lang === 'ta' ? 'நோயாளி' : 'Patient'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span>{lang === 'ta' ? 'பரிந்துரை' : 'Target ER'}</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{lang === 'ta' ? 'படுக்கை தயார்' : 'Beds Free'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
