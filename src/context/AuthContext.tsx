import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR';
  walletAddress?: string;
  organization?: string;
  avatar?: string;
  joinedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  loginWithWallet: (walletAddress: string) => Promise<boolean>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: 'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR';
    organization?: string;
    walletAddress?: string;
  }) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: 'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR') => void;
}

const STORAGE_KEY_AUTH = 'blocklicense_user_session_v1';

const DEMO_USERS: Record<'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR', UserProfile> = {
  VENDOR_ADMIN: {
    id: 'usr-admin-1',
    name: 'Abhishek Jaiswar',
    email: 'abhishek@blocklicense.io',
    role: 'VENDOR_ADMIN',
    organization: 'BlockLicense Systems Inc.',
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    joinedAt: '2026-01-10T08:00:00Z'
  },
  CUSTOMER: {
    id: 'usr-cust-1',
    name: 'Rahul Verma',
    email: 'rahul.verma@fintech.io',
    role: 'CUSTOMER',
    organization: 'FinTech Dynamics Corp',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    joinedAt: '2026-03-15T11:20:00Z'
  },
  AUDITOR: {
    id: 'usr-audit-1',
    name: 'Elena Rostova',
    email: 'elena@cyberdefense.org',
    role: 'AUDITOR',
    organization: 'Independent Software Security Audit',
    walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    joinedAt: '2026-05-20T14:45:00Z'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS.VENDOR_ADMIN;
      }
    }
    // Default to vendor admin for seamless demo readiness
    return DEMO_USERS.VENDOR_ADMIN;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [user]);

  const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
    // Artificial mini-delay to simulate credential verification
    await new Promise(r => setTimeout(r, 450));

    // Match against demo users or synthesize an enterprise account
    const matched = Object.values(DEMO_USERS).find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (matched) {
      setUser(matched);
      return true;
    }

    // Dynamic login fallback for any email
    const dynamicUser: UserProfile = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role: 'VENDOR_ADMIN',
      organization: 'Enterprise Partner Org',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      joinedAt: new Date().toISOString()
    };
    setUser(dynamicUser);
    return true;
  };

  const loginWithWallet = async (walletAddress: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 350));
    const cleanAddr = walletAddress.toLowerCase();

    let matchedRole: 'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR' = 'CUSTOMER';
    if (cleanAddr.includes('f39f') || cleanAddr === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266') {
      matchedRole = 'VENDOR_ADMIN';
    }

    const walletUser: UserProfile = {
      id: 'wallet-' + walletAddress.slice(2, 8),
      name: `Web3 Operator (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`,
      email: `${walletAddress.slice(2, 8)}@web3.identity`,
      role: matchedRole,
      walletAddress,
      organization: matchedRole === 'VENDOR_ADMIN' ? 'Authorized Software Company' : 'Verified Software Licensee',
      joinedAt: new Date().toISOString()
    };

    setUser(walletUser);
    return true;
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR';
    organization?: string;
    walletAddress?: string;
  }): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      organization: data.organization || 'Independent Enterprise',
      walletAddress: data.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      joinedAt: new Date().toISOString()
    };

    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchDemoRole = (role: 'VENDOR_ADMIN' | 'CUSTOMER' | 'AUDITOR') => {
    setUser(DEMO_USERS[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loginWithCredentials,
        loginWithWallet,
        signup,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
