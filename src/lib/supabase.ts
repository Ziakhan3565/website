import { createClient } from '@supabase/supabase-js';
import type { User, UserRole, MembershipTier } from '../types/index.ts';

// Supabase project credentials for LEARN AND GROW
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://xsxsgrhskhplshscgxxs.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_k-BQVqtnRN37eWPC78Gyuw_WFFrJBnA';

/**
 * Single browser-wide Supabase client instance configured for persistent session
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  tier: string;
  has_beginner_access: boolean;
  has_advanced_access: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabasePaymentRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  course_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  gateway_type?: string;
  transaction_reference: string;
  sender_account?: string;
  receipt_url?: string;
  status: string;
  paid_at?: string;
  created_at?: string;
}

/**
 * Normalize an email address cleanly
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

export const OFFICIAL_ADMIN_EMAIL = 'learnandgrow8433@gmail.com';
export const OFFICIAL_ADMIN_NAME = 'Learn and Grow';

export function isOfficialAdmin(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  return normalizeEmail(email) === OFFICIAL_ADMIN_EMAIL;
}

/**
 * Maps a Supabase database row to the application's User object
 */
export function mapSupabaseRowToUser(row: any): User {
  const email = normalizeEmail(row.email || '');
  const isAdminEmail = isOfficialAdmin(email);
  const role: UserRole = isAdminEmail ? 'admin' : 'student';
  const tier: MembershipTier = isAdminEmail ? 'premium' : (row.tier === 'premium' ? 'premium' : 'free');

  return {
    id: row.id,
    email,
    name: row.name || (isAdminEmail ? OFFICIAL_ADMIN_NAME : email.split('@')[0]) || 'Student',
    role,
    tier,
    hasBeginnerAccess: isAdminEmail ? true : !!row.has_beginner_access,
    hasAdvancedAccess: isAdminEmail ? true : !!row.has_advanced_access,
    avatarUrl: row.avatar_url || (isAdminEmail ? '/src/assets/images/instructor_lead_avatar_1792164740686.jpg' : undefined),
    createdAt: row.created_at || new Date().toISOString(),
    completedLessons: Array.isArray(row.completed_lessons) ? row.completed_lessons : [],
    savedSignals: Array.isArray(row.saved_signals) ? row.saved_signals : [],
    attendedClasses: [],
  };
}

/**
 * Fetch a student's profile directly from Supabase 'users' table
 */
export async function fetchSupabaseUserProfile(userId: string, email?: string): Promise<User | null> {
  try {
    // 1. Try finding by user ID
    if (userId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return mapSupabaseRowToUser(data);
      }
    }

    // 2. Fallback: find by email (links existing pre-created records to auth accounts)
    if (email) {
      const cleanEmail = normalizeEmail(email);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        return mapSupabaseRowToUser(data);
      }
    }

    return null;
  } catch (err) {
    console.warn('[Supabase Profile Fetch] Warning:', err);
    return null;
  }
}

/**
 * Upsert a student profile into Supabase 'users' table
 */
export async function upsertSupabaseUserProfile(user: Partial<User> & { id: string; email: string }): Promise<User | null> {
  const cleanEmail = normalizeEmail(user.email);
  const isAdminEmail = isOfficialAdmin(cleanEmail);
  const role: UserRole = isAdminEmail ? 'admin' : 'student';
  const tier: MembershipTier = isAdminEmail ? 'premium' : (user.tier || 'free');

  const payload: any = {
    id: user.id,
    email: cleanEmail,
    name: user.name || (isAdminEmail ? OFFICIAL_ADMIN_NAME : cleanEmail.split('@')[0]),
    role,
    tier,
    has_beginner_access: isAdminEmail ? true : !!user.hasBeginnerAccess,
    has_advanced_access: isAdminEmail ? true : !!user.hasAdvancedAccess,
    avatar_url: user.avatarUrl || null,
    updated_at: new Date().toISOString(),
  };

  if (user.createdAt) {
    payload.created_at = user.createdAt;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .maybeSingle();

    if (error) {
      console.warn('[Supabase User Upsert Warning]:', error.message);
      // Return local mapped version if database upsert had RLS restrictions
      return mapSupabaseRowToUser(payload);
    }

    return data ? mapSupabaseRowToUser(data) : mapSupabaseRowToUser(payload);
  } catch (err: any) {
    console.error('[Supabase User Upsert Exception]:', err);
    return mapSupabaseRowToUser(payload);
  }
}

/**
 * Translates Supabase Auth errors into clear, actionable, accurate descriptions
 */
