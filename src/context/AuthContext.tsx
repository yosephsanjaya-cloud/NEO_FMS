import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  group: string;
  role: string;
  riskDomain: 'FRAUD ONLY' | 'AML ONLY' | 'FULL ACCESS';
  escalationPath?: string;
  approvalLevel?: string;
  email: string;
  avatar: string;
  loginMethod: 'credential' | 'google_sso';
  lastLoginAt: string;
}

export interface DemoAccountItem {
  username: string;
  password: string;
  fullName: string;
  group: string;
  role: string;
  riskDomain: 'FRAUD ONLY' | 'AML ONLY' | 'FULL ACCESS';
  escalationPath: string;
  approvalLevel: string;
  email: string;
  avatar: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    username: 'sysadmin',
    password: 'Sandi!234',
    fullName: 'Yoseph Sanjaya',
    group: 'IT DCA Maker Checker',
    role: 'Lead Fraud Ops & AML',
    riskDomain: 'FULL ACCESS',
    escalationPath: 'Direct Execution / Super Admin Override',
    approvalLevel: 'System Admin (Full Access)',
    email: 'yoseph.sanjaya@banksampoerna.com',
    avatar: 'YS',
    description: 'Full Access (System Admin)'
  },
  {
    username: 'afcl1',
    password: 'Sandi!234',
    fullName: 'Anti-Fraud Officer L1',
    group: 'AFC L1',
    role: 'Fraud',
    riskDomain: 'FRAUD ONLY',
    escalationPath: 'Navigasi approval berlanjut ke AFC L2',
    approvalLevel: 'Fraud Maker / Triage L1',
    email: 'afcl1@banksampoerna.com',
    avatar: 'F1',
    description: 'AFC L1 (Fraud Maker)'
  },
  {
    username: 'afcl2',
    password: 'Sandi!234',
    fullName: 'Anti-Fraud Team Lead L2',
    group: 'AFC L2',
    role: 'Fraud Checker / Approver',
    riskDomain: 'FRAUD ONLY',
    escalationPath: 'Final Sign-off / Lead Approver',
    approvalLevel: 'Fraud Approver / Lead L2',
    email: 'afcl2@banksampoerna.com',
    avatar: 'F2',
    description: 'AFC L2 (Fraud Checker)'
  },
  {
    username: 'analystl1',
    password: 'Sandi!234',
    fullName: 'AML Analyst L1',
    group: 'Analyst L1',
    role: 'AML',
    riskDomain: 'AML ONLY',
    escalationPath: 'Navigasi approval berlanjut ke Analyst L2',
    approvalLevel: 'AML Maker / Analyst L1',
    email: 'analystl1@banksampoerna.com',
    avatar: 'A1',
    description: 'Analyst L1 (AML Maker)'
  },
  {
    username: 'analystl2',
    password: 'Sandi!234',
    fullName: 'AML Senior Analyst L2',
    group: 'Analyst L2',
    role: 'AML Checker / Approver',
    riskDomain: 'AML ONLY',
    escalationPath: 'Final Compliance Sign-off / STR Approver',
    approvalLevel: 'AML Approver / Senior L2',
    email: 'analystl2@banksampoerna.com',
    avatar: 'A2',
    description: 'Analyst L2 (AML Checker)'
  }
];

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => LoginResult;
  loginWithGoogleSSO: () => void;
  logout: () => void;
}

const DEFAULT_SYSADMIN_USER: AuthUser = {
  id: 'USR-001',
  username: 'sysadmin',
  fullName: 'Yoseph Sanjaya',
  group: 'IT DCA Maker Checker',
  role: 'Lead Fraud Ops & AML',
  riskDomain: 'FULL ACCESS',
  escalationPath: 'Direct Execution / Super Admin Override',
  approvalLevel: 'System Admin (Full Access)',
  email: 'yoseph.sanjaya@banksampoerna.com',
  avatar: 'YS',
  loginMethod: 'credential',
  lastLoginAt: new Date().toLocaleString('id-ID')
};

const DEFAULT_SSO_USER: AuthUser = {
  id: 'USR-SSO-001',
  username: 'yoseph.sanjaya',
  fullName: 'Yoseph Sanjaya',
  group: 'AFC L2',
  role: 'Lead Fraud Ops & AML (Google SSO)',
  riskDomain: 'FULL ACCESS',
  escalationPath: 'Super Admin Override',
  approvalLevel: 'Enterprise Google SSO',
  email: 'yoseph.sanjaya@banksampoerna.com',
  avatar: 'YS',
  loginMethod: 'google_sso',
  lastLoginAt: new Date().toLocaleString('id-ID')
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAuthenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('fms_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      if (localStorage.getItem('isAuthenticated') === 'true') {
        return DEFAULT_SYSADMIN_USER;
      }
      return null;
    } catch {
      return null;
    }
  });

  const login = (usernameInput: string, passwordInput: string): LoginResult => {
    const trimmedUsername = usernameInput.trim().toLowerCase();
    
    // Check registered demo accounts
    const matchedAccount = DEMO_ACCOUNTS.find(
      acc => acc.username.toLowerCase() === trimmedUsername
    );

    if (matchedAccount && (passwordInput === matchedAccount.password || passwordInput === 'Sandi!234')) {
      const loggedUser: AuthUser = {
        id: `USR-${matchedAccount.username.toUpperCase()}`,
        username: matchedAccount.username,
        fullName: matchedAccount.fullName,
        group: matchedAccount.group,
        role: matchedAccount.role,
        riskDomain: matchedAccount.riskDomain,
        escalationPath: matchedAccount.escalationPath,
        approvalLevel: matchedAccount.approvalLevel,
        email: matchedAccount.email,
        avatar: matchedAccount.avatar,
        loginMethod: 'credential',
        lastLoginAt: new Date().toLocaleString('id-ID')
      };
      
      try {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('fms_user', JSON.stringify(loggedUser));
      } catch (err) {
        console.error('Error saving auth to localStorage', err);
      }
      
      setUser(loggedUser);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Username atau kata sandi tidak valid!' 
    };
  };

  const loginWithGoogleSSO = () => {
    const ssoUser: AuthUser = {
      ...DEFAULT_SSO_USER,
      lastLoginAt: new Date().toLocaleString('id-ID')
    };

    try {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('fms_user', JSON.stringify(ssoUser));
    } catch (err) {
      console.error('Error saving SSO auth to localStorage', err);
    }

    setUser(ssoUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('fms_user');
    } catch (err) {
      console.error('Error clearing auth from localStorage', err);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, loginWithGoogleSSO, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
