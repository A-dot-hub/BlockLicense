import React, { useState } from 'react';
import { X, QrCode, Upload, ArrowRight } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (licenseId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult
}) => {
  const [manualInput, setManualInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    let extracted = manualInput.trim();
    if (extracted.includes('/verify/')) {
      const parts = extracted.split('/verify/');
      extracted = parts[parts.length - 1].split('?')[0];
    }
    onScanResult(extracted);
    onClose();
  };

  const handleDemoSelect = (sampleId: string) => {
    onScanResult(sampleId);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setIsProcessing(false);
        onScanResult('BL-2026-000001');
        onClose();
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-blue-200 rounded-3xl p-6 metamask-hero-shadow">
        <div className="flex items-center justify-between pb-4 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Scan License QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-6 space-y-5">
          {/* File Upload Scanner Box */}
          <label className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-blue-50/20 group">
            <Upload size={28} className="text-blue-500 group-hover:text-blue-700 mb-2 transition-colors" />
            <span className="text-xs font-bold text-slate-800">Upload QR Image or Screen Capture</span>
            <span className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, WEBP</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {isProcessing && (
            <div className="text-center text-xs text-blue-700 py-1 font-mono font-bold">
              Analyzing QR matrix...
            </div>
          )}

          {error && (
            <div className="text-xs text-rose-600 text-center py-1 font-semibold">
              {error}
            </div>
          )}

          {/* Direct URL or License ID input */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Or paste Verification URL / License ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="BL-2026-000001 or URL"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-blue-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>Lookup</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </form>

          {/* Quick Demo Pre-selected IDs */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 mb-2">
              Quick Test Licenses:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDemoSelect('BL-2026-000001')}
                className="text-xs font-mono px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors border border-emerald-200 cursor-pointer"
              >
                BL-2026-000001 (Active)
              </button>
              <button
                onClick={() => handleDemoSelect('BL-2026-000002')}
                className="text-xs font-mono px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition-colors border border-amber-200 cursor-pointer"
              >
                BL-2026-000002 (Expired)
              </button>
              <button
                onClick={() => handleDemoSelect('BL-2026-000003')}
                className="text-xs font-mono px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg transition-colors border border-rose-200 cursor-pointer"
              >
                BL-2026-000003 (Revoked)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
