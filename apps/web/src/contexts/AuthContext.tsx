"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { LoginInput, RegisterInput } from '@marketflow/validation';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  addresses?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

let refreshPromise: Promise<any> | null = null;

  // On mount, we want to try a refresh call to see if the user has an active session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh');
        }
        const res = await refreshPromise;
        setUser(res.data.data.user);
      } catch (err) {
        setUser(null);
        // Force backend to clear the invalid cookie to prevent middleware redirect loops
        await api.post('/auth/logout').catch(() => {});
      } finally {
        setLoading(false);
        refreshPromise = null;
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginInput) => {
    const res = await api.post('/auth/login', credentials);
    setUser(res.data.data.user);
    router.push('/dashboard');
  };

  const register = async (data: RegisterInput) => {
    const res = await api.post('/auth/register', data);
    setUser(res.data.data.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
