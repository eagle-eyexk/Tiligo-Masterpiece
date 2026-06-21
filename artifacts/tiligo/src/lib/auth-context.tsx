import React, { createContext, useContext, useState, useEffect } from 'react';
import { Business, Delivery } from '@workspace/api-client-react';

interface AuthContextType {
  business: Business | null;
  courier: Delivery | null;
  isAdmin: boolean;
  loginBusiness: (business: Business) => void;
  loginCourier: (courier: Delivery) => void;
  loginAdmin: () => void;
  logoutBusiness: () => void;
  logoutCourier: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(() => {
    try {
      const saved = localStorage.getItem('tiligo-business');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [courier, setCourier] = useState<Delivery | null>(() => {
    try {
      const saved = localStorage.getItem('tiligo-courier');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('tiligo-admin') === 'true';
  });

  const loginBusiness = (b: Business) => {
    setBusiness(b);
    localStorage.setItem('tiligo-business', JSON.stringify(b));
  };

  const loginCourier = (c: Delivery) => {
    setCourier(c);
    localStorage.setItem('tiligo-courier', JSON.stringify(c));
  };

  const loginAdmin = () => {
    setIsAdmin(true);
    localStorage.setItem('tiligo-admin', 'true');
  };

  const logoutBusiness = () => {
    setBusiness(null);
    localStorage.removeItem('tiligo-business');
  };

  const logoutCourier = () => {
    setCourier(null);
    localStorage.removeItem('tiligo-courier');
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('tiligo-admin');
  };

  return (
    <AuthContext.Provider value={{
      business, courier, isAdmin,
      loginBusiness, loginCourier, loginAdmin,
      logoutBusiness, logoutCourier, logoutAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}