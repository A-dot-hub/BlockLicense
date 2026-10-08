import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { StorageService } from '../services/storage';
import { blockchainService, COMPANY_ADMIN_ADDRESS } from '../services/blockchain';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Cpu,
  XCircle,
  ArrowRight
} from 'lucide-react';

interface RevokeLicensePageProps {
  initialLicenseId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const RevokeLicensePage: React.FC<RevokeLicensePageProps> = ({
  initialLicenseId,
  onNavigate
}) => {
  const { address, isAdmin } = useWallet();

  const [selectedLicenseId, setSelectedLicenseId] = useState<string>(initialLicenseId || 'BL-2026-000001');
  const [revocationReason, setRevocationReason] = useState<string>('Breach of End User License Agreement (EULA)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [revokedLicenseId, setRevokedLicenseId] = useState<string | null>(null);

  const activeLicenses = StorageService.getLicenses().filter(l => l.status === 'ACTIVE');
  const currentLicense = StorageService.getLicenseById(selectedLicenseId);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdmin) {
      setError('Only the authorized company admin wallet can revoke software licenses.');
      return;
    }

    if (!currentLicense) {
      setError('Selected license does not exist.');
      return;
    }

    if (currentLicense.status === 'REVOKED') {
      setError('This license is already revoked.');
      return;
    }

    if (!revocationReason.trim()) {
      setError('A revocation justification is required for the audit trail.');
      return;
    }

    setShowConfirmModal(true);
  };

  const executeRevocation = async () => {
    if (!currentLicense) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const { transactionHash } = await blockchainService.revokeLicense(
        currentLicense.blockchainLicenseId,
        revocationReason,
        address || COMPANY_ADMIN_ADDRESS
      );

      StorageService.revokeLicense(
        currentLicense.licenseId,
        revocationReason,
        transactionHash,
        address || COMPANY_ADMIN_ADDRESS
      );

      setRevokedLicenseId(currentLicense.licenseId);
      setShowConfirmModal(false);
    } catch (err: any) {
      setError(err?.message || 'Revocation transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-blue-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
          Revoke Software License
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Permanent administrative revocation of a compromised, refunded, or breached license.
        </p>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Access Restriction:</span> You are not currently connected as the company admin wallet.
            Switch to "Software Company (Admin)" in the top-right account menu to execute smart contract revocation.
          </div>
        </div>
      )}

      {/* Success Notification */}
      {revokedLicenseId ? (
        <div className="p-8 bg-white border border-rose-300 rounded-3xl space-y-5 metamask-hero-shadow animate-in fade-in">
          <div className="flex items-center gap-3 text-rose-700">
            <XCircle size={28} className="text-rose-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                License Revoked on Blockchain
              </h3>
              <p className="text-xs text-slate-600">
                On-chain status permanently marked as REVOKED. Future transfers and validations are disabled.
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-blue-100 text-xs space-y-2 font-mono">
            <div>
              <span className="text-slate-500 block font-medium">Revoked License:</span>
              <strong className="text-rose-700 font-bold">{revokedLicenseId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Justification:</span>
              <span className="text-slate-800 font-sans font-semibold">{revocationReason}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('verify', revokedLicenseId)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Test Public Verification (Shows ✗ REVOKED)
            </button>
            <button
              onClick={() => {
                setRevokedLicenseId(null);
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* Revocation Form */
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
                Select License To Revoke
              </label>
              <select
                value={selectedLicenseId}
                onChange={e => setSelectedLicenseId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-mono bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-semibold cursor-pointer"
              >
                {activeLicenses.map(lic => (
                  <option key={lic.licenseId} value={lic.licenseId}>
                    {lic.licenseId} — {lic.softwareName} v{lic.version} ({lic.customerName})
                  </option>
                ))}
              </select>
            </div>

            {currentLicense && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Current License Holder:</span>
                  <span className="text-slate-900 font-bold">{currentLicense.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Owner Wallet:</span>
                  <span className="text-slate-900 font-mono font-bold break-all">{currentLicense.ownerWallet}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Software:</span>
                  <span className="text-slate-900 font-bold">{currentLicense.softwareName} v{currentLicense.version}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Official Revocation Reason *
              </label>
              <textarea
                required
                rows={3}
                value={revocationReason}
                onChange={e => setRevocationReason(e.target.value)}
                placeholder="State the regulatory, contractual, or security breach reason..."
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!isAdmin}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:text-slate-500 text-xs font-bold text-white rounded-xl transition-colors shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle size={14} />
              <span>Initiate License Revocation</span>
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && currentLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-rose-300 rounded-3xl p-6 metamask-hero-shadow space-y-5">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle size={22} />
              <h3 className="text-base font-bold text-slate-900 font-display">
                Confirm Irrevocable Revocation
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to revoke <strong className="text-slate-900 font-mono font-bold">{currentLicense.licenseId}</strong>?
              This action writes to the blockchain permanently and cannot be undone.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100 text-xs space-y-1.5 font-mono">
              <div className="text-slate-600">Software: <span className="text-slate-900 font-bold">{currentLicense.softwareName}</span></div>
              <div className="text-slate-600">Customer: <span className="text-slate-900 font-bold">{currentLicense.customerName}</span></div>
              <div className="text-slate-600">Reason: <span className="text-rose-700 font-sans font-semibold">{revocationReason}</span></div>
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
                onClick={executeRevocation}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Cpu size={14} className="animate-spin text-white" />
                    <span>Signing Revocation...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} />
                    <span>Yes, Revoke License</span>
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
