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
}

const STORAGE_KEY_AUTH = 'blocklicense_user_session_v1';
const STORAGE_KEY_USERS = 'blocklicense_users_registry_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [user]);

  const getRegisteredUsers = (): Array<UserProfile & { password?: string }> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 400));
    const users = getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();

    const matched = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (matched) {
      // Validate password if stored
      if (matched.password && matched.password !== password) {
        throw new Error('Incorrect password.');
      }
      const { password: _, ...profile } = matched;
      setUser(profile);
      return true;
    }

    // If user has not signed up yet
    throw new Error('Account not found. Please click Sign Up to create your account.');
  };

  const loginWithWallet = async (walletAddress: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 300));
    const cleanAddr = walletAddress.toLowerCase();
    const users = getRegisteredUsers();

    // Check if wallet is already linked to a registered account
    const matched = users.find(u => u.walletAddress?.toLowerCase() === cleanAddr);
    if (matched) {
      const { password: _, ...profile } = matched;
      setUser(profile);
      return true;
    }

    // Automatically establish session for new wallet identity
    const walletUser: UserProfile = {
      id: 'wallet-' + walletAddress.slice(2, 8),
      name: `Web3 Operator (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})`,
      email: `${walletAddress.slice(2, 8).toLowerCase()}@web3.identity`,
      role: 'CUSTOMER',
      walletAddress,
      organization: 'Verified Software Licensee',
      joinedAt: new Date().toISOString()
    };

    // Save to user registry
    users.push(walletUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

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
    await new Promise(r => setTimeout(r, 450));
    const users = getRegisteredUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const newUser: UserProfile & { password?: string } = {
      id: 'usr-' + Date.now(),
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      organization: data.organization?.trim() || 'Independent Enterprise',
      walletAddress: data.walletAddress?.trim() || undefined,
      password: data.password,
      joinedAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

    const { password: _, ...profile } = newUser;
    setUser(profile);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loginWithCredentials,
        loginWithWallet,
        signup,
        logout
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
