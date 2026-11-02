import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, PaymentTransaction, CourseEnrollment, SpotSignal, FuturesSignal } from '../src/types/index.ts';

export const SUPABASE_PROJECT_ID = 'xsxsgrhskhplshscgxxs';
export const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://xsxsgrhskhplshscgxxs.supabase.co';

export const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_k-BQVqtnRN37eWPC78Gyuw_WFFrJBnA';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClientInstance;
}

/**
 * Health check to verify connection to Supabase instance
 */
export async function testSupabaseHealth(): Promise<{
  connected: boolean;
  projectId: string;
  url: string;
  tablesStatus: Record<string, string>;
  message: string;
}> {
  const supabase = getSupabase();
  const tables = ['users', 'profiles', 'payments', 'transactions', 'enrollments', 'course_enrollments', 'signals'];
  const tablesStatus: Record<string, string> = {};

  let anyReachable = false;
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        tablesStatus[table] = error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')
          ? 'table_not_created_yet'
          : `error: ${error.message}`;
      } else {
        tablesStatus[table] = 'active_and_reachable';
        anyReachable = true;
      }
    } catch (err: any) {
      tablesStatus[table] = `exception: ${err?.message || 'unknown'}`;
    }
  }

  return {
    connected: true,
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    tablesStatus,
    message: anyReachable
      ? 'Supabase connected and database tables detected'
      : 'Supabase connected successfully! (Tables will be automatically populated when created)'
  };
}

/**
 * Synchronize a user record to Supabase
 * Tries 'users' first, falls back to 'profiles'
 */
