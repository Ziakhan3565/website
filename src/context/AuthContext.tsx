import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types/index.ts';
import { api, getStoredToken, setStoredToken } from '../services/api.ts';
import {
  supabase,
  normalizeEmail,
  fetchSupabaseUserProfile,
  upsertSupabaseUserProfile,
  checkSupabaseEmailExists,
  resendVerificationEmail,
  requestPasswordReset,
  mapSupabaseRowToUser
} from '../lib/supabase.ts';

export interface AuthContextType {
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
  }) => Promise<{ success: boolean; message: string; status: string; user?: User }>;
  login: (email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchDemoAccount: (role: 'admin' | 'student') => Promise<void>;
  toggleLessonProgress: (lessonId: string) => Promise<void>;
  toggleSavedSignal: (signalId: string) => Promise<void>;
  upgradeTier: (tier: 'free' | 'premium') => Promise<void>;
  updateProfile: (params: { name?: string; avatarUrl?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Helper: Resolves and loads the full Student Profile from Supabase
   */
  const loadStudentProfile = useCallback(async (authUser: any, accessToken?: string): Promise<User> => {
    if (accessToken) {
      setStoredToken(accessToken);
    }

    const cleanEmail = normalizeEmail(authUser.email || '');
    const isAdminEmail = cleanEmail === 'admin@gmail.com' || cleanEmail === 'ziakhan5348@gmail.com';

    // 1. Fetch profile from Supabase 'users' table
    let profile = await fetchSupabaseUserProfile(authUser.id, cleanEmail);

    if (!profile) {
      // Create new profile record in Supabase users table
      profile = await upsertSupabaseUserProfile({
        id: authUser.id,
        email: cleanEmail,
        name: authUser.user_metadata?.name || cleanEmail.split('@')[0],
        role: isAdminEmail ? 'admin' : 'student',
        tier: isAdminEmail ? 'premium' : 'free',
        hasBeginnerAccess: isAdminEmail,
        hasAdvancedAccess: isAdminEmail,
      });
    }

    // Always enforce admin privileges for admin accounts
    if (isAdminEmail && profile) {
      profile.role = 'admin';
      profile.tier = 'premium';
      profile.hasBeginnerAccess = true;
      profile.hasAdvancedAccess = true;
      if (!profile.avatarUrl) {
        profile.avatarUrl = '/src/assets/images/instructor_lead_avatar_1792164740686.jpg';
      }
    }

    const resolvedUser: User = profile || {
      id: authUser.id,
      email: cleanEmail,
      name: authUser.user_metadata?.name || cleanEmail.split('@')[0],
      role: isAdminEmail ? 'admin' : 'student',
      tier: isAdminEmail ? 'premium' : 'free',
      hasBeginnerAccess: isAdminEmail,
      hasAdvancedAccess: isAdminEmail,
      createdAt: new Date().toISOString(),
      completedLessons: [],
      savedSignals: [],
      attendedClasses: [],
    };

    setUser(resolvedUser);
    return resolvedUser;
  }, []);

  /**
   * Persistent Session Restoration on App Boot
   * Single client instance, restores session from localStorage, subscribes to auth state changes
   */
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        // 1. Check Supabase Auth active session (single source of truth)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          console.log('[Supabase Auth] Restored existing session for:', session.user.email);
          await loadStudentProfile(session.user, session.access_token);
        } else {
          // Check if there was an active token or backend session
          const storedToken = getStoredToken();
          if (storedToken && isMounted) {
            try {
              const res = await api.getMe();
              if (res?.user && isMounted) {
                // Ensure profile is in Supabase users table
                upsertSupabaseUserProfile({
                  id: res.user.id,
                  email: res.user.email,
                  name: res.user.name,
                  role: res.user.role,
                  tier: res.user.tier,
                  hasBeginnerAccess: res.user.hasBeginnerAccess,
                  hasAdvancedAccess: res.user.hasAdvancedAccess,
                }).catch(() => {});
                setUser(res.user);
              }
            } catch {
              // Only clear if the token was definitively invalid
              setStoredToken(null);
              if (isMounted) setUser(null);
            }
          } else if (isMounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('[Supabase Auth Restoration Failed]:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    // 2. Listen to Supabase Auth State Changes (Login, Logout, Token Refresh, Session Restored)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Supabase Auth Event]: ${event}`);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user && isMounted) {
          await loadStudentProfile(session.user, session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setStoredToken(null);
          setUser(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadStudentProfile]);

  /**
   * User Login with Email & Password
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; requiresVerification?: boolean; message?: string }> => {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !password) {
      throw new Error('Please enter both your email and password.');
    }

    // 1. Attempt login with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      const errMsg = error.message.toLowerCase();

      // Check for unverified email
      if (errMsg.includes('email not confirmed') || errMsg.includes('not confirmed')) {
        return {
          success: false,
          requiresVerification: true,
          message: 'Your email address is not verified yet. Please check your inbox for the confirmation email or click below to resend it.'
        };
      }

      // Check if credentials failed in Supabase Auth:
      // Fallback check against backend API for legacy pre-seeded accounts (e.g. admin@gmail.com with ZIA@#1234@#1)
      try {
        const backendRes = await api.login(cleanEmail, password);
        if (backendRes?.user) {
          // Successfully authenticated with backend!
          setUser(backendRes.user);

          // Asynchronously ensure profile exists in Supabase users table
          await upsertSupabaseUserProfile({
            id: backendRes.user.id,
            email: backendRes.user.email,
            name: backendRes.user.name,
            role: backendRes.user.role,
            tier: backendRes.user.tier,
            hasBeginnerAccess: backendRes.user.hasBeginnerAccess,
            hasAdvancedAccess: backendRes.user.hasAdvancedAccess,
          });

          return { success: true, message: 'Welcome back!' };
        }
      } catch {
        // Fallback also failed, raise clean user-facing error
      }

      if (errMsg.includes('invalid login credentials') || errMsg.includes('invalid credentials')) {
        throw new Error('Incorrect password or email. Please verify your credentials or click "Forgot Password".');
      }

      throw new Error(error.message);
    }

    if (data.session?.user) {
      await loadStudentProfile(data.session.user, data.session.access_token);
      return { success: true, message: 'Welcome back!' };
    }

    return { success: true };
  };

  /**
   * User Signup with Email & Password
   */
  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; requiresVerification?: boolean; message?: string }> => {
    const cleanEmail = normalizeEmail(email);
    const cleanName = (name || '').trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !password) {
      throw new Error('Please provide all required fields.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // 1. Verify if email is already registered in Supabase users table
    const emailCheck = await checkSupabaseEmailExists(cleanEmail);
    if (emailCheck.exists) {
      throw new Error('This email address is already registered! Please sign in to your existing account.');
    }

    // 2. Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
        },
      },
    });

    if (error) {
      const errMsg = error.message.toLowerCase();
      if (errMsg.includes('already registered') || error.code === 'user_already_exists') {
        throw new Error('This email address is already registered! Please sign in to your existing account.');
      }
      if (errMsg.includes('rate limit')) {
        throw new Error('Supabase email rate limit reached. If this account was already registered, please sign in.');
      }
      throw new Error(error.message);
    }

    // Determine admin status
    const isAdminEmail = cleanEmail === 'admin@gmail.com' || cleanEmail === 'ziakhan5348@gmail.com';
    const role = isAdminEmail ? 'admin' : 'student';
    const tier = isAdminEmail ? 'premium' : 'free';

    // 3. Immediately create permanent student profile in Supabase 'users' table
    if (data.user) {
      await upsertSupabaseUserProfile({
        id: data.user.id,
        email: cleanEmail,
        name: cleanName,
        role,
        tier,
        hasBeginnerAccess: isAdminEmail,
        hasAdvancedAccess: isAdminEmail,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Check if session was returned immediately (Email auto-confirm enabled)
    if (data.session?.user) {
      await loadStudentProfile(data.session.user, data.session.access_token);
      return { success: true, requiresVerification: false, message: 'Account created successfully! Welcome to Learn and Grow.' };
    }

    // 5. If email confirmation is required by Supabase settings:
    return {
      success: true,
      requiresVerification: true,
      message: 'Account created! A confirmation email has been sent to your address. Please verify your email to log in.'
    };
  };

  /**
   * User Logout
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Continue even if network error
    } finally {
      setStoredToken(null);
      setUser(null);
      try {
        await api.logout();
      } catch {
        // silent
      }
    }
  };

  /**
   * Resend Verification Email
   */
  const resendVerification = async (email: string) => {
    return resendVerificationEmail(email);
  };

  /**
   * Forgot Password Link
   */
  const forgotPassword = async (email: string) => {
    return requestPasswordReset(email);
  };

  /**
   * Switch Demo Account (for testing & demonstration)
   */
  const switchDemoAccount = async (role: 'admin' | 'student') => {
    if (role === 'admin') {
      await login('admin@gmail.com', 'ZIA@#1234@#1');
    } else {
      await login('student@coursecrash.io', 'studentPass123!');
    }
  };

  /**
   * Toggle Lesson Progress (Synced with Supabase & local state)
   */
  const toggleLessonProgress = async (lessonId: string) => {
    if (!user) return;
    const isCompleted = user.completedLessons.includes(lessonId);
    const updatedLessons = isCompleted
      ? user.completedLessons.filter(id => id !== lessonId)
      : [...user.completedLessons, lessonId];

    setUser(prev => prev ? { ...prev, completedLessons: updatedLessons } : null);

    try {
      await api.toggleLessonProgress(lessonId, !isCompleted);
    } catch (e) {
      console.warn('Failed to sync progress with backend', e);
    }
  };

  /**
   * Toggle Saved Trading Signal
   */
  const toggleSavedSignal = async (signalId: string) => {
    if (!user) return;
    const isSaved = user.savedSignals.includes(signalId);
    const updatedSignals = isSaved
      ? user.savedSignals.filter(id => id !== signalId)
      : [...user.savedSignals, signalId];

    setUser(prev => prev ? { ...prev, savedSignals: updatedSignals } : null);

    try {
      await api.toggleSavedSignal(signalId);
    } catch (e) {
      console.warn('Failed to bookmark signal', e);
    }
  };

  /**
   * Upgrade Membership Tier
   */
  const upgradeTier = async (tier: 'free' | 'premium') => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, tier } : null);

    // Save directly to Supabase users table
    await upsertSupabaseUserProfile({
      id: user.id,
      email: user.email,
      tier,
    });

    try {
      await api.updateTier(tier);
    } catch {
      // silent
    }
  };

  /**
   * Refresh Current User Profile from Supabase
   */
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadStudentProfile(session.user, session.access_token);
        return;
      }
      if (user) {
        const fresh = await fetchSupabaseUserProfile(user.id, user.email);
        if (fresh) {
          setUser(fresh);
        }
      }
    } catch {
      // ignored
    }
  };

  /**
   * Checkout Course (Instant or manual checkout with permanent Supabase access)
   */
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

      // Immediately grant course access in Supabase users table for permanent storage
      if (user) {
        const updates: Partial<User> & { id: string; email: string } = {
          id: user.id,
          email: user.email,
        };

        if (payload.courseType === 'beginner') {
          updates.hasBeginnerAccess = true;
        } else if (payload.courseType === 'advanced') {
          updates.hasAdvancedAccess = true;
          updates.tier = 'premium';
        }

        const updatedProfile = await upsertSupabaseUserProfile(updates);
        if (updatedProfile) {
          setUser(updatedProfile);
        }
      }

      if (res.user) {
        setUser(res.user);
      }
      return { success: true, message: res.message, status: res.status, user: res.user };
    } catch (e: any) {
      throw new Error(e.message || 'Payment processing failed');
    }
  };

  /**
   * Update Profile Details (Name & Avatar)
   */
  const updateProfile = async (params: { name?: string; avatarUrl?: string }) => {
    if (!user) throw new Error('You must be logged in to update your profile.');

    // Save directly to Supabase users table
    const updated = await upsertSupabaseUserProfile({
      id: user.id,
      email: user.email,
      name: params.name || user.name,
      avatarUrl: params.avatarUrl !== undefined ? params.avatarUrl : user.avatarUrl,
    });

    if (updated) {
      setUser(updated);
    }

    try {
      await api.updateProfile(params);
    } catch {
      // non-fatal
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'ziakhan5348@gmail.com' || user?.email?.toLowerCase() === 'admin@gmail.com';
  const isPremium = user?.tier === 'premium' || isAdmin;
  const hasBeginnerAccess = isAdmin || isPremium || !!user?.hasBeginnerAccess;
  const hasAdvancedAccess = isAdmin || isPremium || !!user?.hasAdvancedAccess;

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
        resendVerification,
        forgotPassword,
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
