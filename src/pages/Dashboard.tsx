import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import {
  ShieldAlert,
  History,
  FileSearch,
  BellRing,
  PhoneCall,
  Activity,
  CloudRain,
  Wind,
  Thermometer,
  ArrowUpRight
} from 'lucide-react';

interface RiskReport {
  _id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  rainfall: number;
  windSpeed: number;
  temperature: number;
  riskScore: number;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const [history, setHistory] = useState<RiskReport[]>([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [historyRes, alertsRes] = await Promise.all([
          api.get('/risk/history'),
          api.get('/alerts')
        ]);
        setHistory(historyRes.data);
        setActiveAlertsCount(alertsRes.data.length);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRiskLevelStyles = (level: string) => {
    switch (level) {
      case 'High Risk':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'Medium Risk':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-950/20 via-slate-900/60 to-slate-900 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white">early-warning command center</h2>
          <p className="text-slate-400 text-xs mt-1">DisasterGuard AI is monitoring weather conditions and telemetry feeds.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/search"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/15 hover:shadow-red-600/25 transition-all flex items-center gap-2"
          >
            <FileSearch size={14} />
            <span>Analyze Location Risk</span>
          </Link>
          <Link
            to="/map"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <Activity size={14} />
            <span>View Live Map</span>
          </Link>
        </div>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex items-center gap-5 hover:border-slate-750 transition-all group">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
            <BellRing size={22} />
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Active Warnings</h4>
            <div className="text-2xl font-black text-white mt-1">{activeAlertsCount}</div>
          </div>
        </div>

        <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex items-center gap-5 hover:border-slate-750 transition-all group">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
            <History size={22} />
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Your Reports</h4>
            <div className="text-2xl font-black text-white mt-1">{history.length}</div>
          </div>
        </div>

        <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex items-center gap-5 hover:border-slate-750 transition-all group">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Risk Level</h4>
            <div className="text-sm font-bold text-white mt-2">
              {history.length > 0 ? (
                <span className={`px-2 py-0.5 rounded-full border text-[10px] ${getRiskLevelStyles(history[0].riskLevel)}`}>
                  {history[0].riskLevel}
                </span>
              ) : (
                <span className="text-slate-500">No data</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex items-center gap-5 hover:border-slate-750 transition-all group">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
            <PhoneCall size={22} />
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Resources</h4>
            <div className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">
              <span>Overpass Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Reports List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-200 tracking-tight flex items-center gap-2">
              <History size={18} className="text-red-500" />
              <span>Your Recent Risk Analyses</span>
            </h3>
            {history.length > 5 && (
              <Link to="/search" className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
                <span>View all</span>
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="glass-panel border border-slate-800/80 rounded-2xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <span className="text-xs text-slate-400">Loading analysis history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="glass-panel border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
              <FileSearch size={36} className="text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-350">No disaster reports generated yet</h4>
                <p className="text-xs text-slate-500">Run a location search to calculate and save early warning reports.</p>
              </div>
              <Link
                to="/search"
                className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Start Location Check
              </Link>
            </div>
          ) : (
            <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      <th className="p-4">Location</th>
                      <th className="p-4">Risk Level</th>
                      <th className="p-4">Telemetry</th>
                      <th className="p-4">Checked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {history.slice(0, 5).map((report) => (
                      <tr key={report._id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-slate-200">{report.locationName}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-200">{report.riskScore}%</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold ${getRiskLevelStyles(report.riskLevel)}`}>
                              {report.riskLevel}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3.5 text-slate-400">
                            <span className="flex items-center gap-1" title="Rainfall">
                              <CloudRain size={13} className="text-blue-500" />
                              <span>{report.rainfall.toFixed(1)} mm</span>
                            </span>
                            <span className="flex items-center gap-1" title="Wind Speed">
                              <Wind size={13} className="text-sky-400" />
                              <span>{report.windSpeed.toFixed(1)} km/h</span>
                            </span>
                            <span className="flex items-center gap-1" title="Temperature">
                              <Thermometer size={13} className="text-amber-500" />
                              <span>{report.temperature.toFixed(1)}°C</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Emergency Protocol card */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-slate-200 tracking-tight flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-500" />
            <span>Emergency Guidelines</span>
          </h3>

          <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 space-y-5">
            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5">For High Risk Alerts</h4>
              <p className="text-[11px] text-red-200/80 leading-relaxed">
                Immediately pack emergency papers, water, dried food, and flashlights. Power down major electric lines and move to elevated safety centers or local shelters.
              </p>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">For Medium Risk Warnings</h4>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Secure lose objects outside. Unplug appliances that could short circuit. Keep local weather streams running. Avoid driving through flooded streets or underpasses.
              </p>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/resources"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-350 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                <PhoneCall size={14} />
                <span>Locate Rescue Stations</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