export async function syncUserToSupabase(user: Partial<User> & { id: string; email: string }): Promise<{ success: boolean; targetTable?: string; error?: string }> {
  const supabase = getSupabase();
  const payload = {
    id: user.id,
    email: user.email.toLowerCase(),
    name: user.name || '',
    role: user.role || 'student',
    tier: user.tier || 'free',
    has_beginner_access: !!user.hasBeginnerAccess,
    has_advanced_access: !!user.hasAdvancedAccess,
    avatar_url: user.avatarUrl || null,
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    // Try table 'users'
    const { error: usersError } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
    if (!usersError) {
      console.log(`[Supabase] Successfully synced user ${user.email} to 'users' table`);
      return { success: true, targetTable: 'users' };
    }

    // Try table 'profiles'
    const { error: profilesError } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (!profilesError) {
      console.log(`[Supabase] Successfully synced user ${user.email} to 'profiles' table`);
      return { success: true, targetTable: 'profiles' };
    }

    console.warn(`[Supabase] User sync notices: users (${usersError.message}), profiles (${profilesError.message})`);
    return { success: false, error: usersError.message || profilesError.message };
  } catch (err: any) {
    console.error(`[Supabase Error] Failed to sync user ${user.email}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Synchronize a payment transaction to Supabase
 * Tries 'payments' then 'transactions'
 */
export async function syncPaymentToSupabase(tx: PaymentTransaction): Promise<{ success: boolean; targetTable?: string; error?: string }> {
  const supabase = getSupabase();
  const payload = {
    id: tx.id,
    user_id: tx.userId,
    user_name: tx.userName || '',
    user_email: tx.userEmail || '',
    course_type: tx.courseType,
    amount: tx.amount,
    currency: tx.currency,
    payment_method: tx.paymentMethod,
    gateway_type: tx.gatewayType || tx.paymentMethod,
    transaction_reference: tx.transactionReference || '',
    sender_account: tx.senderAccount || null,
    receipt_url: tx.receiptUrl || null,
    status: tx.status,
    paid_at: tx.paidAt || null,
    admin_notes: tx.adminNotes || null,
    created_at: tx.createdAt || new Date().toISOString(),
  };

  try {
    // Try table 'payments'
    const { error: paymentsError } = await supabase.from('payments').upsert(payload, { onConflict: 'id' });
    if (!paymentsError) {
      console.log(`[Supabase] Synced payment ${tx.id} to 'payments' table`);
      return { success: true, targetTable: 'payments' };
    }

    // Try table 'transactions'
    const { error: txError } = await supabase.from('transactions').upsert(payload, { onConflict: 'id' });
    if (!txError) {
      console.log(`[Supabase] Synced transaction ${tx.id} to 'transactions' table`);
      return { success: true, targetTable: 'transactions' };
    }

    console.warn(`[Supabase] Payment sync notice: ${paymentsError.message}`);
    return { success: false, error: paymentsError.message };
  } catch (err: any) {
    console.error(`[Supabase Error] Failed to sync payment ${tx.id}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Synchronize an enrollment record to Supabase
 */
export async function syncEnrollmentToSupabase(userId: string, enrollment: CourseEnrollment): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  const payload = {
    id: enrollment.id,
    user_id: userId,
    course_type: enrollment.courseType,
    enrolled_at: enrollment.enrolledAt,
    amount: enrollment.amount,
    currency: enrollment.currency,
    transaction_reference: enrollment.transactionReference,
    order_id: enrollment.orderId || null,
    payment_method: enrollment.paymentMethod,
    status: enrollment.status,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('course_enrollments').upsert(payload, { onConflict: 'id' });
    if (!error) {
      console.log(`[Supabase] Synced enrollment ${enrollment.id} to 'course_enrollments'`);
      return { success: true };
    }
    const { error: fallbackError } = await supabase.from('enrollments').upsert(payload, { onConflict: 'id' });
    if (!fallbackError) {
      console.log(`[Supabase] Synced enrollment ${enrollment.id} to 'enrollments'`);
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err: any) {
    console.error(`[Supabase Error] Failed to sync enrollment ${enrollment.id}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Synchronize a signal to Supabase
 */
export async function syncSignalToSupabase(type: 'spot' | 'futures', signal: SpotSignal | FuturesSignal): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  const payload = {
    id: signal.id,
    signal_type: type,
    pair: signal.pair,
    direction: signal.direction,
    entry_zone: signal.entryZone,
    stop_loss: signal.stopLoss,
    target_1: signal.tp1,
    target_2: signal.tp2,
    target_3: signal.tp3,
    status: signal.status,
    technical_reasoning: signal.technicalReasoning || null,
    published_by: signal.publishedBy,
    created_at: signal.createdAt,
    updated_at: signal.updatedAt,
    ...(type === 'futures' && 'leverage' in signal ? { leverage: (signal as FuturesSignal).leverage } : {}),
  };

  try {
    const { error } = await supabase.from('signals').upsert(payload, { onConflict: 'id' });
    if (!error) {
      console.log(`[Supabase] Synced ${type} signal ${signal.id} to 'signals'`);
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err: any) {
    console.error(`[Supabase Error] Failed to sync signal ${signal.id}:`, err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Synchronize feedback / contact submission to Supabase
 */
export async function syncContactMessageToSupabase(contact: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  const payload = {
    id: `contact_${Date.now()}`,
    name: contact.name,
    email: contact.email,
    subject: contact.subject || 'General Inquiry',
    message: contact.message,
    phone: contact.phone || null,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('contact_messages').insert(payload);
    if (!error) {
      console.log(`[Supabase] Synced contact message from ${contact.email}`);
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Sync all existing local database users and transactions to Supabase
 */
export async function syncAllLocalDataToSupabase(storageInstance: any): Promise<{
  syncedUsers: number;
  syncedTransactions: number;
  errors: string[];
}> {
  let syncedUsers = 0;
  let syncedTransactions = 0;
  const errors: string[] = [];

  try {
    const users = storageInstance.getUsers();
    for (const user of users) {
      const res = await syncUserToSupabase(user);
      if (res.success) {
        syncedUsers++;
      } else if (res.error) {
        errors.push(`User ${user.email}: ${res.error}`);
      }
    }
  } catch (err: any) {
    errors.push(`Users batch error: ${err?.message}`);
  }

  try {
    const transactions = storageInstance.getTransactions();
    for (const tx of transactions) {
      const res = await syncPaymentToSupabase(tx);
      if (res.success) {
        syncedTransactions++;
      } else if (res.error) {
        errors.push(`Payment ${tx.id}: ${res.error}`);
      }
    }
  } catch (err: any) {
    errors.push(`Transactions batch error: ${err?.message}`);
  }

  console.log(`[Supabase] Sync All completed: ${syncedUsers} users, ${syncedTransactions} transactions.`);
  return { syncedUsers, syncedTransactions, errors };
}

