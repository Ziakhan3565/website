import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index.ts';
import { api, getStoredToken, setStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  hasBeginnerAccess: boolean;
  hasAdvancedAccess: boolean;
  checkoutCourse: (params: {
    courseType: 'beginner' | 'advanced';
    paymentMethod: string;
    transactionReference?: string;
    senderAccount?: string;
    receiptUrl?: string;
    instantApprove?: boolean;
  }) => Promise<{ success: boolean; message: string; status: string }>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoAccount: (role: 'admin' | 'student') => Promise<void>;
  toggleLessonProgress: (lessonId: string) => Promise<void>;
  toggleSavedSignal: (signalId: string) => Promise<void>;
  upgradeTier: (tier: 'free' | 'premium') => Promise<void>;
  updateProfile: (params: { name?: string; avatarUrl?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        return;
      }
      const res = await api.getMe();
      setUser(res.user);
    } catch (e) {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register({ name, email, password });
    setUser(data.user);
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  const switchDemoAccount = async (role: 'admin' | 'student') => {
    if (role === 'admin') {
      await login('admin@gmail.com', 'ZIA@#1234@#1');
    } else {
      await login('student@coursecrash.io', 'studentPass123!');
    }
  };

  const toggleLessonProgress = async (lessonId: string) => {
    if (!user) return;
    const isCompleted = user.completedLessons.includes(lessonId);
    try {
      const res = await api.toggleLessonProgress(lessonId, !isCompleted);
      setUser(res.user);
    } catch (e) {
      console.error('Failed to update progress', e);
    }
  };

  const toggleSavedSignal = async (signalId: string) => {
    if (!user) return;
    try {
      const res = await api.toggleSavedSignal(signalId);
      setUser(res.user);
    } catch (e) {
      console.error('Failed to bookmark signal', e);
    }
  };

  const upgradeTier = async (tier: 'free' | 'premium') => {
    if (!user) return;
    try {
      const res = await api.updateTier(tier);
      setUser(res.user);
    } catch (e) {
      console.error('Failed to update tier', e);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (e) {
      // ignored
    }
  };

  const checkoutCourse = async (
    arg1: 'beginner' | 'advanced' | {
      courseType: 'beginner' | 'advanced';
      paymentMethod: string;
      transactionReference?: string;
      senderAccount?: string;
      receiptUrl?: string;
      instantApprove?: boolean;
    },
    arg2?: string
  ) => {
    const payload = typeof arg1 === 'object' ? arg1 : {
      courseType: arg1,
      paymentMethod: arg2 || 'instant',
      instantApprove: arg2 === 'instant'
    };
    try {
      const res = await api.checkoutCourse(payload);
      if (res.user) {
        setUser(res.user);
      }
      return { success: true, message: res.message, status: res.status, user: res.user };
    } catch (e: any) {
      throw new Error(e.message || 'Payment processing failed');
    }
  };

  const isAdmin = user?.role === 'admin';
  const isPremium = user?.tier === 'premium' || isAdmin;
  const hasBeginnerAccess = isAdmin || isPremium || !!user?.hasBeginnerAccess;
  const hasAdvancedAccess = isAdmin || isPremium || !!user?.hasAdvancedAccess;

  const updateProfile = async (params: { name?: string; avatarUrl?: string }) => {
    try {
      const res = await api.updateProfile(params);
      if (res.user) {
        setUser(res.user);
      }
    } catch (e: any) {
      throw new Error(e.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isPremium,
        hasBeginnerAccess,
        hasAdvancedAccess,
        checkoutCourse,
        login,
        register,
        logout,
        switchDemoAccount,
        toggleLessonProgress,
        toggleSavedSignal,
        upgradeTier,
        updateProfile,
        refreshUser,
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
