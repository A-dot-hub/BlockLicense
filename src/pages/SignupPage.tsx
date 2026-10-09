import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { BlockLicenseLogo } from '../components/BlockLicenseLogo';
import {
  ShieldCheck,
  Building2,
  User,
  Mail,
  Lock,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Cpu
} from 'lucide-react';

interface SignupPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const { address } = useWallet();

  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR'>('VENDOR_ADMIN');
  const [walletAddress, setWalletAddress] = useState(address || '');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the BlockLicense cryptographic terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await signup({
        name,
        email,
        password,
        role,
        organization,
        walletAddress
      });
      if (ok) {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white border border-[#013330]/20 rounded-3xl p-8 sm:p-10 metamask-hero-shadow space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="mb-2">
              <BlockLicenseLogo size={34} variant="full" theme="light" interactive={true} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#013330] font-display">
              Create Enterprise Account
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Join the decentralized software authenticity and license management protocol.
            </p>
          </div>

          <button
            onClick={() => onNavigate('login')}
            className="text-xs text-[#013330] hover:underline font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Already registered? Log in →
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#013330] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Abhishek Jaiswar"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#013330] focus:bg-white placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#013330] mb-1.5">
                Organization / Software Company
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="e.g. SecureSuite Labs Ltd"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#013330] focus:bg-white placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#013330] mb-1.5">
                Corporate Email Address *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@enterprise.corp"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#013330] focus:bg-white placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#013330] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#013330] focus:bg-white placeholder:text-slate-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#013330]">
              Protocol Role *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'VENDOR_ADMIN',
                  title: 'Software Publisher',
                  desc: 'Issue licenses, record release hashes, manage revocations.'
                },
                {
                  id: 'CUSTOMER',
                  title: 'Enterprise Customer',
                  desc: 'Receive digital licenses, transfer seats, verify binaries.'
                },
                {
                  id: 'AUDITOR',
                  title: 'Security Auditor',
                  desc: 'Public verification, checksum auditing, compliance tracking.'
                }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setRole(opt.id as any)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === opt.id
                      ? 'bg-emerald-50/70 border-[#013330] text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-[#013330]">{opt.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug font-medium">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bound Wallet Address */}
          <div>
            <label className="block text-xs font-bold text-[#013330] mb-1.5">
              Ethereum Wallet Address (Bound Identity)
            </label>
            <div className="relative">
              <Wallet size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={walletAddress}
                onChange={e => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#013330] focus:outline-none focus:border-[#013330] focus:bg-white font-mono font-bold"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Used for smart contract signatures when interacting with the Hardhat / Sepolia network.
            </span>
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded bg-white border-slate-300 text-[#013330] focus:ring-0"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer leading-relaxed font-medium">
              I agree to the BlockLicense Cryptographic Integrity Protocol, recognizing that smart contract transactions written to the Ethereum Virtual Machine are immutable.
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#013330] hover:bg-[#024945] disabled:bg-slate-300 text-xs font-bold text-white rounded-xl transition-colors shadow-md shadow-[#013330]/20 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Cpu size={14} className="animate-spin text-white" />
                  <span>Registering Protocol Identity...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Enter Console</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
