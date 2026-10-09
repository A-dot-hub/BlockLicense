import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  WalletState,
  HARDHAT_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
  COMPANY_ADMIN_ADDRESS
} from '../services/blockchain';

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    networkName: 'Not Connected',
    isConnected: false,
    isMetaMask: false,
    isAdmin: false,
    balance: '0 ETH'
  });

  const updateWalletFromAccounts = async (accounts: string[]) => {
    if (!accounts || accounts.length === 0) {
      setWallet({
        address: null,
        chainId: null,
        networkName: 'Not Connected',
        isConnected: false,
        isMetaMask: false,
        isAdmin: false,
        balance: '0 ETH'
      });
      return;
    }

    const addr = accounts[0];
    const isAdmin = addr.toLowerCase() === COMPANY_ADMIN_ADDRESS.toLowerCase();

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const balanceBig = await provider.getBalance(addr);
      const balanceEth = parseFloat(ethers.formatEther(balanceBig)).toFixed(4) + ' ETH';

      let netName = `Chain ID: ${chainId}`;
      if (chainId === HARDHAT_CHAIN_ID) netName = 'Hardhat Localhost (31337)';
      else if (chainId === SEPOLIA_CHAIN_ID) netName = 'Sepolia Testnet';
      else if (chainId === 1) netName = 'Ethereum Mainnet';

      setWallet({
        address: addr,
        chainId,
        networkName: netName,
        isConnected: true,
        isMetaMask: true,
        isAdmin,
        balance: balanceEth
      });
    } catch {
      setWallet({
        address: addr,
        chainId: HARDHAT_CHAIN_ID,
        networkName: 'Connected',
        isConnected: true,
        isMetaMask: true,
        isAdmin,
        balance: '0 ETH'
      });
    }
  };

  // Check if MetaMask is already connected on load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            await updateWalletFromAccounts(accounts);
          }
        } catch (err) {
          console.warn('MetaMask check error:', err);
        }
      }
    };

    checkExistingConnection();

    // Listen to account and chain changes
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accs: string[]) => {
        updateWalletFromAccounts(accs);
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      ethereum.on?.('accountsChanged', handleAccountsChanged);
      ethereum.on?.('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        ethereum.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts'
        });
        if (accounts && accounts.length > 0) {
          await updateWalletFromAccounts(accounts);
        }
      } catch (err: any) {
        console.error('Wallet connection error:', err);
        throw err;
      }
    } else {
      alert('MetaMask or Web3 wallet extension not detected. Please install MetaMask to connect your wallet.');
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      chainId: null,
      networkName: 'Not Connected',
      isConnected: false,
      isMetaMask: false,
      isAdmin: false,
      balance: '0 ETH'
    });
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
        switchNetwork
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
