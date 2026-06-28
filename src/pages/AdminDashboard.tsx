import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Settings,
  BellRing,
  Activity,
  FileSpreadsheet,
  Trash2,
  Send,
  Loader,
  Users,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface User {
  name: string;
  email: string;
}

interface RiskReport {
  _id: string;
  userId?: User;
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

interface Alert {
  _id: string;
  message: string;
  locationName: string;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<RiskReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Alert Form
  const [manualMessage, setManualMessage] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [manualLevel, setManualLevel] = useState<'Low Risk' | 'Medium Risk' | 'High Risk'>('Medium Risk');
  const [broadcasting, setBroadcasting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [reportsRes, alertsRes] = await Promise.all([
        api.get('/risk/all'),
        api.get('/alerts')
      ]);
      setReports(reportsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(alerts.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Error deleting alert:', err);
      alert('Failed to delete alert.');
    }
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!manualMessage.trim() || !manualLocation.trim()) {
      setFormError('Please fill in all alert fields.');
      return;
    }

    setBroadcasting(true);
    try {
      const res = await api.post('/alerts', {
        message: manualMessage,
        locationName: manualLocation,
        riskLevel: manualLevel
      });
      setAlerts([res.data, ...alerts]);
      setManualMessage('');
      setManualLocation('');
      setFormSuccess('Alert broadcasted successfully.');
    } catch (err: any) {
      console.error('Error broadcasting alert:', err);
      setFormError(err.response?.data?.message || 'Failed to broadcast alert.');
    } finally {
      setBroadcasting(false);
    }
  };

  // Process data for charts
  const getRiskLevelChartData = () => {
    const counts = { 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0 };
    reports.forEach((r) => {
      if (counts[r.riskLevel] !== undefined) {
        counts[r.riskLevel]++;
      }
    });

    return [
      { name: 'Low Risk', value: counts['Low Risk'], color: '#10b981' },
      { name: 'Medium Risk', value: counts['Medium Risk'], color: '#f59e0b' },
      { name: 'High Risk', value: counts['High Risk'], color: '#ef4444' }
    ].filter((item) => item.value > 0);
  };

  const getRecentAveragesData = () => {
    // Group reports by location and find average score
    const locationScores: Record<string, { total: number; count: number }> = {};
    reports.forEach((r) => {
      if (!locationScores[r.locationName]) {
        locationScores[r.locationName] = { total: 0, count: 0 };
      }
      locationScores[r.locationName].total += r.riskScore;
      locationScores[r.locationName].count++;
    });

    return Object.entries(locationScores)
      .map(([name, data]) => ({
        name: name.split(',')[0],
        averageScore: Math.round(data.total / data.count)
      }))
      .slice(0, 5); // top 5
  };

  const pieData = getRiskLevelChartData();
  const barData = getRecentAveragesData();
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const highRiskLocations = reports.filter((r) => r.riskLevel === 'High Risk');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings size={22} className="text-red-500" />
          <span>System Administration Panel</span>
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">Control disaster warnings, review user logs, and track regional early detection statistics.</p>
      </div>

