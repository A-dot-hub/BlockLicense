import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { BlockLicenseLogo } from '../components/BlockLicenseLogo';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  Wallet,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { loginWithCredentials, loginWithWallet, switchDemoRole } = useAuth();
  const { address, isConnected, connectWallet } = useWallet();

  const [authMode, setAuthMode] = useState<'credentials' | 'wallet'>('credentials');
  const [email, setEmail] = useState('abhishek@blocklicense.io');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      const ok = await loginWithCredentials(email, password);
      if (ok) {
        onNavigate('dashboard');
      } else {
        setError('Invalid credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletAuth = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      let targetAddr = address;
      if (!targetAddr) {
        await connectWallet();
        targetAddr = address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
      }
      const ok = await loginWithWallet(targetAddr);
      if (ok) {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Wallet signature rejected.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoSelect = (role: 'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR') => {
    switchDemoRole(role);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white border border-blue-200 rounded-3xl overflow-hidden metamask-hero-shadow">
        
        {/* Left Side: MetaMask-style Holographic Branding Panel in #013330 */}
        <div className="p-8 sm:p-10 bg-gradient-to-br from-[#013330] via-[#024440] to-[#012220] text-white border-b md:border-b-0 md:border-r border-[#024945] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="mb-6">
              <BlockLicenseLogo size={42} variant="full" theme="dark" interactive={true} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug font-display">
              Enterprise Software Security on EVM Consensus
            </h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Authenticate via encrypted Web3 signatures or enterprise organization SSO to manage digital license issuance, ownership transfers, and SHA-256 binary validation.
            </p>
          </div>

          {/* Interactive Status Display */}
          <div className="my-8 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 font-mono text-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[11px]">Consensus Node</span>
              <span className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-sans font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live RPC Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[11px]">Chain Invariant</span>
              <span className="text-white font-bold">Hardhat (31337) / Sepolia</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[11px]">Integrity Hash</span>
              <span className="text-emerald-300 text-[10px] truncate max-w-[150px] font-bold">
                0xa3f7c9b1...4a6
              </span>
            </div>
          </div>

          {/* Bottom Trust Markers */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span>Non-Custodial</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Knowledge Proofs</span>
            <span aria-hidden="true">·</span>
            <span>EIP-712 Ready</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Auth Mode Tabs */}
            <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('credentials')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  authMode === 'credentials'
                    ? 'bg-[#013330] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Email & Credentials
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('wallet')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'wallet'
                    ? 'bg-[#013330] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet size={13} className={authMode === 'wallet' ? 'text-emerald-400' : 'text-amber-500'} />
                <span>Web3 Wallet</span>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#013330] font-display">
                {authMode === 'credentials' ? 'Welcome Back' : 'Sign In With Ethereum'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {authMode === 'credentials'
                  ? 'Access your software license authority console.'
                  : 'Verify cryptographic ownership of your Ethereum address.'}
              </p>
            </div>

            {error && (
              <div className="p-3 mb-5 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {authMode === 'credentials' ? (
              /* Credentials Form */
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#013330] mb-1.5">
                    Organization / Work Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#013330] focus:bg-white placeholder:text-slate-400 transition-colors font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#013330]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setError('Password reset instructions sent to registered administrator.')}
                      className="text-[11px] text-[#013330] hover:underline font-bold transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#013330] focus:bg-white placeholder:text-slate-400 font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded bg-white border-slate-300 text-[#013330] focus:ring-0"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer font-medium">
                    Stay authenticated for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-[#013330] hover:bg-[#024945] disabled:bg-slate-300 text-xs font-bold text-white rounded-xl transition-colors shadow-md shadow-[#013330]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Cpu size={14} className="animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Console</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Wallet Auth Flow */
              <div className="space-y-4 py-2">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Wallet size={16} className="text-amber-500" />
                    <span className="font-bold text-[#013330]">Connected Ethereum Identity</span>
                  </div>
                  <div className="font-mono text-[#013330] text-[11px] break-all bg-white p-2.5 rounded-xl border border-slate-200 font-bold">
                    {address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    By signing in with your wallet, you execute a cryptographically signed non-transaction challenge proving private key control.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleWalletAuth}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-[#013330] hover:bg-[#024945] disabled:bg-slate-300 text-xs font-bold text-white rounded-xl transition-colors shadow-md shadow-[#013330]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Cpu size={14} className="animate-spin text-white" />
                      <span>Requesting Signature...</span>
                    </>
                  ) : (
                    <>
                      <Wallet size={15} className="text-emerald-400" />
                      <span>Sign in With Connected Wallet</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Demo Fast-Logins */}
            <div className="pt-6 mt-6 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 block mb-2 font-bold">
                One-Click Presentation Logins:
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('VENDOR_ADMIN')}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-slate-800 transition-colors text-center cursor-pointer"
                >
                  <strong className="block text-[#013330] font-bold">Vendor Admin</strong>
                  <span className="text-[10px] text-slate-500">Issuer / Deployer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('CUSTOMER')}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-slate-800 transition-colors text-center cursor-pointer"
                >
                  <strong className="block text-emerald-700 font-bold">Customer</strong>
                  <span className="text-[10px] text-slate-500">License Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('AUDITOR')}
                  className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-slate-800 transition-colors text-center cursor-pointer"
                >
                  <strong className="block text-amber-700 font-bold">Auditor</strong>
                  <span className="text-[10px] text-slate-500">Security Verifier</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-600 font-medium">
            <span>Don't have an enterprise account? </span>
            <button
              onClick={() => onNavigate('signup')}
              className="text-[#013330] hover:underline font-bold transition-colors cursor-pointer"
            >
              Sign up here →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