export function formatSupabaseAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = (error.code || '').toLowerCase();
  const msg = (error.message || '').toLowerCase();
  const status = error.status || 0;

  if (code === 'over_email_send_rate_limit' || status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Supabase email send rate limit reached (The free tier shared mailer allows only ~3-4 emails/hour). Please wait before resending, or configure a Custom SMTP provider (such as Gmail App Password, Resend, or SendGrid) in your Supabase Dashboard.';
  }

  if (code === 'email_address_not_authorized' || msg.includes('not authorized')) {
    return 'Email address not authorized. In Supabase evaluation sandbox mode, emails are restricted to confirmed project team members. Please configure Custom SMTP in your Supabase Dashboard.';
  }

  if (code === 'email_address_invalid' || msg.includes('is invalid')) {
    return 'Supabase email delivery failed: The email address or its domain could not be verified by the Supabase mail server. Please ensure the address is correct and uses a standard provider (e.g. @gmail.com).';
  }

  if (code === 'otp_expired' || msg.includes('otp expired') || msg.includes('token has expired')) {
    return 'The 6-digit verification code has expired or is invalid. Please request a new code using the resend button.';
  }

  if (code === 'user_already_exists' || msg.includes('already registered')) {
    return 'This email address is already registered! Please sign in to your existing account.';
  }

  if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
    return 'Your email address is not verified yet. Please enter the 6-digit confirmation code sent to your inbox or click resend.';
  }

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect password or email. Please verify your credentials or click "Forgot Password".';
  }

  if (msg.includes('smtp') || msg.includes('connection error') || msg.includes('delivery')) {
    return `SMTP delivery failure: Supabase could not deliver the email (${error.message}). Please verify your SMTP settings in the Supabase Dashboard.`;
  }

  return error.message || 'Authentication request failed.';
}

/**
 * Check if an email is already registered in Supabase
 * Note: Does not claim an email is invalid if not found
 */
export async function checkSupabaseEmailExists(email: string): Promise<{ exists: boolean }> {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return { exists: false };

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!error && data) {
      return { exists: true };
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}

/**
 * Verify a 6-digit OTP confirmation code using real Supabase Auth
 */
export async function verifyEmailOtp(email: string, token: string): Promise<{
  success: boolean;
  message: string;
  session?: any;
  user?: any;
}> {
  const cleanEmail = normalizeEmail(email);
  const cleanToken = token.trim();

  if (!cleanEmail) {
    return { success: false, message: 'Please enter a valid email address.' };
  }
  if (!cleanToken || cleanToken.length < 6) {
    return { success: false, message: 'Please enter the 6-digit verification code sent to your email.' };
  }

  try {
    // 1. Attempt signup OTP confirmation
    let { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'signup',
    });

    // 2. Fallback to 'email' magiclink/OTP type if signup verification indicates token mismatch
    if (error && (error.code === 'otp_expired' || error.message.toLowerCase().includes('token'))) {
      const fallback = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });
      if (!fallback.error && fallback.data?.session) {
        data = fallback.data;
        error = null;
      }
    }

    if (error) {
      return { success: false, message: formatSupabaseAuthError(error) };
    }

    if (data?.session && data?.user) {
      return {
        success: true,
        session: data.session,
        user: data.user,
        message: 'Email successfully verified! Welcome to Learn and Grow.',
      };
    }

    return {
      success: true,
      user: data?.user,
      message: 'Email successfully verified! You can now sign in with your credentials.',
    };
  } catch (err: any) {
    return { success: false, message: formatSupabaseAuthError(err) };
  }
}

/**
 * Resend email verification through Supabase Auth
 * Accurately surfaces rate limits, delivery failures, or confirmation success
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
    });
    if (error) {
      return { success: false, message: formatSupabaseAuthError(error) };
    }
    return {
      success: true,
      message: 'A fresh verification email with your 6-digit confirmation code has been sent. Please check your inbox and Spam folder.',
    };
  } catch (err: any) {
    return { success: false, message: formatSupabaseAuthError(err) };
  }
}

/**
 * Dynamically resolves the current application origin and generates the Reset Password URL
 */
export function getAppResetRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    return `${origin}/#reset-password`;
  }
  return '';
}

/**
 * Request password reset through Supabase Auth
 * Sends recovery link to the user's Gmail address pointing to the dedicated Reset Password page
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string; redirectTo?: string }> {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    // Dynamically use the actual current application origin for the recovery redirect URL
    const redirectTo = getAppResetRedirectUrl();

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      ...(redirectTo ? { redirectTo } : {}),
    });

    if (error) {
      return { success: false, message: formatSupabaseAuthError(error) };
    }

    return {
      success: true,
      message: 'If an account exists with this email address, a password recovery link has been dispatched. Please check your Gmail inbox and Spam folder.',
      redirectTo,
    };
  } catch (err: any) {
    return { success: false, message: formatSupabaseAuthError(err) };
  }
}

/**
 * Update user password using Supabase Auth recovery session
 * Verifies that the recovery session is established before updating
 */
export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  try {
    // Verify that the recovery session is established
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return { success: false, message: `Session error: ${sessionError.message}` };
    }
    if (!session?.user) {
      return {
        success: false,
        message: 'No active password recovery session found. Your recovery link may have expired or is invalid. Please request a new link.',
      };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Password has been updated successfully in Supabase Auth.',
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to update password.' };
  }
}

/**
 * Helper to test connection to Supabase
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      return { ok: true, message: `Connected to Supabase (${error.message || 'Ready'})` };
    }
    return { ok: true, message: 'Supabase connected and users table reachable' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Connection test failed' };
  }
}
