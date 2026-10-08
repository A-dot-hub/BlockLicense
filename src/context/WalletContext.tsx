import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WalletState,
  HARDHAT_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
  COMPANY_ADMIN_ADDRESS,
  DEMO_ACCOUNTS
} from '../services/blockchain';

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  selectDemoAccount: (address: string) => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isDemoAccount: boolean;
  activeDemoAccountName: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    address: COMPANY_ADMIN_ADDRESS, // Defaults to company admin for smooth first-time demo
    chainId: HARDHAT_CHAIN_ID,
    networkName: 'Hardhat Localhost (31337)',
    isConnected: true,
    isMetaMask: false,
    isAdmin: true,
    balance: '100.0 ETH'
  });

  const [activeDemoName, setActiveDemoName] = useState<string>('Software Company (Admin)');

  // Check if MetaMask is already connected on load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const currentChain = await (window as any).ethereum.request({ method: 'eth_chainId' });
            const chainIdDec = parseInt(currentChain, 16);
            const addr = accounts[0];
            const isAdmin = addr.toLowerCase() === COMPANY_ADMIN_ADDRESS.toLowerCase();
            setWallet({
              address: addr,
              chainId: chainIdDec,
              networkName: chainIdDec === SEPOLIA_CHAIN_ID ? 'Sepolia Testnet' : `Chain ID: ${chainIdDec}`,
              isConnected: true,
              isMetaMask: true,
              isAdmin,
              balance: '2.45 ETH'
            });
            setActiveDemoName('MetaMask Connected');
          }
        } catch (err) {
          console.warn('MetaMask check error:', err);
        }
      }
    };
    checkExistingConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts'
        });
        const currentChain = await (window as any).ethereum.request({ method: 'eth_chainId' });
        const chainIdDec = parseInt(currentChain, 16);
        const addr = accounts[0];
        const isAdmin = addr.toLowerCase() === COMPANY_ADMIN_ADDRESS.toLowerCase();

        setWallet({
          address: addr,
          chainId: chainIdDec,
          networkName: chainIdDec === SEPOLIA_CHAIN_ID ? 'Sepolia Testnet' : 'Localhost (31337)',
          isConnected: true,
          isMetaMask: true,
          isAdmin,
          balance: '5.12 ETH'
        });
        setActiveDemoName('MetaMask Account');
        return;
      } catch (err: any) {
        console.warn('User rejected or MetaMask unavailable:', err);
      }
    }
    // Fallback if MetaMask not available or rejected
    selectDemoAccount(COMPANY_ADMIN_ADDRESS);
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      chainId: null,
      networkName: 'Disconnected',
      isConnected: false,
      isMetaMask: false,
      isAdmin: false,
      balance: '0 ETH'
    });
    setActiveDemoName('None');
  };

  const selectDemoAccount = (address: string) => {
    const acc = DEMO_ACCOUNTS.find(a => a.address.toLowerCase() === address.toLowerCase()) || DEMO_ACCOUNTS[0];
    const isAdmin = acc.role === 'ADMIN' || acc.address.toLowerCase() === COMPANY_ADMIN_ADDRESS.toLowerCase();

    setWallet({
      address: acc.address,
      chainId: HARDHAT_CHAIN_ID,
      networkName: 'Hardhat Localhost (31337)',
      isConnected: true,
      isMetaMask: false,
      isAdmin,
      balance: '100.0 ETH'
    });
    setActiveDemoName(acc.name);
  };

  const switchNetwork = async (targetChainId: number) => {
    if (wallet.isMetaMask && typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const hexChain = '0x' + targetChainId.toString(16);
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexChain }]
        });
      } catch (err) {
        console.warn('Network switch error:', err);
      }
    }
    setWallet(prev => ({
      ...prev,
      chainId: targetChainId,
      networkName: targetChainId === SEPOLIA_CHAIN_ID ? 'Sepolia Testnet' : 'Hardhat Localhost (31337)'
    }));
  };

  return (
    <WalletContext.Provider
      value={{
        ...wallet,
        connectWallet,
        disconnectWallet,
        selectDemoAccount,
        switchNetwork,
        isDemoAccount: !wallet.isMetaMask && wallet.isConnected,
        activeDemoAccountName: activeDemoName
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
