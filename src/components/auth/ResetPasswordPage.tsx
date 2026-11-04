import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { Logo } from '../common/Logo.tsx';
import { supabase } from '../../lib/supabase.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';

interface ResetPasswordPageProps {
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
  onRequestNewLink?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onSuccess,
  onNavigateToLogin,
  onRequestNewLink,
}) => {
  const { recoveryError, clearRecoveryState, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(recoveryError || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Sync recovery error from AuthContext if updated
  useEffect(() => {
    if (recoveryError) {
      setErrorMessage(recoveryError);
    }
  }, [recoveryError]);

  // Check if a Supabase recovery session exists
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session?.user) {
            setHasActiveSession(true);
          } else {
            // Give detectSessionInUrl a small window to finish parsing hash fragment
            setTimeout(async () => {
              if (!isMounted) return;
              const { data: { session: delayed } } = await supabase.auth.getSession();
              setHasActiveSession(!!delayed?.user);
              setSessionChecked(true);
            }, 500);
            return;
          }
          setSessionChecked(true);
        }
      } catch {
        if (isMounted) setSessionChecked(true);
      }
    };

    verifySession();
    return () => { isMounted = false; };
  }, []);

  // Handle countdown redirect on success
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (onSuccess) {
        onSuccess();
      } else if (onNavigateToLogin) {
        onNavigateToLogin();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onSuccess, onNavigateToLogin]);

  // Live password validation
  const hasMinLength = newPassword.length >= 6;
  const hasLetterAndNumber = /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setLoading(true);

    try {
      // Securely update password using Supabase Auth recovery session with session verification
      const res = await updatePassword(newPassword);

      if (!res.success) {
        throw new Error(res.message);
      }

      setSuccessMessage('Your password has been updated successfully in Supabase! Redirecting to login...');
      setCountdown(3);
    } catch (err: any) {
      const msg = err?.message || 'Failed to update password. Please request a new reset link.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNew = () => {
    clearRecoveryState();
    if (onRequestNewLink) {
      onRequestNewLink();
    } else if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-md bg-white border border-purple-200/90 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-purple-950/20 z-10 my-auto">
        {/* Header / Brand */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
          <Logo size="md" showText={true} />
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold tracking-wide uppercase">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Official Supabase Auth Recovery</span>
          </div>
        </div>

        {/* Success State */}
        {successMessage ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Password Updated Successfully!
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your new password is now active in Supabase Authentication. You can sign in using your registered email and new password.
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
              Redirecting to login in <span className="font-bold text-purple-700">{countdown ?? 3}s</span>...
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSuccess) onSuccess();
                else if (onNavigateToLogin) onNavigateToLogin();
              }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Title & Instructions */}
            <div className="mt-5 mb-4">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Reset Your Password
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enter your new secure password below to regain full access to your Learn and Grow student account.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>
                {(errorMessage.toLowerCase().includes('expired') ||
                  errorMessage.toLowerCase().includes('invalid') ||
                  errorMessage.toLowerCase().includes('session') ||
                  errorMessage.toLowerCase().includes('link')) && (
                  <button
                    type="button"
                    onClick={handleRequestNew}
                    className="self-start text-[11px] font-bold text-rose-800 underline hover:text-rose-950 mt-1 cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Request New Recovery Link</span>
                  </button>
                )}
              </div>
            )}

            {/* No active session notice */}
            {!errorMessage && sessionChecked && !hasActiveSession && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span className="font-medium leading-relaxed">
                    No active recovery session detected. If you clicked a recovery link from your Gmail inbox, the link may have expired or was already used.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestNew}
                  className="self-start text-[11px] font-bold text-amber-900 underline hover:text-amber-950 mt-1 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Send Fresh Recovery Link to Email</span>
                </button>
              </div>
            )}

            {/* Password Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: New Password */}
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  New Password <span className="text-purple-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Helpers */}
                {newPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-3 text-[11px]">
                    <span className={`inline-flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> 6+ characters
                    </span>
                    <span className={`inline-flex items-center gap-1 ${hasLetterAndNumber ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3 h-3" /> Letters & numbers
                    </span>
                  </div>
                )}
              </div>

              {/* Field 2: Confirm New Password */}
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">
                  Confirm New Password <span className="text-purple-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div className="mt-1.5 text-[11px]">
                    {passwordsMatch ? (
                      <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium inline-flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match yet
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || (confirmPassword.length > 0 && !passwordsMatch) || newPassword.length < 6}
                className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={handleRequestNew}
                className="text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
              >
                Request new link
              </button>
              <button
                type="button"
                onClick={() => {
                  clearRecoveryState();
                  if (onNavigateToLogin) onNavigateToLogin();
                }}
                className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
