import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { StorageService } from '../services/storage';
import { blockchainService } from '../services/blockchain';
import { LicenseRecord } from '../types';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TransferLicensePageProps {
  initialLicenseId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const TransferLicensePage: React.FC<TransferLicensePageProps> = ({
  initialLicenseId,
  onNavigate
}) => {
  const { address, isConnected } = useWallet();

  const [selectedLicenseId, setSelectedLicenseId] = useState<string>(initialLicenseId || 'BL-2026-000001');
  const [recipientAddress, setRecipientAddress] = useState<string>('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [transferSuccessData, setTransferSuccessData] = useState<{
    licenseId: string;
    previousOwner: string;
    newOwner: string;
    txHash: string;
  } | null>(null);

  const licenses = StorageService.getLicenses().filter(l => l.status === 'ACTIVE');
  const currentLicense = StorageService.getLicenseById(selectedLicenseId);

  useEffect(() => {
    if (initialLicenseId) {
      setSelectedLicenseId(initialLicenseId);
    }
  }, [initialLicenseId]);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentLicense) {
      setError('Please select an active license to transfer.');
      return;
    }

    if (currentLicense.status !== 'ACTIVE') {
      setError(`Cannot transfer ${currentLicense.status} license.`);
      return;
    }

    if (!blockchainService.isValidAddress(recipientAddress)) {
      setError('Invalid recipient Ethereum wallet address format.');
      return;
    }

    if (recipientAddress.toLowerCase() === currentLicense.ownerWallet.toLowerCase()) {
      setError('New owner address must be different from current owner address.');
      return;
    }

    setShowConfirmModal(true);
  };

  const executeTransfer = async () => {
    if (!currentLicense) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const { transactionHash } = await blockchainService.transferLicense(
        currentLicense.blockchainLicenseId,
        recipientAddress,
        currentLicense.ownerWallet
      );

      StorageService.transferLicense(currentLicense.licenseId, recipientAddress, transactionHash);

      setTransferSuccessData({
        licenseId: currentLicense.licenseId,
        previousOwner: currentLicense.ownerWallet,
        newOwner: recipientAddress,
        txHash: transactionHash
      });

      setShowConfirmModal(false);

      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch {}

    } catch (err: any) {
      setError(err?.message || 'Transfer transaction rejected or failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-blue-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
          Transfer License Ownership
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Hand over cryptographically authorized software rights to another Ethereum wallet.
        </p>
      </div>

      {/* Success Banner */}
      {transferSuccessData ? (
        <div className="p-8 bg-white border border-emerald-300 rounded-3xl space-y-5 metamask-hero-shadow animate-in fade-in">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 size={26} className="text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Ownership Transferred Successfully
              </h3>
              <p className="text-xs text-slate-600">
                On-chain ownership verified and updated in audit ledger.
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-blue-100 text-xs space-y-2 font-mono">
            <div>
              <span className="text-slate-500 block font-medium">License:</span>
              <strong className="text-slate-900 font-bold">{transferSuccessData.licenseId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Previous Owner:</span>
              <span className="text-slate-700 break-all">{transferSuccessData.previousOwner}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">New Owner:</span>
              <span className="text-blue-700 font-bold break-all">{transferSuccessData.newOwner}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Blockchain Transaction:</span>
              <span className="text-blue-900 font-bold break-all">{transferSuccessData.txHash}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('detail', transferSuccessData.licenseId)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              View Updated Ownership History
            </button>
            <button
              onClick={() => {
                setTransferSuccessData(null);
                setRecipientAddress('');
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Transfer Another
            </button>
          </div>
        </div>
      ) : (
        /* Transfer Form */
        <form onSubmit={handleOpenConfirm} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-6 bg-white border border-blue-200 rounded-3xl metamask-card-shadow space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Select Active License To Transfer
              </label>
              <select
                value={selectedLicenseId}
                onChange={e => setSelectedLicenseId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-mono bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-semibold cursor-pointer"
              >
                {licenses.map(lic => (
                  <option key={lic.licenseId} value={lic.licenseId}>
                    {lic.licenseId} — {lic.softwareName} v{lic.version} (Owner: {blockchainService.shortenAddress(lic.ownerWallet)})
                  </option>
                ))}
              </select>
            </div>

            {currentLicense && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Current Verified Owner:</span>
                  <span className="text-slate-900 font-mono font-bold break-all">{currentLicense.ownerWallet}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Application:</span>
                  <span className="text-slate-900 font-bold">{currentLicense.softwareName} v{currentLicense.version}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Expiry Date:</span>
                  <span className="text-slate-900 font-mono font-bold">{new Date(currentLicense.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Recipient Ethereum Wallet Address *
              </label>
              <input
                type="text"
                required
                value={recipientAddress}
                onChange={e => setRecipientAddress(e.target.value)}
                placeholder="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
                className="w-full px-3 py-2.5 text-xs font-mono bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-semibold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                The smart contract will verify that you are the current owner before executing.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#013330] hover:bg-[#024945] text-xs font-bold text-white rounded-xl transition-colors shadow-md shadow-[#013330]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft size={14} />
              <span>Review Transfer Details</span>
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && currentLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-blue-200 rounded-3xl p-6 metamask-hero-shadow space-y-5">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Confirm Ownership Transfer
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to transfer ownership of this license? Once confirmed on-chain, your wallet will no longer possess license rights.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100 text-xs space-y-2 font-mono">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">License:</span>
                <span className="text-slate-900 font-bold">{currentLicense.licenseId} ({currentLicense.softwareName})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Current Owner:</span>
                <span className="text-slate-700 break-all">{currentLicense.ownerWallet}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">New Owner:</span>
                <span className="text-blue-700 font-bold break-all">{recipientAddress}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeTransfer}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Cpu size={14} className="animate-spin text-white" />
                    <span>Signing Transaction...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={14} />
                    <span>Confirm & Sign on Blockchain</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
