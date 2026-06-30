import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import axios from 'axios';
import {
  Search,
  CloudRain,
  Wind,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  Loader,
  Navigation,
  Globe,
  Sliders,
  History
} from 'lucide-react';

interface RiskReport {
  _id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  rainfall: number;
  windSpeed: number;
  temperature: number;
  floodHistory: number;
  lowElevation: number;
  riskScore: number;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  recommendation: string;
  createdAt: string;
  forecast?: { date: string; rainSum: number; rainProb: number }[];
}

export const LocationSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Coordinate / Location state
  const [latitude, setLatitude] = useState('6.9271');
  const [longitude, setLongitude] = useState('79.8612');
  const [locationName, setLocationName] = useState('Colombo, Sri Lanka');

  // Input Factors
  const [floodHistory, setFloodHistory] = useState<number>(3);
  const [lowElevation, setLowElevation] = useState<number>(4);

  // Result / History
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<RiskReport | null>(null);
  const [history, setHistory] = useState<RiskReport[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Debounced autocomplete for location search queries
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      setErrorMsg(null);
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        setSearchResults(response.data);
      } catch (err) {
        console.error('Nominatim query error:', err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/risk/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching report history:', err);
    }
  };

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setErrorMsg(null);
    setSearchResults([]);

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setErrorMsg('No location matches found.');
      }
    } catch (err) {
      console.error('Nominatim query error:', err);
      setErrorMsg('Failed to query locations database.');
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setLatitude(lat.toFixed(4));
    setLongitude(lon.toFixed(4));
    setLocationName(item.display_name.split(',').slice(0, 3).join(',').trim());
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRunAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setCurrentReport(null);

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setErrorMsg('Invalid latitude/longitude coordinates.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/risk/calculate', {
        latitude: latNum,
        longitude: lonNum,
        locationName,
        floodHistory,
        lowElevation,
      });
      setCurrentReport(res.data);
      fetchHistory(); // refresh history list
    } catch (err: any) {
      console.error('Calculation API call error:', err);
      setErrorMsg(err.response?.data?.message || 'Server error occurred during assessment.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-500 stroke-red-500';
    if (score >= 40) return 'text-amber-500 stroke-amber-500';
    return 'text-emerald-500 stroke-emerald-500';
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Globe size={22} className="text-red-500" />
          <span>Location Early Warning assessment</span>
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">Input targeted coordinates or query municipalities to calculate structured vulnerability scorecards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Inputs & Search Form */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Card 1: Resolve Location */}
          <div className="glass-panel border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
              <Search size={14} className="text-red-500" />
              <span>1. Target Location</span>
            </h3>

            {/* Search Input and Dropdown */}
            <div className="relative">
              <form onSubmit={handleLocationSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Query city or place..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 focus:border-red-500 focus:outline-none text-xs text-slate-100 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {searching ? <Loader size={12} className="animate-spin" /> : 'Search'}
                </button>
              </form>

              {/* Search Results Dropdown (Floated) */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 z-50 bg-slate-900 border border-slate-800 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-800/50 shadow-2xl">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSearchResult(item)}
                      className="w-full text-left p-2 hover:bg-slate-800 text-[10px] text-slate-350 truncate block cursor-pointer transition-colors"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Lat/Lon Override */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 focus:border-red-500 focus:outline-none text-xs text-slate-300 font-mono rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 focus:border-red-500 focus:outline-none text-xs text-slate-300 font-mono rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Location Label</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 focus:border-red-500 focus:outline-none text-xs text-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Card 2: Sliders Config */}
          <div className="glass-panel border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
              <Sliders size={14} className="text-red-500" />
              <span>2. Environmental Factors</span>
            </h3>

            {/* Flood History factor */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-400">Flood History</span>
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
            </div>

            {/* Elevation Vulnerability Factor */}
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
            </div>

            <button
              onClick={handleRunAssessment}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 disabled:from-slate-850 disabled:to-slate-850 disabled:text-slate-550 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/10"
            >
              {loading ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  <span>Calculating telemetry...</span>
                </>
              ) : (
                <span>Analyze Disaster Risk</span>
              )}
            </button>
          </div>

        </div>

        {/* Right Columns: Analysis Result Scorecard */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {currentReport ? (
            <div className="glass-panel border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
              
              {/* Scorecard Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-800/80 gap-6">
                <div className="text-center sm:text-left space-y-1">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-[10px] text-red-400 font-mono uppercase">
                    Early Warning Report
                  </span>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-white leading-tight">{currentReport.locationName}</h3>
                    {currentReport.rainfall > 0 && (
                      <span className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/50 text-[9px] font-bold text-blue-300 uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <CloudRain size={10} /> Currently Raining
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[10px] font-mono">
                    COORDS: {currentReport.latitude.toFixed(4)}°N, {currentReport.longitude.toFixed(4)}°E
                  </p>
                </div>

                {/* Circular Progress Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      fill="transparent"
                      strokeDasharray="289"
                      strokeDashoffset={289 - (289 * currentReport.riskScore) / 100}
                      strokeWidth="8"
                      className={`transition-all duration-1000 ease-out ${getRiskScoreColor(currentReport.riskScore)}`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-white">{currentReport.riskScore}%</span>
                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Score</div>
                  </div>
                </div>
              </div>

              {/* Scorecard Body: Parameters Breakdown & Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Weather Metrics */}
                <div className="sm:col-span-1 bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-900">
                    Weather Telemetry
                  </h4>
                  
                  <div className="space-y-3.5 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <CloudRain size={14} className="text-blue-500" />
                        Rainfall
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{currentReport.rainfall.toFixed(1)} mm</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Wind size={14} className="text-sky-400" />
                        Wind Speed
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{currentReport.windSpeed.toFixed(1)} km/h</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Thermometer size={14} className="text-amber-500" />
                        Temperature
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{currentReport.temperature.toFixed(1)}°C</span>
                    </div>
                  </div>

                  {/* Future Forecast block */}
                  {currentReport.forecast && currentReport.forecast.length > 0 && (
                    <div className="pt-3 border-t border-slate-900 space-y-2.5">
                      <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        3-Day Rain Forecast
                      </h4>
                      {currentReport.forecast.map((f, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {new Date(f.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-bold text-blue-300 font-mono">
                            {f.rainSum > 0 ? `${f.rainSum.toFixed(1)}mm (${f.rainProb}%)` : 'No rain'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vulnerability factors */}
                <div className="sm:col-span-1 bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-900">
                    Vulnerability Indicators
                  </h4>
                  
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <History size={14} className="text-red-400" />
                        Flood History
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{currentReport.floodHistory}/10</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Navigation size={14} className="text-red-400 rotate-45" />
                        Low Elevation
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{currentReport.lowElevation}/10</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Globe size={14} className="text-purple-400" />
                        Elevation Risk
                      </span>
                      <span className="text-xs font-bold text-white">
                        {currentReport.lowElevation >= 7 ? 'Critical' : currentReport.lowElevation >= 4 ? 'Moderate' : 'Stable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Threat assessment summary */}
                <div className="sm:col-span-1 bg-slate-950/60 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-900">
                      Vulnerability Level
                    </h4>
                    <div className="text-center py-2">
                      <div className={`inline-block px-3 py-1 rounded-full border text-xs font-extrabold uppercase ${getRiskScoreColor(currentReport.riskScore)}`}>
                        {currentReport.riskLevel}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 italic text-center mt-4">
                    Calculated using standard DisasterGuard formula v1.0.
                  </div>
                </div>

              </div>

              {/* Recommendations Box */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert size={16} />
                  <span>Early Action Directive</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {currentReport.recommendation}
                </p>
              </div>

            </div>
          ) : (
            <div className="glass-panel border border-slate-800 rounded-2xl p-16 text-center space-y-4">
              <ShieldCheck size={48} className="text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-350">Vulnerability Assessment Engine</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Resolve a target location using the search form or manual coordinates, then click analyze to print out early warning reports.
                </p>
              </div>
            </div>
          )}

          {/* Historical archive of this page */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-200 tracking-tight flex items-center gap-2 text-sm uppercase">
              <History size={16} className="text-red-500" />
              <span>Assessment Archive</span>
            </h3>

            {history.length === 0 ? (
              <div className="p-6 bg-slate-950/30 border border-slate-850 rounded-xl text-center text-xs text-slate-500">
                No past assessments found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {history.slice(0, 4).map((report) => (
                  <div key={report._id} className="p-4 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-800 rounded-xl transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{report.locationName}</h4>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
                        <span>{report.riskScore}% Score</span>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${report.riskLevel === 'High Risk' ? 'bg-red-500' : report.riskLevel === 'Medium Risk' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentReport(report)}
                      className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-800 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
export default LocationSearchPage;
