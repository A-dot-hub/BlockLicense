import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { LicenseRecord } from '../types';

interface QRModalProps {
  license: LicenseRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToVerify?: (licenseId: string) => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  license,
  isOpen,
  onClose,
  onNavigateToVerify
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const verificationUrl = license
    ? `${window.location.origin}/verify/${license.licenseId}`
    : '';

  useEffect(() => {
    if (!license || !isOpen) return;
    const generateQr = async () => {
      try {
        const url = await QRCode.toDataURL(verificationUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setDataUrl(url);
      } catch (err) {
        console.error('QR code generation error:', err);
      }
    };
    generateQr();
  }, [license, isOpen, verificationUrl]);

  if (!isOpen || !license) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `BlockLicense-${license.licenseId}-QR.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-blue-200 rounded-3xl p-6 metamask-hero-shadow">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">License Verification QR</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{license.licenseId} · {license.softwareName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* QR Display */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="p-4 bg-white rounded-2xl border-2 border-blue-100 shadow-md">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR code for ${license.licenseId}`}
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-sm">
                Generating QR...
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 text-center mt-4 max-w-xs font-medium">
            Scan using any mobile camera or QR reader to instantly inspect blockchain verification truth.
          </p>
        </div>

        {/* URL Box */}
        <div className="p-3 bg-slate-50 border border-blue-100 rounded-xl mb-5 flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-700 truncate font-semibold">
            {verificationUrl}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Copy verification URL"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-blue-200 rounded-xl transition-colors cursor-pointer metamask-card-shadow"
          >
            <Download size={14} />
            <span>Download PNG</span>
          </button>

          {onNavigateToVerify && (
            <button
              onClick={() => {
                onClose();
                onNavigateToVerify(license.licenseId);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>Open Verify Page</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
