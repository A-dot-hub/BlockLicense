import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { blockchainService, COMPANY_ADMIN_ADDRESS } from '../services/blockchain';
import { StorageService } from '../services/storage';
import { computeFileSHA256, formatBytes32 } from '../services/hasher';
import { LicenseRecord } from '../types';
import { QRModal } from '../components/QRModal';
import {
  Upload,
  Cpu,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IssueLicensePageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const IssueLicensePage: React.FC<IssueLicensePageProps> = ({ onNavigate }) => {
  const { address, isConnected, isAdmin } = useWallet();

  const [softwareName, setSoftwareName] = useState('SecureSuite Pro');
  const [softwareVersion, setSoftwareVersion] = useState('4.2.1');
  const [licenseType, setLicenseType] = useState<'Standard' | 'Professional' | 'Enterprise' | 'Developer' | 'OEM'>('Enterprise');
  const [customerName, setCustomerName] = useState('Abhishek Enterprise');
  const [customerEmail, setCustomerEmail] = useState('licenses@abhishek-enterprise.com');
  const [ownerWallet, setOwnerWallet] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

  // Default expiry 1 year ahead
  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
  const [expiryDate, setExpiryDate] = useState(defaultExpiry.toISOString().split('T')[0]);

  // File upload & hash state
  const [file, setFile] = useState<File | null>(null);
  const [softwareHash, setSoftwareHash] = useState<string>('a3f7c9b1d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6');
  const [isHashing, setIsHashing] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLicense, setCreatedLicense] = useState<LicenseRecord | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsHashing(true);
    setError(null);

    try {
      const hash = await computeFileSHA256(selected);
      setSoftwareHash(hash);
    } catch (err: any) {
      setError('Failed to compute file SHA-256 hash: ' + err.message);
    } finally {
      setIsHashing(false);
    }
  };

  const handleQuickDemoFile = () => {
    const demoContent = `SecureSuite Pro Release Binary 4.2.1 Build Timestamp: ${Date.now()}`;
    const blob = new Blob([demoContent], { type: 'application/octet-stream' });
    const demoFile = new File([blob], 'securesuite-v4.2.1-installer.exe', { type: 'application/octet-stream' });
    setFile(demoFile);
    setIsHashing(true);
    computeFileSHA256(demoFile).then(hash => {
      setSoftwareHash(hash);
      setIsHashing(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!softwareName.trim() || !softwareVersion.trim()) {
      setError('Please provide software name and version.');
      return;
    }

    if (!blockchainService.isValidAddress(ownerWallet)) {
      setError('Invalid customer Ethereum wallet address format.');
      return;
    }

    if (!softwareHash) {
      setError('Please upload a software distribution file to calculate SHA-256.');
      return;
    }

    const expTime = new Date(expiryDate).getTime();
    if (isNaN(expTime) || expTime <= Date.now()) {
      setError('Expiry date must be in the future.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { readableId, numericId } = StorageService.generateNextLicenseId();
      const expiryTimestampSec = Math.floor(expTime / 1000);

      // 1. Submit on-chain transaction
      const { transactionHash, blockNumber } = await blockchainService.issueLicense(
        numericId,
        softwareName,
        softwareVersion,
        softwareHash,
        ownerWallet,
        expiryTimestampSec,
        address || COMPANY_ADMIN_ADDRESS
      );

      // 2. Prepare off-chain metadata document
      const nowIso = new Date().toISOString();
      const newLicenseDoc: LicenseRecord = {
        licenseId: readableId,
        blockchainLicenseId: numericId,
        softwareName,
        version: softwareVersion,
        licenseType,
        ownerWallet,
        customerName,
        customerEmail,
        softwareHash,
        transactionHash,
        contractAddress: blockchainService.contractAddress,
        issuedAt: nowIso,
        expiresAt: new Date(expTime).toISOString(),
        status: 'ACTIVE',
        createdAt: nowIso
      };

      // 3. Persist
      StorageService.saveLicense(newLicenseDoc);

      setCreatedLicense(newLicenseDoc);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

    } catch (err: any) {
      console.error('License issuance error:', err);
      setError(err?.message || 'Smart contract transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-blue-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
          Issue Digital Software License
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Mint an immutable license on the blockchain anchored to authentic software SHA-256 binary hash.
        </p>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Notice:</span> You are connected as a customer/user wallet.
            Only authorized company administrators can mint on-chain. You can switch to the
            "Software Company (Admin)" test account in the top-right wallet dropdown.
          </div>
        </div>
      )}

      {/* Success Banner if just issued */}
      {createdLicense ? (
        <div className="p-8 bg-white border border-emerald-300 rounded-3xl space-y-6 metamask-hero-shadow animate-in fade-in">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 size={26} className="text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                License Minted Successfully on Blockchain
              </h3>
              <p className="text-xs text-slate-600">
                Transaction confirmed and off-chain metadata cataloged.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-blue-100 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">License Identifier:</span>
              <strong className="text-slate-900 font-mono text-sm">{createdLicense.licenseId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Internal Numeric ID:</span>
              <strong className="text-slate-900 font-mono text-sm">#{createdLicense.blockchainLicenseId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Software & Version:</span>
              <span className="text-slate-800 font-semibold">{createdLicense.softwareName} v{createdLicense.version}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Licensed To:</span>
              <span className="text-slate-800 font-semibold">{createdLicense.customerName}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block font-medium">Cryptographic SHA-256 Digest:</span>
              <span className="text-blue-900 font-mono text-[11px] break-all font-semibold">{createdLicense.softwareHash}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block font-medium">Blockchain Transaction:</span>
              <span className="text-blue-700 font-mono text-[11px] break-all">{createdLicense.transactionHash}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <QrCode size={15} />
              <span>Show QR Code</span>
            </button>
            <button
              onClick={() => onNavigate('verify', createdLicense.licenseId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 border border-blue-200 rounded-xl metamask-card-shadow transition-colors cursor-pointer"
            >
              <FileCheck2 size={15} className="text-blue-600" />
              <span>Test Public Verification</span>
            </button>
            <button
              onClick={() => {
                setCreatedLicense(null);
                setFile(null);
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Issue Another License
            </button>
          </div>
        </div>
      ) : (
        /* The Issuance Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Software File & SHA-256 Hashing */}
          <div className="p-6 bg-white border border-blue-200 rounded-3xl metamask-card-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  1. Software Binary & Cryptographic Integrity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The binary file is hashed locally. The raw binary is never stored on blockchain.
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoFile}
                className="text-xs text-blue-700 hover:text-blue-800 font-semibold transition-colors underline cursor-pointer"
              >
                Use sample software file
              </button>
            </div>

            {/* Dropzone */}
            <label className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-blue-50/30 group">
              <Upload size={24} className="text-blue-500 group-hover:text-blue-700 mb-2 transition-colors" />
              <span className="text-xs font-semibold text-slate-800">
                {file ? file.name : 'Select or Drop Executable / Binary File (.exe, .dmg, .tar.gz)'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Local high-speed SHA-256 calculation'}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Real-time Hash Display */}
            <div className="p-4 bg-slate-50 border border-blue-100 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Calculated SHA-256 Digest:</span>
                {isHashing ? (
                  <span className="text-amber-600 font-mono font-semibold animate-pulse">Computing hash...</span>
                ) : (
                  <span className="text-emerald-700 font-mono font-semibold text-[11px]">Ready for on-chain anchor</span>
                )}
              </div>
              <div className="font-mono text-xs text-blue-900 break-all bg-white p-2.5 rounded-xl border border-blue-200 font-semibold">
                {softwareHash || 'No file selected yet'}
              </div>
            </div>
          </div>

          {/* Section 2: Software Details */}
          <div className="p-6 bg-white border border-blue-200 rounded-3xl metamask-card-shadow space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              2. Application Release Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Software Name *
                </label>
                <input
                  type="text"
                  required
                  value={softwareName}
                  onChange={e => setSoftwareName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="e.g. SecureSuite Pro"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Version *
                </label>
                <input
                  type="text"
                  required
                  value={softwareVersion}
                  onChange={e => setSoftwareVersion(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="e.g. 4.2.1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  License Tier
                </label>
                <select
                  value={licenseType}
                  onChange={e => setLicenseType(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Professional">Professional</option>
                  <option value="Standard">Standard</option>
                  <option value="Developer">Developer</option>
                  <option value="OEM">OEM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Customer & Wallet Target */}
          <div className="p-6 bg-white border border-blue-200 rounded-3xl metamask-card-shadow space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              3. Customer & On-Chain Recipient Wallet
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer / Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="e.g. Abhishek Enterprise"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="e.g. licenses@enterprise.corp"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Recipient Ethereum Wallet Address *
                </label>
                <input
                  type="text"
                  required
                  value={ownerWallet}
                  onChange={e => setOwnerWallet(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-mono bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Only this verified address will possess cryptographic ownership on-chain.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-200">
            <button
              type="submit"
              disabled={isSubmitting || isHashing}
              className="px-7 py-3 text-xs font-bold text-white bg-[#013330] hover:bg-[#024945] disabled:bg-slate-300 disabled:text-slate-500 rounded-xl transition-colors shadow-md shadow-[#013330]/20 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Cpu size={15} className="animate-spin text-white" />
                  <span>Submitting Transaction to Blockchain...</span>
                </>
              ) : (
                <>
                  <Cpu size={15} />
                  <span>Sign & Mint License On-Chain</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* QR Code Modal for newly created license */}
      <QRModal
        license={createdLicense}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onNavigateToVerify={id => onNavigate('verify', id)}
      />
    </div>
  );
};
