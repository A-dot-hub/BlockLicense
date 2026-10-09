import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { computeFileSHA256, compareHashes } from '../services/hasher';
import { LicenseRecord } from '../types';
import {
  FileCheck2,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  FileCode,
  FileWarning
} from 'lucide-react';

interface VerifySoftwarePageProps {
  initialLicenseId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const VerifySoftwarePage: React.FC<VerifySoftwarePageProps> = ({
  initialLicenseId,
  onNavigate
}) => {
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>(initialLicenseId || '');
  const [targetLicense, setTargetLicense] = useState<LicenseRecord | null>(null);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [uploadedHash, setUploadedHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);

  // Verification outcome
  const [verificationResult, setVerificationResult] = useState<{
    status: 'MATCH' | 'MISMATCH' | 'NO_LICENSE' | null;
    isAuthentic: boolean;
    computedHash: string;
    expectedHash: string;
    message: string;
  }>({
    status: null,
    isAuthentic: false,
    computedHash: '',
    expectedHash: '',
    message: ''
  });

  const licenses = StorageService.getLicenses();

  useEffect(() => {
    const lic = StorageService.getLicenseById(selectedLicenseId);
    setTargetLicense(lic || null);
  }, [selectedLicenseId]);

  const handleFileSelected = async (fileObj: File) => {
    setFile(fileObj);
    setFileName(fileObj.name);
    setFileSize(fileObj.size);
    setIsHashing(true);

    try {
      const hash = await computeFileSHA256(fileObj);
      setUploadedHash(hash);
      evaluateIntegrity(hash, selectedLicenseId);
    } catch (err) {
      console.error('Hashing failed:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const evaluateIntegrity = (hashToCompare: string, licenseId: string) => {
    const lic = StorageService.getLicenseById(licenseId);
    if (!lic) {
      setVerificationResult({
        status: 'NO_LICENSE',
        isAuthentic: false,
        computedHash: hashToCompare,
        expectedHash: 'N/A',
        message: `License ${licenseId} not found in database.`
      });
      return;
    }

    const expected = lic.softwareHash.toLowerCase().replace(/^0x/, '');
    const computed = hashToCompare.toLowerCase().replace(/^0x/, '');
    const isMatch = compareHashes(computed, expected);

    if (isMatch) {
      setVerificationResult({
        status: 'MATCH',
        isAuthentic: true,
        computedHash: computed,
        expectedHash: expected,
        message: '✓ AUTHENTIC SOFTWARE: SHA-256 binary hash matches the immutable blockchain record exactly.'
      });
      StorageService.addLog({
        id: 'log-' + Date.now(),
        licenseId: lic.licenseId,
        verificationType: 'FILE_HASH',
        result: 'AUTHENTIC',
        timestamp: new Date().toISOString(),
        details: `Binary hash check passed for ${lic.softwareName}`
      });
    } else {
      setVerificationResult({
        status: 'MISMATCH',
        isAuthentic: false,
        computedHash: computed,
        expectedHash: expected,
        message: '✗ HASH MISMATCH: The software binary does not match the official release hash. The file may have been modified, corrupted, or tampered with.'
      });
      StorageService.addLog({
        id: 'log-' + Date.now(),
        licenseId: lic.licenseId,
        verificationType: 'FILE_HASH',
        result: 'HASH_MISMATCH',
        timestamp: new Date().toISOString(),
        details: `Binary modified! Expected ${expected.slice(0, 8)}..., got ${computed.slice(0, 8)}...`
      });
    }
  };

  const handleLoadAuthenticSample = () => {
    const lic = StorageService.getLicenseById(selectedLicenseId);
    if (!lic) return;
    setFileName(`${lic.softwareName.toLowerCase().replace(/\s+/g, '-')}-v${lic.version}.exe`);
    setFileSize(1420580);
    const cleanHash = lic.softwareHash.toLowerCase().replace(/^0x/, '');
    setUploadedHash(cleanHash);
    evaluateIntegrity(cleanHash, selectedLicenseId);
  };

  const handleTamperFile = () => {
    const lic = StorageService.getLicenseById(selectedLicenseId);
    if (!lic) return;
    setFileName(`${lic.softwareName.toLowerCase().replace(/\s+/g, '-')}-MODIFIED.exe`);
    setFileSize(1420581);
    const altered = '11111111' + lic.softwareHash.toLowerCase().replace(/^0x/, '').slice(8);
    setUploadedHash(altered);
    evaluateIntegrity(altered, selectedLicenseId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-blue-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
          Software Binary SHA-256 Integrity Verification
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Detect backdoors, trojans, binary tampering, or unintended file modification by comparing real file digests against blockchain anchors.
        </p>
      </div>

      {/* Target License Selection */}
      <div className="p-6 bg-white border border-[#013330]/20 rounded-3xl metamask-card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-bold text-[#013330]">
              Select License To Verify Against
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Choose which registered software edition to validate.
            </p>
          </div>

          <select
            value={selectedLicenseId}
            onChange={e => {
              setSelectedLicenseId(e.target.value);
              if (uploadedHash) {
                evaluateIntegrity(uploadedHash, e.target.value);
              }
            }}
            className="px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#013330] focus:bg-white font-semibold cursor-pointer"
          >
            {licenses.map(lic => (
              <option key={lic.licenseId} value={lic.licenseId}>
                {lic.licenseId} — {lic.softwareName} v{lic.version} ({lic.status})
              </option>
            ))}
          </select>
        </div>

        {targetLicense && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">On-Chain Registered SHA-256:</span>
              <span className="text-emerald-700 text-[11px] font-bold">Source of Truth</span>
            </div>
            <div className="text-[#013330] text-[11px] break-all bg-white p-2.5 rounded-xl border border-slate-200 font-bold">
              {targetLicense.softwareHash}
            </div>
          </div>
        )}
      </div>

      {/* Upload Zone & Quick Test Action Bar */}
      <div className="p-6 bg-white border border-[#013330]/20 rounded-3xl metamask-card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#013330] font-display">
            Upload Local Executable or Binary File
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadAuthenticSample}
              className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-semibold shadow-sm"
            >
              <FileCheck2 size={13} className="text-emerald-600" />
              <span>Test Authentic Binary</span>
            </button>
            <button
              onClick={handleTamperFile}
              className="text-xs px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-semibold shadow-sm"
            >
              <FileWarning size={13} className="text-rose-600" />
              <span>Simulate Tampered File</span>
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <label className="border-2 border-dashed border-[#013330]/30 hover:border-[#013330] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/60 group">
          <Upload size={32} className="text-[#013330] group-hover:scale-110 mb-2 transition-transform" />
          <span className="text-xs font-semibold text-slate-800">
            {fileName ? fileName : 'Choose or Drop Any Binary / Executable (.exe, .bin, .iso, .zip)'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            {fileSize > 0 ? `${(fileSize / 1024).toFixed(1)} KB` : 'Local high-speed SHA-256 calculation (No file uploaded to server)'}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
            }}
          />
        </label>
      </div>

      {/* Verification Comparison Card */}
      {verificationResult.status && (
        <div
          className={`p-8 bg-white border rounded-3xl space-y-6 metamask-hero-shadow animate-in fade-in ${
            verificationResult.isAuthentic
              ? 'border-emerald-300'
              : 'border-rose-300'
          }`}
        >
          {/* Header Banner */}
          <div className="flex items-center gap-3">
            {verificationResult.isAuthentic ? (
              <CheckCircle2 size={30} className="text-emerald-600 shrink-0" />
            ) : (
              <XCircle size={30} className="text-rose-600 shrink-0" />
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {verificationResult.isAuthentic ? '✓ AUTHENTIC SOFTWARE' : '✗ SOFTWARE MODIFIED / HASH MISMATCH'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {verificationResult.message}
              </p>
            </div>
          </div>

          {/* Side-by-Side Comparison Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-blue-100 text-xs font-mono">
            <div>
              <div className="flex items-center justify-between text-slate-600 mb-1 font-medium">
                <span>Uploaded File SHA-256:</span>
                <span className="text-[10px] text-slate-500 font-sans">Computed Digest</span>
              </div>
              <div className={`p-3 rounded-xl border text-[11px] break-all font-semibold ${
                verificationResult.isAuthentic
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {verificationResult.computedHash}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-600 mb-1 font-medium">
                <span>On-Chain Blockchain Hash:</span>
                <span className="text-[10px] text-slate-500 font-sans">Official Release</span>
              </div>
              <div className="p-3 bg-white border border-blue-200 rounded-xl text-[11px] break-all text-blue-900 font-semibold">
                {verificationResult.expectedHash}
              </div>
            </div>
          </div>

          {/* Detailed Diagnosis */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Integrity Verdict:</span>
            {verificationResult.isAuthentic ? (
              <p className="text-slate-700 leading-relaxed">
                The cryptographic hash of the provided file corresponds byte-for-byte to the official distribution certified on the blockchain. The application is safe to run and has not been infected or altered since release.
              </p>
            ) : (
              <p className="text-rose-800 leading-relaxed font-medium">
                WARNING: The uploaded binary does not match the official smart contract record. Possible causes include an unauthorized cracked version, binary tampering, backdoor injection, or incomplete download. Do not execute this binary in sensitive environments.
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate('verify', selectedLicenseId)}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold transition-colors cursor-pointer"
            >
              Inspect {selectedLicenseId} License On-Chain →
            </button>
            <button
              onClick={() => {
                setFile(null);
                setFileName('');
                setUploadedHash('');
                setVerificationResult({ status: null, isAuthentic: false, computedHash: '', expectedHash: '', message: '' });
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              Reset Verifier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
