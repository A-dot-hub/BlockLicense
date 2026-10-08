import React from 'react';
import { StorageService } from '../services/storage';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileKey,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  ShieldCheck,
  Plus,
  FileCheck2,
  Search,
  ExternalLink
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const licenses = StorageService.getLicenses();
  const logs = StorageService.getVerificationLogs();

  const total = licenses.length;
  const active = licenses.filter(l => l.status === 'ACTIVE').length;
  const expired = licenses.filter(l => l.status === 'EXPIRED').length;
  const revoked = licenses.filter(l => l.status === 'REVOKED').length;
  const transferred = licenses.filter(l => l.status === 'TRANSFERRED').length;

  const statusPieData = [
    { name: 'Active', value: active, color: '#10B981' },
    { name: 'Expired', value: expired, color: '#F59E0B' },
    { name: 'Revoked', value: revoked, color: '#EF4444' },
    { name: 'Transferred', value: transferred, color: '#3B82F6' }
  ].filter(d => d.value > 0);

  // Group by software
  const softwareMap: { [key: string]: number } = {};
  licenses.forEach(l => {
    softwareMap[l.softwareName] = (softwareMap[l.softwareName] || 0) + 1;
  });
  const softwareBarData = Object.entries(softwareMap).map(([name, count]) => ({
    name: name.length > 15 ? name.slice(0, 15) + '...' : name,
    count
  }));

  // Timeline data
  const activityData = [
    { month: 'May 26', issued: 12, verified: 45 },
    { month: 'Jun 26', issued: 19, verified: 68 },
    { month: 'Jul 26', issued: 28, verified: 104 },
    { month: 'Aug 26', issued: 36, verified: 132 },
    { month: 'Sep 26', issued: 48, verified: 185 },
    { month: 'Oct 26', issued: Math.max(total, 54), verified: 215 }
  ];

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-blue-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
            License Authority Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time on-chain license registry metrics, distribution analytics, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('issue')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#013330] hover:bg-[#024945] rounded-xl transition-colors shadow-md shadow-[#013330]/20 cursor-pointer"
          >
            <Plus size={15} />
            <span>Issue License</span>
          </button>
          <button
            onClick={() => onNavigate('verify-software')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#013330] bg-white hover:bg-slate-50 border border-blue-200 rounded-xl metamask-card-shadow transition-colors cursor-pointer"
          >
            <FileCheck2 size={15} className="text-[#013330]" />
            <span>Verify Binary</span>
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Licenses', value: total, icon: FileKey, color: 'text-slate-700' },
          { label: 'Active', value: active, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Expired', value: expired, icon: Clock, color: 'text-amber-600' },
          { label: 'Revoked', value: revoked, icon: AlertTriangle, color: 'text-rose-600' },
          { label: 'Transferred', value: transferred, icon: ArrowRightLeft, color: 'text-blue-600' }
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 bg-white border border-blue-200 rounded-2xl metamask-card-shadow"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut */}
        <div className="p-6 bg-white border border-blue-200 rounded-2xl metamask-card-shadow">
          <h3 className="text-sm font-bold text-slate-900 mb-1 font-display">
            Status Breakdown
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Current state of recorded licenses</p>
          <div className="h-48 w-full flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bfdbfe', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No license data</div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100 text-[11px]">
            {statusPieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name}:</span>
                <span className="font-mono font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issuance Over Time */}
        <div className="p-6 bg-white border border-blue-200 rounded-2xl metamask-card-shadow">
          <h3 className="text-sm font-bold text-slate-900 mb-1 font-display">
            Activity Timeline
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Issuances vs public verifications</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorVerif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bfdbfe', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="verified" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVerif)" />
                <Area type="monotone" dataKey="issued" stroke="#10b981" strokeWidth={2} fillOpacity={0.2} fill="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 text-[11px]">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">● Issuances</span>
            <span className="text-blue-700 font-semibold flex items-center gap-1">● Verifications</span>
          </div>
        </div>

        {/* Software Distribution */}
        <div className="p-6 bg-white border border-blue-200 rounded-2xl metamask-card-shadow">
          <h3 className="text-sm font-bold text-slate-900 mb-1 font-display">
            Software Portfolios
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Licenses per software package</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={softwareBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bfdbfe', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
            {Object.keys(softwareMap).length} Active Applications Registered
          </div>
        </div>
      </div>

      {/* Recent Verification Activity */}
      <div className="p-6 bg-white border border-blue-200 rounded-2xl metamask-card-shadow">
        <div className="flex items-center justify-between pb-4 border-b border-blue-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Recent Verification Activity
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Authoritative verification checks executed by users, clients, or automated CI pipelines.
            </p>
          </div>
          <button
            onClick={() => onNavigate('verify')}
            className="text-xs text-blue-700 hover:text-blue-800 font-bold transition-colors cursor-pointer"
          >
            Launch Verifier →
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-blue-100 text-slate-500 text-[11px] bg-slate-50/70">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">License ID</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Integrity Result</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.slice(0, 7).map(log => (
                <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap tabular-nums font-medium">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {log.licenseId}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-sans font-medium">
                    {log.verificationType}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        log.result === 'VALID' || log.result === 'AUTHENTIC'
                          ? 'text-emerald-700'
                          : log.result === 'EXPIRED'
                          ? 'text-amber-700'
                          : log.result === 'TRANSFERRED'
                          ? 'text-blue-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {log.result === 'VALID' || log.result === 'AUTHENTIC' ? '✓ ' : '✗ '}
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('verify', log.licenseId)}
                      className="text-slate-400 hover:text-blue-700 transition-colors cursor-pointer"
                      title="Inspect record"
                    >
                      <ExternalLink size={14} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
