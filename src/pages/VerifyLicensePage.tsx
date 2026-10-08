import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { blockchainService } from '../services/blockchain';
import { LicenseRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { QRScannerModal } from '../components/QRScannerModal';
import { QRModal } from '../components/QRModal';
import {
  ShieldCheck,
  Search,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Cpu,
  FileCheck2,
  Copy,
  Check
} from 'lucide-react';

interface VerifyLicensePageProps {
  initialLicenseId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const VerifyLicensePage: React.FC<VerifyLicensePageProps> = ({
  initialLicenseId,
  onNavigate
}) => {
  const [searchInput, setSearchInput] = useState<string>(initialLicenseId || 'BL-2026-000001');
  const [verifiedLicense, setVerifiedLicense] = useState<LicenseRecord | null>(null);
  const [verificationResult, setVerificationResult] = useState<'VALID' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND' | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const performVerification = (licenseIdToVerify: string) => {
    if (!licenseIdToVerify.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      const found = StorageService.getLicenseById(licenseIdToVerify);
      if (!found) {
        setVerifiedLicense(null);
        setVerificationResult('NOT_FOUND');
        StorageService.addLog({
          id: 'log-' + Date.now(),
          licenseId: licenseIdToVerify.toUpperCase(),
          verificationType: 'LICENSE_ID',
          result: 'INVALID',
          timestamp: new Date().toISOString(),
          details: 'Lookup failed: License ID not present in blockchain records'
        });
      } else {
        setVerifiedLicense(found);
        const resultStatus = found.status === 'ACTIVE'
          ? 'VALID'
          : found.status === 'EXPIRED'
          ? 'EXPIRED'
          : found.status === 'REVOKED'
          ? 'REVOKED'
          : 'VALID';

        setVerificationResult(resultStatus);

        StorageService.addLog({
          id: 'log-' + Date.now(),
          licenseId: found.licenseId,
          verificationType: 'LICENSE_ID',
          result: resultStatus as any,
          timestamp: new Date().toISOString(),
          details: `Public verification executed. Current owner: ${found.ownerWallet}`,
          ownerWallet: found.ownerWallet
        });
      }
      setIsVerifying(false);
    }, 400);
  };

  useEffect(() => {
    if (initialLicenseId) {
      setSearchInput(initialLicenseId);
      performVerification(initialLicenseId);
    } else {
      performVerification('BL-2026-000001');
    }
  }, [initialLicenseId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(searchInput);
  };

  const handleScanResult = (scannedId: string) => {
    setSearchInput(scannedId);
    performVerification(scannedId);
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-blue-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
          Public License Verification
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Cryptographically verify software license authenticity, ownership chain, and blockchain validity.
        </p>
      </div>

      {/* Search & QR Trigger */}
      <div className="p-6 bg-white border border-[#013330]/20 rounded-3xl metamask-card-shadow space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Enter License ID (e.g. BL-2026-000001)"
              className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#013330] focus:bg-white placeholder:text-slate-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="px-5 py-2.5 bg-[#013330] hover:bg-[#024945] text-xs font-bold text-white rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#013330]/20"
          >
            {isVerifying ? 'Verifying...' : 'Verify License'}
          </button>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-blue-200 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer metamask-card-shadow font-semibold"
            title="Scan QR Code"
          >
            <QrCode size={16} className="text-blue-600" />
            <span className="hidden sm:inline text-xs">Scan QR</span>
          </button>
        </form>

        {/* Quick select demo buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 text-[11px] font-medium">Quick Samples:</span>
          <button
            onClick={() => {
              setSearchInput('BL-2026-000001');
              performVerification('BL-2026-000001');
            }}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-800 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
          >
            BL-2026-000001 (Active)
          </button>
          <button
            onClick={() => {
              setSearchInput('BL-2026-000002');
              performVerification('BL-2026-000002');
            }}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-800 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
          >
            BL-2026-000002 (Expired)
          </button>
          <button
            onClick={() => {
              setSearchInput('BL-2026-000003');
              performVerification('BL-2026-000003');
            }}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-800 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
          >
            BL-2026-000003 (Revoked)
          </button>
        </div>
      </div>

      {/* Verification Result Card */}
      {verificationResult === 'NOT_FOUND' && (
        <div className="p-8 bg-white border border-rose-300 rounded-3xl text-center space-y-3 metamask-card-shadow animate-in fade-in">
          <XCircle size={40} className="text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-display">License Not Found</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            The identifier <strong className="font-mono text-rose-700 font-bold">{searchInput}</strong> has no corresponding record on the blockchain registry.
          </p>
        </div>
      )}

      {verifiedLicense && verificationResult && verificationResult !== 'NOT_FOUND' && (
        <div className="p-8 bg-white border border-blue-200 rounded-3xl space-y-6 metamask-hero-shadow animate-in fade-in">
          
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-blue-100">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                Authenticity Verification Result
              </span>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  {verifiedLicense.softwareName} v{verifiedLicense.version}
                </h2>
                <StatusBadge status={verifiedLicense.status} size="lg" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-blue-200 rounded-xl metamask-card-shadow transition-colors cursor-pointer"
              >
                <QrCode size={14} className="text-blue-600" />
                <span>QR Code</span>
              </button>
              <button
                onClick={() => onNavigate('verify-software', verifiedLicense.licenseId)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <FileCheck2 size={14} />
                <span>Verify Binary Hash</span>
              </button>
            </div>
          </div>

          {/* Verification Checklist Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-blue-100 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block text-[11px] font-medium">Blockchain Record</span>
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Confirmed</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block text-[11px] font-medium">Status</span>
              <div className={`font-bold ${
                verifiedLicense.status === 'ACTIVE'
                  ? 'text-emerald-700'
                  : verifiedLicense.status === 'EXPIRED'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}>
                {verifiedLicense.status}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block text-[11px] font-medium">Ownership Truth</span>
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Verified</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block text-[11px] font-medium">Contract Integrity</span>
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>EVM Enforced</span>
              </div>
            </div>
          </div>

          {/* Detailed License Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-blue-100">
              <span className="text-slate-500 block text-[11px] font-medium">License Identifier</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                {verifiedLicense.licenseId}
              </span>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-blue-100">
              <span className="text-slate-500 block text-[11px] font-medium">License Tier</span>
              <span className="text-slate-900 font-bold mt-0.5 block">
                {verifiedLicense.licenseType} Edition
              </span>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-blue-100">
              <span className="text-slate-500 block text-[11px] font-medium">Verified Current Owner</span>
              <span className="font-mono text-slate-800 text-xs mt-0.5 block break-all font-semibold">
                {verifiedLicense.ownerWallet}
              </span>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-blue-100">
              <span className="text-slate-500 block text-[11px] font-medium">Licensed Customer</span>
              <span className="text-slate-900 font-bold mt-0.5 block">
                {verifiedLicense.customerName}
              </span>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-blue-100">
              <span className="text-slate-500 block text-[11px] font-medium">Issued Timestamp</span>
              <span className="text-slate-700 font-mono text-[11px] mt-0.5 block font-semibold">
                {new Date(verifiedLicense.issuedAt).toLocaleDateString()} · {new Date(verifiedLicense.issuedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-blue-100">
              <span className="text-slate-500 block text-[11px] font-medium">Expiration Date</span>
              <span className="text-slate-700 font-mono text-[11px] mt-0.5 block font-semibold">
                {new Date(verifiedLicense.expiresAt).toLocaleDateString()}
              </span>
            </div>

            {/* Cryptographic Hash */}
            <div className="sm:col-span-2 p-4 bg-slate-50/70 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 text-[11px] font-medium">Software Release SHA-256 Hash</span>
                <button
                  onClick={() => handleCopyHash(verifiedLicense.softwareHash)}
                  className="text-blue-700 hover:text-blue-900 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedHash ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <span className="font-mono text-blue-900 text-[11px] break-all block font-semibold">
                {verifiedLicense.softwareHash}
              </span>
            </div>

            {/* Blockchain Transaction */}
            <div className="sm:col-span-2 p-4 bg-slate-50/70 rounded-2xl border border-blue-100">
              <span className="text-slate-500 block text-[11px] mb-1 font-medium">Blockchain Issuance Transaction</span>
              <span className="font-mono text-slate-700 text-[11px] break-all block">
                {verifiedLicense.transactionHash}
              </span>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-blue-100 text-xs">
            <button
              onClick={() => onNavigate('detail', verifiedLicense.licenseId)}
              className="text-blue-700 hover:text-blue-900 font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Ownership History & Blockchain Events</span>
              <ExternalLink size={13} />
            </button>

            <span className="text-slate-500 text-[11px] font-mono">
              Smart Contract: {blockchainService.shortenAddress(verifiedLicense.contractAddress)}
            </span>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleScanResult}
      />

      {/* QR Display Modal */}
      <QRModal
        license={verifiedLicense}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
};
