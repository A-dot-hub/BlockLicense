import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { BlockLicenseLogo } from './BlockLicenseLogo';
import {
  ChevronDown,
  Menu,
  X,
  Wallet,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

import { HARDHAT_CHAIN_ID } from '../services/blockchain';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const {
    address,
    chainId,
    isConnected,
    isAdmin,
    networkName,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork
  } = useWallet();

  const { user, isAuthenticated, logout } = useAuth();

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

  return (
    <header className="sticky top-0 z-40 w-full bg-[#013330] text-white shadow-xl border-b border-[#024945]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark with logo */}
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none cursor-pointer"
        >
          <BlockLicenseLogo size={36} variant="full" theme="dark" interactive={true} />
        </button>

        {/* Zone 2: Navigation links */}
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
          
          {/* Web3 Wallet Connect / Status */}
          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => {
                  setAccountDropdownOpen(!accountDropdownOpen);
                  setUserMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-[#024440] hover:bg-[#035954] border border-[#046e67] rounded-xl text-white shadow-sm transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-slate-100">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
                {isAdmin && (
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                    Admin
                  </span>
                )}
                <ChevronDown size={14} className="text-slate-300" />
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 border border-blue-200 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                      Connected Wallet
                    </div>
                    <div className="font-mono text-[#013330] font-bold mt-1 truncate">
                      {address}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Network: <strong className="text-[#013330]">{networkName}</strong></span>
                      <span>Balance: <strong className="font-mono text-emerald-700">{balance}</strong></span>
                    </div>

                    {chainId !== HARDHAT_CHAIN_ID && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200">
                        <div className="text-[10px] text-amber-700 font-semibold mb-1">
                          ⚠️ Connected to {networkName || 'Mainnet'}
                        </div>
                        <button
                          onClick={async () => {
                            await switchNetwork(HARDHAT_CHAIN_ID);
                            setAccountDropdownOpen(false);
                          }}
                          className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span>⚡ Switch to Hardhat (10,000 ETH)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-2 pt-2">
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut size={14} />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => connectWallet()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#024440] hover:bg-[#035954] border border-[#046e67] rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Wallet size={14} className="text-emerald-400" />
              <span>Connect Wallet</span>
            </button>
          )}

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
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-50 text-[#013330] rounded font-bold border border-emerald-200">
                        {user.role}
                      </span>
                      {user.organization && (
                        <span className="text-[10px] text-slate-500 truncate">
                          {user.organization}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-2 pt-1 pb-1">
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

          <div className="pt-3 border-t border-[#024945] space-y-2">
            {!isConnected && (
              <button
                onClick={() => {
                  connectWallet();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs text-white bg-[#024440] hover:bg-[#035954] border border-[#046e67] rounded-lg font-semibold flex items-center justify-center gap-1.5"
              >
                <Wallet size={14} className="text-emerald-400" />
                <span>Connect Wallet</span>
              </button>
            )}

            {!isAuthenticated ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSelectTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center text-xs text-white bg-[#024440] rounded-lg font-semibold flex items-center justify-center gap-1"
                >
                  <LogIn size={13} />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center text-xs text-[#013330] bg-emerald-400 rounded-lg font-bold shadow-sm flex items-center justify-center gap-1"
                >
                  <UserPlus size={13} />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-300 font-semibold truncate">
                  Logged in as {user?.name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    onSelectTab('landing');
                  }}
                  className="text-rose-400 hover:text-rose-300 font-bold"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
