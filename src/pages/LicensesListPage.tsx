import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { LicenseRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { QRModal } from '../components/QRModal';
import { blockchainService } from '../services/blockchain';
import {
  Search,
  Plus,
  Eye,
  ShieldCheck,
  ArrowRightLeft,
  AlertTriangle,
  QrCode,
  Filter
} from 'lucide-react';

interface LicensesListPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const LicensesListPage: React.FC<LicensesListPageProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'>('ALL');
  const [selectedLicenseForQR, setSelectedLicenseForQR] = useState<LicenseRecord | null>(null);

  const licenses = StorageService.getLicenses();

  const filtered = licenses.filter(lic => {
    if (statusFilter !== 'ALL' && lic.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = lic.licenseId.toLowerCase().includes(q);
      const matchApp = lic.softwareName.toLowerCase().includes(q);
      const matchOwner = lic.ownerWallet.toLowerCase().includes(q);
      const matchCustomer = lic.customerName.toLowerCase().includes(q);
      if (!matchId && !matchApp && !matchOwner && !matchCustomer) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-blue-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
            License Registry Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Explore, transfer, revoke, and inspect all issued software licenses.
          </p>
        </div>

        <button
          onClick={() => onNavigate('issue')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#013330] hover:bg-[#024945] rounded-xl transition-colors shadow-md shadow-[#013330]/20 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Issue New License</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#013330]/20 rounded-2xl metamask-card-shadow">
          {(['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#013330] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#013330]'
              }`}
            >
              {tab === 'ALL' ? 'All Licenses' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, software, owner..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-blue-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 metamask-card-shadow font-medium"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-blue-200 rounded-3xl overflow-hidden metamask-hero-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-blue-100 bg-slate-50/80 text-slate-600 text-[11px]">
                <th className="py-3.5 px-4 font-bold">License ID</th>
                <th className="py-3.5 px-4 font-bold">Software Package</th>
                <th className="py-3.5 px-4 font-bold">Owner Wallet</th>
                <th className="py-3.5 px-4 font-bold">Licensed Entity</th>
                <th className="py-3.5 px-4 font-bold">Issued Date</th>
                <th className="py-3.5 px-4 font-bold">Expiry Date</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs font-sans">
                    No software licenses match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map(lic => (
                  <tr key={lic.licenseId} className="hover:bg-blue-50/40 transition-colors">
                    {/* License ID */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                      {lic.licenseId}
                    </td>

                    {/* Software */}
                    <td className="py-3.5 px-4 font-sans text-slate-800 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{lic.softwareName}</span>
                      <span className="text-slate-500 text-[11px] ml-1.5 font-mono">v{lic.version}</span>
                    </td>

                    {/* Owner Wallet */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                      <span title={lic.ownerWallet}>
                        {blockchainService.shortenAddress(lic.ownerWallet)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 font-sans text-slate-700 whitespace-nowrap font-medium">
                      {lic.customerName}
                    </td>

                    {/* Issued */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                      {new Date(lic.issuedAt).toLocaleDateString()}
                    </td>

                    {/* Expiry */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                      {new Date(lic.expiresAt).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-sans">
                      <StatusBadge status={lic.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => onNavigate('detail', lic.licenseId)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details & History"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Verify */}
                        <button
                          onClick={() => onNavigate('verify', lic.licenseId)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Verify On-Chain"
                        >
                          <ShieldCheck size={14} />
                        </button>

                        {/* QR Code */}
                        <button
                          onClick={() => setSelectedLicenseForQR(lic)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Show QR Code"
                        >
                          <QrCode size={14} />
                        </button>

                        {/* Transfer */}
                        {lic.status === 'ACTIVE' && (
                          <button
                            onClick={() => onNavigate('transfer', lic.licenseId)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Transfer Ownership"
                          >
                            <ArrowRightLeft size={14} />
                          </button>
                        )}

                        {/* Revoke */}
                        {lic.status === 'ACTIVE' && (
                          <button
                            onClick={() => onNavigate('revoke', lic.licenseId)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Revoke License"
                          >
                            <AlertTriangle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Count */}
        <div className="p-4 border-t border-blue-100 bg-slate-50/60 text-xs text-slate-600 flex items-center justify-between">
          <span className="font-medium">Showing {filtered.length} of {licenses.length} recorded licenses</span>
          <span className="font-mono text-[11px] text-slate-500">Blockchain Network: Hardhat Localhost / Sepolia</span>
        </div>
      </div>

      {/* QR Modal */}
      <QRModal
        license={selectedLicenseForQR}
        isOpen={Boolean(selectedLicenseForQR)}
        onClose={() => setSelectedLicenseForQR(null)}
        onNavigateToVerify={id => onNavigate('verify', id)}
      />
    </div>
  );
};
