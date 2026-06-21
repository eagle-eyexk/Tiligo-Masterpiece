import React, { createContext, useContext, useState } from 'react';
import { Business, Delivery, Customer } from '@workspace/api-client-react';

interface AuthContextType {
  business: Business | null;
  courier: Delivery | null;
  customer: Customer | null;
  customerToken: string | null;
  isAdmin: boolean;
  loginBusiness: (business: Business) => void;
  loginCourier: (courier: Delivery) => void;
  loginCustomer: (customer: Customer, token: string) => void;
  loginAdmin: () => void;
  logoutBusiness: () => void;
  logoutCourier: () => void;
  logoutCustomer: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(() => {
    try { const s = localStorage.getItem('tiligo-business'); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  const [courier, setCourier] = useState<Delivery | null>(() => {
    try { const s = localStorage.getItem('tiligo-courier'); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  const [customer, setCustomer] = useState<Customer | null>(() => {
    try { const s = localStorage.getItem('tiligo-customer'); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  const [customerToken, setCustomerToken] = useState<string | null>(() =>
    localStorage.getItem('tiligo-customer-token')
  );

  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem('tiligo-admin') === 'true');

  const loginBusiness = (b: Business) => { setBusiness(b); localStorage.setItem('tiligo-business', JSON.stringify(b)); };
  const loginCourier = (c: Delivery) => { setCourier(c); localStorage.setItem('tiligo-courier', JSON.stringify(c)); };
  const loginCustomer = (c: Customer, token: string) => {
    setCustomer(c);
    setCustomerToken(token);
    localStorage.setItem('tiligo-customer', JSON.stringify(c));
    localStorage.setItem('tiligo-customer-token', token);
  };
  const loginAdmin = () => { setIsAdmin(true); localStorage.setItem('tiligo-admin', 'true'); };

  const logoutBusiness = () => { setBusiness(null); localStorage.removeItem('tiligo-business'); };
  const logoutCourier = () => { setCourier(null); localStorage.removeItem('tiligo-courier'); };
  const logoutCustomer = () => {
    setCustomer(null);
    setCustomerToken(null);
    localStorage.removeItem('tiligo-customer');
    localStorage.removeItem('tiligo-customer-token');
  };
  const logoutAdmin = () => { setIsAdmin(false); localStorage.removeItem('tiligo-admin'); };

  return (
    <AuthContext.Provider value={{
      business, courier, customer, customerToken, isAdmin,
      loginBusiness, loginCourier, loginCustomer, loginAdmin,
      logoutBusiness, logoutCourier, logoutCustomer, logoutAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
