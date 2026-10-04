import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@tapza/shared-types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: { email: string; password: string; name: string; phone?: string; role?: UserRole }) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('tapza_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('tapza_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify token session:', err);
        localStorage.removeItem('tapza_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const newToken = res.data.data.token;
      localStorage.setItem('tapza_token', newToken);
      setToken(newToken);
      setUser(res.data.data.user);
    }
    return res.data;
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string; role?: UserRole }) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      const newToken = res.data.data.token;
      localStorage.setItem('tapza_token', newToken);
      setToken(newToken);
      setUser(res.data.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('tapza_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
