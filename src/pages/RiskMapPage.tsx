import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { api } from '../context/AuthContext';
import {
  MapPin,
  Search,
  Sliders,
  CloudRain,
  Wind,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Loader,
  Navigation
} from 'lucide-react';

// Setup Map component to dynamically pan view when selected location changes
const ChangeMapView: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
};

// Create custom colored markers representing risk levels
const createRiskIcon = (level: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'pending') => {
  let color = '#3b82f6'; // blue for pending
  let border = 'white';
  
  if (level === 'Low Risk') color = '#10b981'; // green
  if (level === 'Medium Risk') color = '#f59e0b'; // yellow
  if (level === 'High Risk') {
    color = '#ef4444'; // red
    border = '#fef2f2';
  }

  return L.divIcon({
    className: 'custom-risk-marker',
    html: `
      <div style="position: relative; display: flex; items-center; justify-content: center;">
        <div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid ${border}; box-shadow: 0 0 10px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: white;"></div>
        </div>
        ${level === 'High Risk' ? `<span style="position: absolute; top: -2px; left: -2px; display: inline-flex; border-radius: 9999px; height: 26px; width: 26px; border: 2px solid #ef4444; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

interface CalculatedRisk {
  locationName: string;
  latitude: number;
  longitude: number;
  rainfall: number;
  windSpeed: number;
  temperature: number;
  riskScore: number;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  recommendation: string;
}

export const RiskMapPage: React.FC = () => {
  // Center map on Colombo, Sri Lanka by default
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]);
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([6.9271, 79.8612]);
  const [locationName, setLocationName] = useState('Colombo, Sri Lanka');
  
  // Vulnerability Inputs
  const [floodHistory, setFloodHistory] = useState<number>(3);
  const [lowElevation, setLowElevation] = useState<number>(4);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  
  // Risk calculation state
  const [calculating, setCalculating] = useState(false);
  const [riskResult, setRiskResult] = useState<CalculatedRisk | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reverse geocode when coordinates change using Nominatim (free, no-key)
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
      );
      if (response.data && response.data.display_name) {
        // Truncate name for card display
        const nameParts = response.data.display_name.split(',');
        const shortName = nameParts.slice(0, 3).join(',').trim();
        setLocationName(shortName);
      } else {
        setLocationName(`Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
      }
    } catch (err) {
      console.warn('Reverse geocoding failed, using coordinates as name');
      setLocationName(`Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    }
  };

  // Map click listener component
  const MapClickEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedCoords([lat, lng]);
        reverseGeocode(lat, lng);
      }
    });
    return null;
  };

  // Handle location search query resolution
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

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
        setLocationName(firstResult.display_name.split(',').slice(0, 3).join(',').trim());
      } else {
        setError('Location not found. Please try another term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to query map location.');
    } finally {
      setSearching(false);
    }
  };

  // Execute disaster risk assessment API
  const handleCalculateRisk = async () => {
    setCalculating(true);
    setError(null);
    setRiskResult(null);

    try {
      const response = await api.post('/risk/calculate', {
        latitude: selectedCoords[0],
        longitude: selectedCoords[1],
        locationName,
        floodHistory,
        lowElevation
      });
      setRiskResult(response.data);
    } catch (err: any) {
      console.error('Risk calculation call failed:', err);
      setError(err.response?.data?.message || 'Error occurred while calculating risk.');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MapPin size={22} className="text-red-500" />
            <span>Interactive Risk Map</span>
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Click any location on the map or search above to calculate early risk scores.</p>
        </div>

        {/* Nominatim Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center relative">
          <input
            type="text"
            placeholder="Search city, district, country..."
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
            {searching ? <Loader size={10} className="animate-spin" /> : 'Locate'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/35 rounded-xl text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Container - Col-Span 2 */}
        <div className="lg:col-span-2 h-[500px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-xl">
          <MapContainer center={mapCenter} zoom={11} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <MapClickEvents />
            <ChangeMapView coords={mapCenter} />

            {/* Selected Point Marker */}
            <Marker
              position={selectedCoords}
              icon={createRiskIcon(riskResult ? riskResult.riskLevel : 'pending')}
            >
              <Popup>
                <div className="text-slate-900 font-sans p-1 text-xs">
                  <h4 className="font-bold">{locationName}</h4>
                  <p className="mt-1">Selected Location</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Map Overlay Coordinates Indicator */}
          <div className="absolute bottom-4 left-4 z-40 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
            <Navigation size={12} className="text-red-500 rotate-45" />
            <span className="text-[10px] font-mono text-slate-350">
              {selectedCoords[0].toFixed(5)}°N, {selectedCoords[1].toFixed(5)}°E
            </span>
          </div>
        </div>

        {/* Input Parameters & Prediction Panel - Col-Span 1 */}
        <div className="space-y-6">
          <div className="glass-panel border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between h-full">
            
            {/* Header / Config */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                <Sliders size={16} className="text-red-500" />
                <h3 className="font-extrabold text-slate-200 text-sm uppercase tracking-wider">Parameters</h3>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-red-500 focus:outline-none text-xs text-slate-100 rounded-xl"
                />
              </div>

              {/* Slider 1: Flood History */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Flood History Factor</span>
                  <span className="text-red-400 font-mono">{floodHistory} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={floodHistory}
                  onChange={(e) => setFloodHistory(parseFloat(e.target.value))}
                  className="w-full accent-red-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 italic">0 = Never Flooded, 10 = Extremely Flood Prone</p>
              </div>

              {/* Slider 2: Low Elevation */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Low Elevation Factor</span>
                  <span className="text-red-400 font-mono">{lowElevation} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={lowElevation}
                  onChange={(e) => setLowElevation(parseFloat(e.target.value))}
                  className="w-full accent-red-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 italic">0 = High Elevation (Safe), 10 = Low Basin (Vulnerable)</p>
              </div>

              <button
                onClick={handleCalculateRisk}
                disabled={calculating}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/10"
              >
                {calculating ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    <span>Calculating risk...</span>
                  </>
                ) : (
                  <span>Run Disaster Risk Score</span>
                )}
              </button>
            </div>

            {/* Results Block */}
            <div className="flex-1 mt-6">
              {riskResult ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3.5">
                    
                    {/* Risk Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Resulting Score</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                          riskResult.riskLevel === 'High Risk'
                            ? 'bg-red-500/10 border-red-500/35 text-red-400'
                            : riskResult.riskLevel === 'Medium Risk'
                            ? 'bg-amber-500/10 border-amber-500/35 text-amber-400'
                            : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                        }`}
                      >
                        {riskResult.riskLevel} ({riskResult.riskScore}%)
                      </span>
                    </div>

                    {/* Weather Telemetry Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-slate-400 text-[10px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                      <div>
                        <CloudRain size={13} className="text-blue-500 mx-auto mb-1" />
                        <span className="font-semibold text-slate-200">{riskResult.rainfall.toFixed(1)} mm</span>
                        <div className="text-[8px] text-slate-500 mt-0.5">Rain</div>
                      </div>
                      <div>
                        <Wind size={13} className="text-sky-400 mx-auto mb-1" />
                        <span className="font-semibold text-slate-200">{riskResult.windSpeed.toFixed(1)} km/h</span>
                        <div className="text-[8px] text-slate-500 mt-0.5">Wind</div>
                      </div>
                      <div>
                        <Thermometer size={13} className="text-amber-500 mx-auto mb-1" />
                        <span className="font-semibold text-slate-200">{riskResult.temperature.toFixed(1)}°C</span>
                        <div className="text-[8px] text-slate-500 mt-0.5">Temp</div>
                      </div>
                    </div>

                    {/* Recommendation details */}
                    <div className="text-[11px] text-slate-350 leading-relaxed border-t border-slate-800 pt-3">
                      <strong className="text-white block mb-1">Safety Directives:</strong>
                      {riskResult.recommendation}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[120px] flex items-center justify-center text-center p-6 bg-slate-950/30 border border-slate-850/60 border-dashed rounded-xl">
                  <div className="text-slate-500 text-xs">
                    <Sliders size={24} className="mx-auto text-slate-600 mb-2" />
                    <span>Adjust variables and click predict.</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
export default RiskMapPage;
