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
  mapSupabaseRowToUser,
  OFFICIAL_ADMIN_EMAIL,
  OFFICIAL_ADMIN_NAME,
  isOfficialAdmin,
  formatSupabaseAuthError,
  verifyEmailOtp,
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
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (active: boolean) => void;
  recoveryError: string | null;
  clearRecoveryState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  /**
   * Helper: Resolves and loads the full Student Profile from Supabase
   */
  const loadStudentProfile = useCallback(async (authUser: any, accessToken?: string): Promise<User> => {
    if (accessToken) {
      setStoredToken(accessToken);
    }

    const cleanEmail = normalizeEmail(authUser.email || '');
    const isAdminEmail = isOfficialAdmin(cleanEmail);

    // 1. Fetch profile from Supabase 'users' table
    let profile = await fetchSupabaseUserProfile(authUser.id, cleanEmail);

    if (!profile) {
      // Create new profile record in Supabase users table
      profile = await upsertSupabaseUserProfile({
        id: authUser.id,
        email: cleanEmail,
        name: authUser.user_metadata?.name || (isAdminEmail ? OFFICIAL_ADMIN_NAME : cleanEmail.split('@')[0]),
        role: isAdminEmail ? 'admin' : 'student',
        tier: isAdminEmail ? 'premium' : 'free',
        hasBeginnerAccess: isAdminEmail,
        hasAdvancedAccess: isAdminEmail,
      });
    }

    // Enforce official admin privileges ONLY for learnandgrow8433@gmail.com
    if (isAdminEmail && profile) {
      profile.role = 'admin';
      profile.tier = 'premium';
      profile.hasBeginnerAccess = true;
      profile.hasAdvancedAccess = true;
      profile.name = OFFICIAL_ADMIN_NAME;
      if (!profile.avatarUrl) {
        profile.avatarUrl = '/src/assets/images/instructor_lead_avatar_1792164740686.jpg';
      }
    } else if (profile && profile.role === 'admin') {
      // Revoke admin from previous administrator email addresses
      profile.role = 'student';
    }

    const resolvedUser: User = profile || {
      id: authUser.id,
      email: cleanEmail,
      name: authUser.user_metadata?.name || (isAdminEmail ? OFFICIAL_ADMIN_NAME : cleanEmail.split('@')[0]),
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
          const isConfirmed = isOfficialAdmin(session.user.email) ||
            !!session.user.email_confirmed_at ||
            !!session.user.confirmed_at;

          if (!isConfirmed) {
            console.warn('[Supabase Auth] Denying unverified user session on boot:', session.user.email);
            setUser(null);
          } else {
            console.log('[Supabase Auth] Restored verified session for:', session.user.email);
            await loadStudentProfile(session.user, session.access_token);
          }
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

    // 2. Listen to Supabase Auth State Changes (Login, Logout, Token Refresh, Password Recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Supabase Auth Event]: ${event}`);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('[Supabase Auth] PASSWORD_RECOVERY event received');
        if (isMounted) {
          setIsPasswordRecovery(true);
          setRecoveryError(null);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user && isMounted) {
          const isConfirmed = isOfficialAdmin(session.user.email) ||
            !!session.user.email_confirmed_at ||
            !!session.user.confirmed_at;

          if (!isConfirmed) {
            console.warn('[Supabase Auth] Blocked unconfirmed session event:', session.user.email);
            setUser(null);
          } else {
            await loadStudentProfile(session.user, session.access_token);
          }
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

  // 3. Detect recovery tokens, errors, or reset hash in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseRecoveryFromUrl = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      let errDesc: string | null = null;
      let hasRecoveryToken = false;
      let isResetRoute = false;

      // Extract all key-value pairs across hash and search components
      const rawParams = (hash + '&' + search).split(/[#&?]/).filter(Boolean);
      for (const pair of rawParams) {
        if (!pair.includes('=')) continue;
        const [k, ...vParts] = pair.split('=');
        const key = decodeURIComponent(k || '').trim();
        const val = decodeURIComponent(vParts.join('=') || '').trim();

        if (key === 'error_description') {
          errDesc = val.replace(/\+/g, ' ');
        } else if (key === 'error_code' && !errDesc) {
          errDesc = `Auth Error: ${val}`;
        } else if (key === 'error' && !errDesc) {
          errDesc = val.replace(/\+/g, ' ');
        } else if (key === 'type' && val === 'recovery') {
          hasRecoveryToken = true;
        } else if (key === 'mode' && val === 'reset-password') {
          isResetRoute = true;
        }
      }

      if (
        hash.toLowerCase().includes('reset-password') ||
        search.toLowerCase().includes('reset-password') ||
        window.location.pathname.toLowerCase().includes('reset-password')
      ) {
        isResetRoute = true;
      }

      if (errDesc) {
        console.warn('[Supabase Auth] Recovery error in URL:', errDesc);
        setRecoveryError(errDesc);
        setIsPasswordRecovery(true);
      } else if (hasRecoveryToken || isResetRoute) {
        console.log('[Supabase Auth] Recovery URL or reset-password route detected');
        setIsPasswordRecovery(true);
      }
    };

    parseRecoveryFromUrl();
    window.addEventListener('hashchange', parseRecoveryFromUrl);
    window.addEventListener('popstate', parseRecoveryFromUrl);
    return () => {
      window.removeEventListener('hashchange', parseRecoveryFromUrl);
      window.removeEventListener('popstate', parseRecoveryFromUrl);
    };
  }, []);

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

      // Check for unverified email error from Supabase
      if (errMsg.includes('email not confirmed') || errMsg.includes('not confirmed')) {
        return {
          success: false,
          requiresVerification: true,
          message: 'Your email address is not verified yet. Please enter the 6-digit confirmation code from your inbox or click resend below.'
        };
      }

      throw new Error(formatSupabaseAuthError(error));
    }

    if (data.session?.user) {
      const isConfirmed = isOfficialAdmin(data.session.user.email) ||
        !!data.session.user.email_confirmed_at ||
        !!data.session.user.confirmed_at;

      if (!isConfirmed) {
        await supabase.auth.signOut();
        return {
          success: false,
          requiresVerification: true,
          message: 'Your email address is not verified yet. Please enter the 6-digit confirmation code sent to your email.'
        };
      }

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
      throw new Error(formatSupabaseAuthError(error));
    }

    // Check if Supabase silently ignored duplicate registration
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('This email address is already registered! Please sign in to your existing account or click Forgot Password.');
    }

    // Determine admin status strictly for official admin email
    const isAdminEmail = isOfficialAdmin(cleanEmail);
    const role = isAdminEmail ? 'admin' : 'student';
    const tier = isAdminEmail ? 'premium' : 'free';

    // 3. Immediately create permanent student profile in Supabase 'users' table
    if (data.user) {
      await upsertSupabaseUserProfile({
        id: data.user.id,
        email: cleanEmail,
        name: isAdminEmail ? OFFICIAL_ADMIN_NAME : cleanName,
        role,
        tier,
        hasBeginnerAccess: isAdminEmail,
        hasAdvancedAccess: isAdminEmail,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Check if email is verified
    const isConfirmed = isAdminEmail || !!data.user?.email_confirmed_at || !!data.user?.confirmed_at;

    if (isConfirmed && data.session?.user) {
      await loadStudentProfile(data.session.user, data.session.access_token);
      return { success: true, requiresVerification: false, message: 'Account created successfully! Welcome to Learn and Grow.' };
    }

    // 5. Email confirmation is required - never allow unverified access
    return {
      success: true,
      requiresVerification: true,
      message: 'Account created! Please check your email inbox and enter the 6-digit confirmation code below to activate your account.'
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
   * Verify 6-digit OTP confirmation code
   */
  const verifyOtp = async (email: string, token: string): Promise<{ success: boolean; message: string }> => {
    const res = await verifyEmailOtp(email, token);
    if (res.success && res.session?.user) {
      await loadStudentProfile(res.session.user, res.session.access_token);
    }
    return { success: res.success, message: res.message };
  };

  /**
   * Forgot Password Link
   */
  const forgotPassword = async (email: string) => {
    return requestPasswordReset(email);
  };

  /**
   * Update User Password using Supabase Auth recovery session
   * Verifies that the recovery session is established before updating
   */
  const updatePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
      // Requirement 8: Verify that the recovery session is established before allowing password updates
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        return {
          success: false,
          message: `Authentication session error: ${sessionError.message}. Please request a new recovery link.`,
        };
      }

      if (!session?.user) {
        return {
          success: false,
          message: 'No active password recovery session found. Your recovery link may have expired or was already used. Please request a new recovery link.',
        };
      }

      // Requirement 5: Use Supabase updateUser({ password: newPassword })
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      // Synchronize with local database storage
      if (data?.user?.id) {
        try {
          await api.syncPassword(newPassword);
        } catch {
          // Non-blocking
        }
      }

      setIsPasswordRecovery(false);
      setRecoveryError(null);

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return {
        success: true,
        message: 'Password updated successfully! You can now log in with your new password.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to update password. Recovery session may have expired.',
      };
    }
  };

  /**
   * Clear Password Recovery state and clean up URL
   */
  const clearRecoveryState = () => {
    setIsPasswordRecovery(false);
    setRecoveryError(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  /**
   * Switch Account Role (Requires authenticating with verified account credentials)
   */
  const switchDemoAccount = async (role: 'admin' | 'student') => {
    console.info(`[Auth] User requested ${role} role view. Please log in with your verified ${role} account.`);
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

  const isAdmin = isOfficialAdmin(user?.email);
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
        verifyOtp,
        forgotPassword,
        updatePassword,
        isPasswordRecovery,
        setIsPasswordRecovery,
        recoveryError,
        clearRecoveryState,
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
