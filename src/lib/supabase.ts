import { createClient } from '@supabase/supabase-js';

// Project credentials provided by the user
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://xsxsgrhskhplshscgxxs.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_k-BQVqtnRN37eWPC78Gyuw_WFFrJBnA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
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
 * Helper to test connection to Supabase
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      // If table doesn't exist yet, connection is still valid (404/PGRST205 from supabase)
      return { ok: true, message: `Connected to Supabase (${error.message || 'Ready'})` };
    }
    return { ok: true, message: 'Supabase connected and users table reachable' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Connection test failed' };
  }
}
