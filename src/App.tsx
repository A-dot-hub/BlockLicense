import React, { useState, useEffect } from 'react';
import { WalletProvider } from './context/WalletContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { IssueLicensePage } from './pages/IssueLicensePage';
import { LicensesListPage } from './pages/LicensesListPage';
import { VerifyLicensePage } from './pages/VerifyLicensePage';
import { VerifySoftwarePage } from './pages/VerifySoftwarePage';
import { LicenseDetailPage } from './pages/LicenseDetailPage';
import { TransferLicensePage } from './pages/TransferLicensePage';
import { RevokeLicensePage } from './pages/RevokeLicensePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { BlockLicenseLogo } from './components/BlockLicenseLogo';
import { blockchainService } from './services/blockchain';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);
  const [dataVersion, setDataVersion] = useState<number>(0);

  // Check URL pathname or hash for deep linking (e.g. /verify/BL-2026-000001 or #login)
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/login' || hash === '#login') {
        setCurrentTab('login');
        return;
      }
      if (path === '/signup' || hash === '#signup') {
        setCurrentTab('signup');
        return;
      }
      if (path.startsWith('/verify/')) {
        const id = path.replace('/verify/', '');
        if (id) {
          setCurrentTab('verify');
          setRouteParam(id);
          return;
        }
      }
      if (hash.startsWith('#verify/')) {
        const id = hash.replace('#verify/', '');
        if (id) {
          setCurrentTab('verify');
          setRouteParam(id);
          return;
        }
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    window.addEventListener('hashchange', handleLocation);
    return () => {
      window.removeEventListener('popstate', handleLocation);
      window.removeEventListener('hashchange', handleLocation);
    };
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setRouteParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    setDataVersion(v => v + 1);
  };

  return (
    <AuthProvider>
      <WalletProvider>
        <div className="min-h-screen flex flex-col bg-[#cce7ff] text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-900">
          {/* Navigation Bar */}
          <Navbar
            currentTab={currentTab}
            onSelectTab={tab => handleNavigate(tab)}
            onRefreshData={handleRefresh}
          />

          {/* Main Content Body */}
          <main className="flex-1 pb-16">
            {currentTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
            {currentTab === 'dashboard' && <DashboardPage key={dataVersion} onNavigate={handleNavigate} />}
            {currentTab === 'issue' && <IssueLicensePage key={dataVersion} onNavigate={handleNavigate} />}
            {currentTab === 'licenses' && <LicensesListPage key={dataVersion} onNavigate={handleNavigate} />}
            {currentTab === 'verify' && (
              <VerifyLicensePage
                key={`${routeParam}-${dataVersion}`}
                initialLicenseId={routeParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'verify-software' && (
              <VerifySoftwarePage
                key={`${routeParam}-${dataVersion}`}
                initialLicenseId={routeParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'detail' && (
              <LicenseDetailPage
                key={`${routeParam}-${dataVersion}`}
                licenseId={routeParam || 'BL-2026-000001'}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'transfer' && (
              <TransferLicensePage
                key={`${routeParam}-${dataVersion}`}
                initialLicenseId={routeParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'revoke' && (
              <RevokeLicensePage
                key={`${routeParam}-${dataVersion}`}
                initialLicenseId={routeParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'login' && <LoginPage onNavigate={handleNavigate} />}
            {currentTab === 'signup' && <SignupPage onNavigate={handleNavigate} />}
          </main>

          {/* Global Footer in #013330 */}
          <footer className="border-t border-[#024945] bg-[#013330] text-slate-300 text-xs py-8 px-4 sm:px-6 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <BlockLicenseLogo size={24} variant="icon" theme="dark" />
                <span className="font-bold text-white font-display">BlockLicense</span>
                <span aria-hidden="true" className="text-emerald-500/50">·</span>
                <span className="text-slate-300">Blockchain Software License Ownership & Authenticity Verification</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-300 font-medium">
                <span className="font-mono text-emerald-300">
                  Contract: {blockchainService.shortenAddress(blockchainService.contractAddress)}
                </span>
                <span aria-hidden="true" className="text-emerald-500/50">·</span>
                <span>Solidity ^0.8.20 / Hardhat / FastAPI / React</span>
              </div>
            </div>
          </footer>
        </div>
      </WalletProvider>
    </AuthProvider>
  );
}
