import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../services/blockchain';
import { BlockLicenseLogo } from './BlockLicenseLogo';
import {
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Wallet,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  User,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onRefreshData }) => {
  const {
    address,
    isConnected,
    isAdmin,
    networkName,
    connectWallet,
    selectDemoAccount
  } = useWallet();

  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'issue', label: 'Issue License' },
    { id: 'licenses', label: 'Licenses' },
    { id: 'verify', label: 'Verify License' },
    { id: 'verify-software', label: 'Verify Software' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'revoke', label: 'Revoke' }
  ];

  const handleResetDemo = () => {
    StorageService.resetToDemo();
    if (onRefreshData) onRefreshData();
    setAccountDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#013330] text-white shadow-xl border-b border-[#024945]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark with custom logo */}
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none cursor-pointer"
        >
          <BlockLicenseLogo size={36} variant="full" theme="dark" interactive={true} />
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-200">
          {navLinks.map(link => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-emerald-300 border-b-2 border-emerald-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions (Wallet & Auth Controls) */}
        <div className="flex items-center gap-2.5">
          
          {/* Web3 Wallet Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setAccountDropdownOpen(!accountDropdownOpen);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-[#024440] hover:bg-[#035954] border border-[#046e67] rounded-xl text-white shadow-sm transition-colors cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span className="hidden sm:inline font-semibold text-slate-100">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect'}
              </span>
              <span className="text-[11px] text-emerald-300 font-semibold hidden md:inline">
                ({isAdmin ? 'Admin' : 'Owner'})
              </span>
              <ChevronDown size={14} className="text-slate-300" />
            </button>

            {accountDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 border border-blue-200 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in">
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Connected Wallet
                  </div>
                  <div className="font-mono text-[#013330] font-bold mt-1 truncate">
                    {address || 'Not connected'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Network: <span className="text-[#013330] font-bold">{networkName}</span>
                  </div>
                </div>

                {/* Role Switcher for Testing */}
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                    Switch Test Account / Role
                  </div>
                  <div className="space-y-1">
                    {DEMO_ACCOUNTS.map(acc => {
                      const isCurrent = address?.toLowerCase() === acc.address.toLowerCase();
                      return (
                        <button
                          key={acc.address}
                          onClick={() => {
                            selectDemoAccount(acc.address);
                            setAccountDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-50 text-[#013330] font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{acc.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                            </div>
                          </div>
                          {isCurrent && <CheckCircle2 size={13} className="text-[#013330] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live MetaMask Connect */}
                <div className="px-2 pt-1 pb-1">
                  <button
                    onClick={() => {
                      connectWallet();
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-[#013330] rounded-lg flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <Wallet size={14} className="text-amber-500" />
                    <span>Connect Live MetaMask</span>
                  </button>

                  <button
                    onClick={handleResetDemo}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors mt-0.5 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Demo State</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Authentication State Button / Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setAccountDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs bg-[#024440] hover:bg-[#035954] border border-[#046e67] text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-400 text-[#013330] flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-semibold max-w-[100px] truncate text-white">
                  {user.name}
                </span>
                <ChevronDown size={13} className="text-emerald-300" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 border border-blue-200 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                    <div className="font-bold text-[#013330]">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <span className="inline-block mt-1 text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-50 text-[#013330] rounded font-bold border border-emerald-200">
                      {user.role}
                    </span>
                  </div>

                  {/* Switch Demo Roles in Session */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-[11px] text-slate-500 font-semibold mb-1">
                      Quick Demo Role Switch:
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          switchDemoRole('VENDOR_ADMIN');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1 rounded text-slate-700 hover:bg-emerald-50 hover:text-[#013330] transition-colors"
                      >
                        Publisher Admin
                      </button>
                      <button
                        onClick={() => {
                          switchDemoRole('CUSTOMER');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1 rounded text-slate-700 hover:bg-emerald-50 hover:text-[#013330] transition-colors"
                      >
                        Enterprise Customer
                      </button>
                      <button
                        onClick={() => {
                          switchDemoRole('AUDITOR');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1 rounded text-slate-700 hover:bg-emerald-50 hover:text-[#013330] transition-colors"
                      >
                        Security Auditor
                      </button>
                    </div>
                  </div>

                  <div className="px-2 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        onSelectTab('landing');
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut size={14} />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSelectTab('login')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#024440] hover:bg-[#035954] border border-[#046e67] rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogIn size={13} />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onSelectTab('signup')}
                className="px-3.5 py-1.5 text-xs font-bold text-[#013330] bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-md shadow-black/20 cursor-pointer flex items-center gap-1"
              >
                <UserPlus size={13} />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-200 hover:text-white rounded-lg hover:bg-[#024440] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 border-t border-[#024945] bg-[#013330] space-y-1">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                onSelectTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                currentTab === link.id
                  ? 'bg-[#024440] text-emerald-300 font-bold'
                  : 'text-slate-200 hover:bg-[#024440]'
              }`}
            >
              {link.label}
            </button>
          ))}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-[#024945] flex gap-2">
              <button
                onClick={() => {
                  onSelectTab('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs text-white bg-[#024440] rounded-lg font-semibold"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  onSelectTab('signup');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs text-[#013330] bg-emerald-400 rounded-lg font-bold shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
