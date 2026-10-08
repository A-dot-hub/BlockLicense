import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { blockchainService } from '../services/blockchain';
import { StatusBadge } from '../components/StatusBadge';
import { QRModal } from '../components/QRModal';
import {
  ArrowLeft,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
  Download,
  History,
  FileCheck2,
  Cpu,
  Layers,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';

interface LicenseDetailPageProps {
  licenseId: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const LicenseDetailPage: React.FC<LicenseDetailPageProps> = ({
  licenseId,
  onNavigate
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const license = StorageService.getLicenseById(licenseId);
  const events = StorageService.getOwnershipEvents(licenseId);

  if (!license) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 font-display">License Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested license ID <span className="font-mono text-blue-700 font-bold">{licenseId}</span> does not exist.
        </p>
        <button
          onClick={() => onNavigate('licenses')}
          className="px-4 py-2 bg-white text-xs font-semibold text-slate-800 border border-blue-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Back to Licenses
        </button>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadCertificate = () => {
    const cert = {
      licenseId: license.licenseId,
      softwareName: license.softwareName,
      version: license.version,
      edition: license.licenseType,
      verifiedOwner: license.ownerWallet,
      customerName: license.customerName,
      softwareHashSha256: license.softwareHash,
      blockchainIssuanceTx: license.transactionHash,
      contractAddress: license.contractAddress,
      validFrom: license.issuedAt,
      validUntil: license.expiresAt,
      certifiedStatus: license.status,
      blockchainTruthAuthority: 'BlockLicense EVM Protocol'
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate-${license.licenseId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-blue-200">
        <div>
          <button
            onClick={() => onNavigate('licenses')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-800 font-semibold transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Licenses</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
              {license.licenseId}
            </h1>
            <StatusBadge status={license.status} size="lg" />
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {license.softwareName} v{license.version} · {license.licenseType} Edition
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-blue-200 rounded-xl metamask-card-shadow transition-colors cursor-pointer"
          >
            <QrCode size={14} className="text-[#013330]" />
            <span>QR Code</span>
          </button>
          <button
            onClick={() => onNavigate('verify', license.licenseId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-blue-200 rounded-xl metamask-card-shadow transition-colors cursor-pointer"
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Verify Live</span>
          </button>
          <button
            onClick={handleDownloadCertificate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#013330] hover:bg-[#024945] rounded-xl transition-colors shadow-md shadow-[#013330]/20 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Certificate</span>
          </button>
        </div>
      </div>

      {/* Main Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core License Details (Left 2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white border border-blue-200 rounded-3xl metamask-card-shadow space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Software & Customer Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Software Title</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{license.softwareName}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Version</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{license.version}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Licensed Entity</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{license.customerName}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Billing / Admin Contact</span>
                <span className="text-slate-700 mt-0.5 block font-medium">{license.customerEmail}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Issuance Date</span>
                <span className="font-mono text-slate-700 mt-0.5 block font-semibold">
                  {new Date(license.issuedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Expiry Date</span>
                <span className="font-mono text-slate-700 mt-0.5 block font-semibold">
                  {new Date(license.expiresAt).toLocaleDateString()}
                </span>
              </div>

              <div className="sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Current Verified Owner Address</span>
                <span className="font-mono text-xs text-blue-900 font-bold mt-1 block break-all">
                  {license.ownerWallet}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Binary Integrity Anchor */}
          <div className="p-6 bg-white border border-blue-200 rounded-3xl metamask-card-shadow space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-display">
                SHA-256 Software Binary Anchor
              </h3>
              <button
                onClick={() => onNavigate('verify-software', license.licenseId)}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileCheck2 size={13} />
                <span>Verify Local File Match</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Cryptographic Digest:</span>
                <button
                  onClick={() => handleCopy(license.softwareHash)}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedHash ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-blue-900 break-all p-2.5 bg-white rounded-xl border border-blue-200 font-semibold">
                {license.softwareHash}
              </div>
            </div>
          </div>

          {/* Authoritative Ownership History Timeline */}
          <div className="p-6 bg-white border border-blue-200 rounded-3xl metamask-card-shadow space-y-4">
            <div className="flex items-center gap-2">
              <History size={16} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Immutable Ownership Audit Trail
              </h3>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
              {events.map((evt, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    evt.type === 'MINT'
                      ? 'bg-emerald-500'
                      : evt.type === 'TRANSFER'
                      ? 'bg-blue-600'
                      : 'bg-rose-500'
                  }`} />

                  <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-bold text-slate-900">
                        {evt.type === 'MINT' ? 'Initial Mint & Issuance' : evt.type === 'TRANSFER' ? 'Ownership Transferred' : 'Revocation Executed'}
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {new Date(evt.timestamp).toLocaleDateString()} · {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-slate-700 font-medium">
                      From: <span className="text-slate-600">{blockchainService.shortenAddress(evt.from)}</span>
                      <span className="mx-1.5 text-slate-400">→</span>
                      To: <span className="text-blue-700 font-bold">{blockchainService.shortenAddress(evt.to)}</span>
                    </div>

                    {evt.reason && (
                      <div className="text-[11px] text-rose-700 font-sans font-medium">
                        Reason: {evt.reason}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Tx: {evt.transactionHash.slice(0, 18)}... (Block #{evt.blockNumber})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blockchain Metadata (Right col) */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-blue-200 rounded-3xl metamask-card-shadow space-y-4">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Cpu size={15} />
              <span>Blockchain Layer</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Contract Address</span>
                <span className="font-mono text-slate-900 font-bold text-[11px] break-all block mt-0.5">
                  {license.contractAddress}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Network & Chain ID</span>
                <span className="text-slate-900 font-bold block mt-0.5">
                  Ethereum Hardhat (31337) / Sepolia
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">On-Chain Numeric ID</span>
                <span className="font-mono text-slate-900 font-bold block mt-0.5">
                  #{license.blockchainLicenseId}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-blue-100">
                <span className="text-slate-500 text-[11px] font-medium block">Issuance Tx Hash</span>
                <span className="font-mono text-blue-700 text-[11px] break-all block mt-0.5">
                  {license.transactionHash}
                </span>
              </div>
            </div>

            {/* Transfer or Revoke Action Shortcuts */}
            {license.status === 'ACTIVE' && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => onNavigate('transfer', license.licenseId)}
                  className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer metamask-card-shadow"
                >
                  <ArrowRightLeft size={13} className="text-blue-600" />
                  <span>Transfer Ownership</span>
                </button>
                <button
                  onClick={() => onNavigate('revoke', license.licenseId)}
                  className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle size={13} className="text-rose-600" />
                  <span>Revoke License</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <QRModal
        license={license}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onNavigateToVerify={id => onNavigate('verify', id)}
      />
    </div>
  );
};
