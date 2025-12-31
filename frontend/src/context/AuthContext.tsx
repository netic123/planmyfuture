import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse } from '../types';
import i18n from '../i18n';

interface AuthContextType {
  user: AuthResponse | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserLanguage: (language: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      const userData = JSON.parse(storedUser) as AuthResponse;
      setUser(userData);
      // Set language from user preference
      if (userData.preferredLanguage) {
        i18n.changeLanguage(userData.preferredLanguage);
        localStorage.setItem('language', userData.preferredLanguage);
      }
    }
  }, []);

  const login = (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    // Set language from user preference on login
    if (data.preferredLanguage) {
      i18n.changeLanguage(data.preferredLanguage);
      localStorage.setItem('language', data.preferredLanguage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCompanyId');
    setUser(null);
  };

  const updateUserLanguage = (language: string) => {
    if (user) {
      const updatedUser = { ...user, preferredLanguage: language };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, updateUserLanguage }}>
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

