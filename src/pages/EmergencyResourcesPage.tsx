import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../context/AuthContext';
import axios from 'axios';
import {
  PhoneCall,
  Search,
  MapPin,
  ShieldCheck,
  Building,
  AlertTriangle,
  Loader,
  Navigation,
  ExternalLink,
  Flame,
  ShieldAlert,
  Compass,
  Phone
} from 'lucide-react';

interface EmergencyResource {
  id: number;
  name: string;
  type: 'hospital' | 'police' | 'fire_station' | 'shelter';
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  website: string;
}

// Map helper to pan view to location coordinates
const ChangeMapView: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
};

// Create custom icons representing emergency facility types
const createResourceIcon = (type: string) => {
  let color = '#3b82f6'; // default blue
  let symbol = '🏠';

  if (type === 'hospital') {
    color = '#ef4444'; // red
    symbol = '🏥';
  } else if (type === 'police') {
    color = '#2563eb'; // dark blue
    symbol = '👮';
  } else if (type === 'fire_station') {
    color = '#ea580c'; // orange
    symbol = '🔥';
  } else if (type === 'shelter') {
    color = '#16a34a'; // green
    symbol = '⛺';
  }

  return L.divIcon({
    className: 'custom-resource-icon',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px;">
        ${symbol}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const EmergencyResourcesPage: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([6.9271, 79.8612]);
  const [locationLabel, setLocationLabel] = useState('Colombo Command Center');

  // Search input
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Resources state
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<EmergencyResource | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchResources(selectedCoords[0], selectedCoords[1]);
  }, [selectedCoords]);

  const fetchResources = async (lat: number, lon: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get(`/resources/nearby?lat=${lat}&lon=${lon}`);
      setResources(response.data);
    } catch (err: any) {
      console.error('Error fetching emergency resources:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to query emergency resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setSelectedCoords([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=11`
      );
      if (response.data && response.data.display_name) {
        setLocationLabel(response.data.display_name.split(',').slice(0, 2).join(',').trim());
      } else {
        setLocationLabel(`Target Area (${lat.toFixed(3)}, ${lon.toFixed(3)})`);
      }
    } catch {
      setLocationLabel(`Target Area (${lat.toFixed(3)}, ${lon.toFixed(3)})`);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setErrorMsg(null);

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      if (response.data && response.data.length > 0) {
        const firstResult = response.data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);

        setSelectedCoords([lat, lon]);
        setMapCenter([lat, lon]);
        setLocationLabel(firstResult.display_name.split(',').slice(0, 2).join(',').trim());
      } else {
        setErrorMsg('Location not found. Try search queries like "Colombo", "Galle", "Kandy".');
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorMsg('Failed to search coordinates.');
    } finally {
      setSearching(false);
    }
  };

  // Map click listener component
  const MapClickEvents = () => {
    useMapEvents({
      click: handleMapClick
    });
    return null;
  };

  const handleFocusResource = (resource: EmergencyResource) => {
    setSelectedResource(resource);
    setMapCenter([resource.latitude, resource.longitude]);
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'text-red-500 bg-red-500/10 border-red-500/25';
      case 'police':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/25';
      case 'fire_station':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/25';
      default:
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <PhoneCall size={22} className="text-red-500" />
            <span>Emergency Resources Finder</span>
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Find nearby hospitals, police stations, fire stations, and shelters within a 5km radius.</p>
        </div>

        {/* Nominatim Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center relative">
          <input
            type="text"
            placeholder="Search address or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 bg-slate-900 border border-slate-800 focus:border-red-500 focus:outline-none text-xs text-slate-100 rounded-xl"
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={14} />
          </span>
          <button
            type="submit"
            disabled={searching}
            className="absolute right-2 px-3 py-1.5 bg-slate-850 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            {searching ? <Loader size={10} className="animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/20 border border-red-900/35 rounded-xl text-xs text-red-200">
          {errorMsg}
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Resources List - Col-Span 1 */}
        <div className="lg:col-span-1 space-y-4 flex flex-col max-h-[500px]">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Selected Target Area</span>
            <div className="text-sm font-extrabold text-white mt-1 truncate">{locationLabel}</div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Lat: {selectedCoords[0].toFixed(4)}° / Lon: {selectedCoords[1].toFixed(4)}°
            </p>
          </div>

          <div className="flex-1 glass-panel border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Nearby resources ({resources.length})</h3>
              {loading && <Loader size={12} className="animate-spin text-red-500" />}
            </div>

            {/* Scrollable List container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {resources.length === 0 && !loading ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <Compass size={24} className="mx-auto mb-2 text-slate-600 animate-spin" />
                  <span>No resources indexed nearby. Click map or search above.</span>
                </div>
              ) : (
                resources.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleFocusResource(res)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedResource?.id === res.id
                        ? 'bg-slate-800/80 border-slate-700 shadow-md'
                        : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/80 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-200 leading-tight">{res.name}</h4>
                      <span className={`px-2 py-0.5 rounded border text-[8px] font-extrabold uppercase shrink-0 ${getResourceTypeColor(res.type)}`}>
                        {res.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 truncate">{res.address}</p>
                    
                    <div className="mt-3 pt-2.5 border-t border-slate-850/60 flex justify-between items-center text-[9px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone size={10} />
                        {res.phone !== 'N/A' ? res.phone : 'No Phone'}
                      </span>
                      {res.website !== 'N/A' && (
                        <a
                          href={res.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-red-400 hover:text-red-300 flex items-center gap-0.5 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Site</span>
                          <ExternalLink size={8} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Map - Col-Span 2 */}
        <div className="lg:col-span-2 h-[500px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-xl">
          <MapContainer center={mapCenter} zoom={13} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapClickEvents />
            <ChangeMapView coords={mapCenter} />

            {/* Target Marker */}
            <Marker position={selectedCoords}>
              <Popup>
                <div className="text-slate-900 font-sans p-1 text-xs">
                  <h4 className="font-bold">Target Center Point</h4>
                  <p className="mt-1">Searching nearby...</p>
                </div>
              </Popup>
            </Marker>

            {/* Emergency Places Markers */}
            {resources.map((res) => (
              <Marker
                key={res.id}
                position={[res.latitude, res.longitude]}
                icon={createResourceIcon(res.type)}
                eventHandlers={{
                  click: () => setSelectedResource(res)
                }}
              >
                <Popup>
                  <div className="text-slate-900 font-sans p-1.5 text-xs w-48 space-y-1.5">
                    <h4 className="font-bold border-b border-slate-200 pb-1 text-slate-850 leading-tight">{res.name}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Type:</span>
                      <span className="text-[10px] font-semibold text-red-600 uppercase">{res.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{res.address}</p>
                    <p className="text-[10px] text-slate-500">Phone: {res.phone}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute bottom-4 right-4 z-40 bg-slate-900/95 border border-slate-800 px-3 py-2 rounded-xl shadow-lg space-y-1 text-[9px] font-semibold text-slate-400">
            <span className="text-slate-200 uppercase tracking-widest text-[8px] font-bold block mb-1">Color Legend</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span>Hospitals / Clinics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              <span>Police Stations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
              <span>Fire Stations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
              <span>Emergency Shelters</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default EmergencyResourcesPage;