      {loading ? (
        <div className="glass-panel border border-slate-800 rounded-2xl p-24 text-center">
          <Loader size={24} className="animate-spin text-red-500 mx-auto mb-4" />
          <span className="text-xs text-slate-400">Loading system metrics database...</span>
        </div>
      ) : (
        <>
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                <ShieldAlert size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Reports</span>
                <span className="text-2xl font-black text-white mt-1">{reports.length}</span>
              </div>
            </div>

            <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <BellRing size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Alerts</span>
                <span className="text-2xl font-black text-white mt-1">{alerts.length}</span>
              </div>
            </div>

            <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                <Trash2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">High-Risk Points</span>
                <span className="text-2xl font-black text-rose-550 mt-1">{highRiskLocations.length}</span>
              </div>
            </div>

            <div className="p-6 glass-panel rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Monitoring Active</span>
                <span className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Operational</span>
                </span>
              </div>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Risk Levels distribution */}
            <div className="glass-panel border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
                <Activity size={14} className="text-red-500" />
                <span>Risk Level Breakdown</span>
              </h3>

              {pieData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-500 text-xs">No chart data generated yet.</div>
              ) : (
                <div className="h-[250px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Average Risk by Location */}
            <div className="glass-panel border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
                <TrendingUp size={14} className="text-red-500" />
                <span>Vulnerable Regional Risk Scores</span>
              </h3>

              {barData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-500 text-xs">No chart data generated yet.</div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="averageScore" fill="#ef4444" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.averageScore >= 70 ? '#ef4444' : entry.averageScore >= 40 ? '#f59e0b' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Central Controls: Manual Broadcast & Alert Listing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Alert Creator Form - Col-Span 1 */}
            <div className="lg:col-span-1 glass-panel border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800/80 mb-4">
                  <Send size={14} className="text-red-500" />
                  <span>Manual Alert Broadcast</span>
                </h3>

                {(formError || formSuccess) && (
                  <div className={`p-3 rounded-xl text-xs mb-4 ${formError ? 'bg-red-950/20 border border-red-900/40 text-red-200' : 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-200'}`}>
                    {formError || formSuccess}
                  </div>
                )}

                <form onSubmit={handleBroadcastAlert} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Target Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Galle Fort, LK"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-red-500 focus:outline-none text-xs text-slate-100 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Risk Severity</label>
                    <select
                      value={manualLevel}
                      onChange={(e) => setManualLevel(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-red-500 focus:outline-none text-xs text-slate-350 rounded-xl"
                    >
                      <option value="Low Risk">Low Risk Warning</option>
                      <option value="Medium Risk">Medium Risk Warning</option>
                      <option value="High Risk">High Risk Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Alert Message</label>
                    <textarea
                      placeholder="Type details, warnings, instructions..."
                      value={manualMessage}
                      onChange={(e) => setManualMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-red-500 focus:outline-none text-xs text-slate-100 rounded-xl resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/10"
                  >
                    {broadcasting ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                    <span>Broadcast Alert</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Broadcast log - Col-Span 2 */}
            <div className="lg:col-span-2 glass-panel border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-slate-800 bg-slate-900/30">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Active alerts ({alerts.length})</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {alerts.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 text-xs">No active alerts.</div>
                ) : (
                  alerts.map((al) => (
                    <div key={al._id} className="p-3.5 bg-slate-900/30 border border-slate-850 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg text-red-500">
                        <ShieldAlert size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            al.riskLevel === 'High Risk' ? 'bg-red-500/10 text-red-400 border border-red-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                          }`}>
                            {al.riskLevel}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                            <MapPin size={11} />
                            {al.locationName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-350 mt-2 font-medium leading-relaxed">{al.message}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(al._id)}
                        className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete Alert"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Database Reports Archive table */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-200 tracking-tight flex items-center gap-2 text-sm uppercase">
              <FileSpreadsheet size={16} className="text-red-500" />
              <span>Full Risk Reports Log</span>
            </h3>

            {reports.length === 0 ? (
              <div className="p-12 glass-panel border border-slate-800 text-center text-xs text-slate-500">
                No reports generated on the network yet.
              </div>
            ) : (
              <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Level</th>
                        <th className="p-4">Rain / Wind</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                      {reports.map((rep) => (
                        <tr key={rep._id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-200">{rep.userId?.name ?? 'Guest User'}</div>
                            <div className="text-[9px] text-slate-500">{rep.userId?.email ?? 'N/A'}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-350">{rep.locationName}</div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              ({rep.latitude.toFixed(3)}, {rep.longitude.toFixed(3)})
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-200">{rep.riskScore}%</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              rep.riskLevel === 'High Risk' ? 'text-red-400 bg-red-500/10' : rep.riskLevel === 'Medium Risk' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                            }`}>
                              {rep.riskLevel}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 font-mono">
                            {rep.rainfall.toFixed(1)}mm / {rep.windSpeed.toFixed(1)}km/h
                          </td>
                          <td className="p-4 text-slate-500">
                            {new Date(rep.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default AdminDashboard;
