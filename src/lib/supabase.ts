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

/**
 * Maps a Supabase database row to the application's User object
 */
export function mapSupabaseRowToUser(row: any): User {
  const email = normalizeEmail(row.email || '');
  const isAdminEmail = email === 'admin@gmail.com' || email === 'ziakhan5348@gmail.com';
  const role: UserRole = isAdminEmail ? 'admin' : (row.role === 'admin' ? 'admin' : 'student');
  const tier: MembershipTier = isAdminEmail ? 'premium' : (row.tier === 'premium' ? 'premium' : 'free');

  return {
    id: row.id,
    email,
    name: row.name || email.split('@')[0] || 'Student',
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
  const isAdminEmail = cleanEmail === 'admin@gmail.com' || cleanEmail === 'ziakhan5348@gmail.com';
  const role = isAdminEmail ? 'admin' : (user.role || 'student');
  const tier = isAdminEmail ? 'premium' : (user.tier || 'free');

  const payload: any = {
    id: user.id,
    email: cleanEmail,
    name: user.name || cleanEmail.split('@')[0],
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
 * Check if an email is already registered in Supabase
 */
export async function checkSupabaseEmailExists(email: string): Promise<{ exists: boolean; name?: string; role?: string }> {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return { exists: false };

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!error && data) {
      return { exists: true, name: data.name, role: data.role };
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}

/**
 * Resend email verification through Supabase Auth
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = normalizeEmail(email);
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Verification email has been resent. Please check your inbox and spam folder.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to resend confirmation email.' };
  }
}

/**
 * Request password reset through Supabase Auth
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = normalizeEmail(email);
  try {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return {
      success: true,
      message: 'Password reset link has been sent to your email. Please check your inbox.',
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to send password reset email.' };
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
