import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { AdminUser } from '../types.ts';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginWithCredentials: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_token');
      if (saved && saved !== 'undefined' && saved !== 'null' && saved.trim() !== '') {
        return saved.trim();
      }
      localStorage.removeItem('admin_token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    async function checkAuth() {
      if (!token || token === 'undefined' || token === 'null') {
        if (typeof window !== 'undefined') localStorage.removeItem('admin_token');
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            email: data.user.email,
            role: data.user.role || 'admin',
            name: data.user.name || 'Admin',
          });
        } else {
          // Token invalid or expired
          localStorage.removeItem('admin_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session verify failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [token]);

  const loginWithCredentials = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Kirishda xatolik yuz berdi' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Serverga ulanishda xatolik' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (!result?.user) {
        return { success: false, error: 'Google orqali foydalanuvchi maʼlumoti olinmadi' };
      }
      const idToken = await result.user.getIdToken();
      if (!idToken || typeof idToken !== 'string') {
        return { success: false, error: 'Google ID tokeni topilmadi' };
      }

      const res = await fetch('/api/auth/firebase-verify', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Google orqali kirish tasdiqlanmadi' };
    } catch (err: any) {
      console.error('Google login error:', err);
      return { success: false, error: err.message || 'Google pop-up oynasi yopildi yoki xato yuz berdi' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin: !!user,
        loginWithCredentials,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
