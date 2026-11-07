import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { checkSupabaseEmailExists, normalizeEmail, formatSupabaseAuthError } from '../../lib/supabase.ts';
import { Logo } from '../common/Logo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot' | 'reset' | 'verify-otp';
  forced?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  forced = false,
}) => {
  const { login, register, resendVerification, verifyOtp, forgotPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset' | 'verify-otp'>(defaultMode);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [defaultMode, isOpen]);

  // Form states
  const [identifier, setIdentifier] = useState(''); // Email or Username (e.g. admin)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpType, setOtpType] = useState<'signup' | 'recovery'>('signup');

  // 60-Second Cooldown Timer for Resending Verification Emails / OTP
  const [resendCooldown, setResendCooldown] = useState(0);

  // Email status for real-time validation
  const [emailStatus, setEmailStatus] = useState<{
    validFormat: boolean;
    checked: boolean;
    exists?: boolean;
    message?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [showResendBtn, setShowResendBtn] = useState(false);

  // Cooldown interval effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    setMode(defaultMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailStatus(null);
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  // Real-time email validation
  const handleIdentifierChange = async (val: string) => {
    setIdentifier(val);
    setErrorMessage(null);

    const clean = normalizeEmail(val);
    if (!clean) {
      setEmailStatus(null);
      return;
    }

    if (mode === 'register') {
      if (!EMAIL_REGEX.test(clean)) {
        setEmailStatus({
          validFormat: false,
          checked: false,
          message: 'Please enter a valid email address (e.g. user@gmail.com)',
        });
        return;
      }
      setEmailStatus({ validFormat: true, checked: false });
    }
  };

  const handleIdentifierBlur = async () => {
    const clean = normalizeEmail(identifier);
    if (!clean || !EMAIL_REGEX.test(clean)) return;

    try {
      const check = await checkSupabaseEmailExists(clean);
      setEmailStatus({
        validFormat: true,
        checked: true,
        exists: check.exists,
        message: check.exists
          ? 'Account found. You can sign in with your password.'
          : (mode === 'register' ? 'Email is available for registration.' : undefined),
      });

      if (mode === 'register' && check.exists) {
        setErrorMessage('This email is already registered! Please sign in to your existing account.');
      }
    } catch {
      // Non-blocking
    }
  };

  const switchToLoginWithCurrentEmail = () => {
    setMode('login');
    setErrorMessage('This email is already registered. Please enter your password to sign in.');
    setSuccessMessage(null);
  };

  const handleResendConfirmation = async () => {
    const cleanId = normalizeEmail(identifier);
    if (!cleanId) {
      setErrorMessage('Please enter your email address to resend verification.');
      return;
    }
    if (resendCooldown > 0) return;

    setResending(true);
    setErrorMessage(null);
    try {
      const res = await resendVerification(cleanId);
      if (res.success) {
        setSuccessMessage(res.message);
        setResendCooldown(60); // 60s cooldown
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = normalizeEmail(identifier);
    const cleanOtp = otpCode.trim();

    if (!cleanId) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit confirmation code from your email.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyOtp(cleanId, cleanOtp, otpType);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onClose();
        }, otpType === 'recovery' ? 300 : 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(formatSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'verify-otp') {
      return handleVerifyOtpSubmit(e);
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = normalizeEmail(identifier);
    if (!cleanId) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode === 'login' && !password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!EMAIL_REGEX.test(cleanId)) {
        setErrorMessage('Invalid email format. Please enter a valid email address (e.g. name@gmail.com).');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (!confirmPassword) {
        setErrorMessage('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match! Please enter matching passwords in both fields.');
        return;
      }

      // Check if email already exists before signup
      setLoading(true);
      const emailCheck = await checkSupabaseEmailExists(cleanId);
      if (emailCheck.exists) {
        setLoading(false);
        switchToLoginWithCurrentEmail();
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(cleanId, password);
        if (res.requiresVerification) {
          setErrorMessage(res.message || 'Your email is not verified yet.');
          setMode('verify-otp');
          setResendCooldown(60);
          setLoading(false);
          return;
        }
        onClose();
      } else if (mode === 'register') {
        const res = await register(name.trim() || cleanId.split('@')[0], cleanId, password);
        if (res.requiresVerification) {
          setSuccessMessage(res.message || 'Verification email dispatched! Please check your inbox and enter the 6-digit code below.');
          setOtpType('signup');
          setMode('verify-otp');
          setResendCooldown(60);
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        const res = await forgotPassword(cleanId);
        setSuccessMessage(res.message || 'If this email is registered, a password recovery email has been sent to your inbox.');
        setOtpType('recovery');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('already registered')) {
        switchToLoginWithCurrentEmail();
      } else if (msg.toLowerCase().includes('verify') || msg.toLowerCase().includes('not confirmed')) {
        setMode('verify-otp');
        setResendCooldown(60);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-purple-200 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <Logo size="sm" showText={true} />
          {!forced && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dual Tab Switcher: LOGIN vs NEW USER SIGN UP (hidden when in verify-otp) */}
        {mode === 'verify-otp' ? (
          <div className="flex items-center gap-2 mt-4 mb-4 p-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{otpType === 'recovery' ? 'Password Recovery Verification' : 'Email Verification Required'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mt-5 mb-5 p-1 bg-slate-100 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
                setShowResendBtn(false);
                setConfirmPassword('');
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className={`py-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
                setShowResendBtn(false);
                setConfirmPassword('');
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className={`py-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Heading */}
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Your Student Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'Set New Password'}
            {mode === 'verify-otp' && (otpType === 'recovery' ? 'Enter Recovery Code' : 'Verify Your Email')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Enter your registered email and password to access your Student Dashboard.'}
            {mode === 'register' && 'Join the academy. Permanent student account with real-time progress tracking.'}
            {mode === 'forgot' && 'Enter your registered email to receive an official Supabase password reset link or recovery code.'}
            {mode === 'verify-otp' && (otpType === 'recovery'
              ? `Enter the 6-digit password recovery code sent to ${identifier || 'your email'} to reset your password.`
              : `Enter the 6-digit confirmation code sent to ${identifier || 'your email'} to activate your account.`)}
          </p>
        </div>

        {/* Real-time Email Format Notification */}
        {emailStatus && !emailStatus.validFormat && mode === 'register' && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{emailStatus.message}</span>
          </div>
        )}

        {/* Banner if email already registered */}
        {mode === 'register' && emailStatus?.exists && (
          <div className="mb-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-purple-600" />
              <span className="font-bold">Account Already Exists!</span>
            </div>
            <p className="text-[11px] text-purple-700 leading-relaxed">
              An account with this email address is already registered. Please sign in directly.
            </p>
            <button
              type="button"
              onClick={switchToLoginWithCurrentEmail}
              className="mt-1 py-1 px-3 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-xs text-center hover:opacity-90 w-fit cursor-pointer"
            >
              Switch to Login
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resend Verification Email Button (in login/register mode) */}
        {showResendBtn && mode !== 'verify-otp' && (
          <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Didn't receive verification email?</span>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending || resendCooldown > 0}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Sending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Email'}</span>
            </button>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'verify-otp' ? (
            <div className="space-y-3.5">
              <div>
                <label className="text-slate-700 text-xs font-semibold block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                    placeholder="name@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 text-xs font-semibold">
                    {otpType === 'recovery' ? '6-Digit Recovery Code' : '6-Digit Confirmation Code (OTP)'}
                  </label>
                  <span className="text-[10px] text-slate-400">Check inbox & spam</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center tracking-widest text-lg font-bold placeholder-slate-300 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {otpType === 'recovery'
                    ? 'You can also click the direct reset link in the recovery email.'
                    : 'You can also click the direct confirmation link sent to your email.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-wider cursor-pointer"
              >
                {loading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <span>{otpType === 'recovery' ? 'Verify Code & Set New Password' : 'Verify Code & Sign In'}</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending || resendCooldown > 0}
                  className="text-xs text-purple-700 hover:text-purple-900 font-semibold disabled:text-slate-400 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>
                    {resending
                      ? 'Sending...'
                      : resendCooldown > 0
                      ? `Resend Code (${resendCooldown}s)`
                      : 'Resend Confirmation Code'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {mode === 'register' && (
                <div>
                  <label className="text-slate-700 text-xs font-semibold block mb-1">
                    Full Name / Student Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 text-xs font-semibold">
                      {mode === 'register' ? 'Gmail / Email Address' : 'Email Address'}
                    </label>
                    {emailStatus?.validFormat && emailStatus?.checked && (
                      <span className={`text-[10px] font-mono ${emailStatus.exists ? 'text-purple-600 font-bold' : 'text-slate-500'}`}>
                        {emailStatus.exists ? 'Account Found' : 'Available'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={identifier}
                      onChange={(e) => handleIdentifierChange(e.target.value)}
                      onBlur={handleIdentifierBlur}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              {(mode === 'login' || mode === 'register') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 text-xs font-semibold">
                      {mode === 'register' ? 'Enter Password' : 'Password'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[11px] text-purple-700 hover:text-purple-900 font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 text-xs font-semibold">Confirm Password</label>
                    {confirmPassword && password && (
                      <span className={`text-[10px] font-mono font-bold ${
                        confirmPassword === password ? 'text-emerald-600' : 'text-rose-500'
                      }`}>
                        {confirmPassword === password ? '✓ Passwords Match' : '✗ Passwords do not match'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                        confirmPassword && password && confirmPassword !== password
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                          : confirmPassword && password && confirmPassword === password
                          ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500'
                          : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-wider cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {mode === 'forgot' && successMessage && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                  <span className="text-xs text-purple-900 font-medium">Received a 6-digit recovery code in your email?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpType('recovery');
                      setMode('verify-otp');
                      setErrorMessage(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Enter 6-Digit Code
                  </button>
                </div>
              )}
            </>
          )}
        </form>

        {/* Footer switch */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          {mode === 'verify-otp' ? (
            <p>
              Entered the wrong email?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-purple-700 hover:text-purple-900 hover:underline font-bold cursor-pointer"
              >
                Start Over
              </button>
            </p>
          ) : mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setShowResendBtn(false);
                  setConfirmPassword('');
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="text-purple-700 hover:text-purple-900 hover:underline font-bold cursor-pointer"
              >
                Sign Up Now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setShowResendBtn(false);
                  setConfirmPassword('');
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="text-purple-700 hover:text-purple-900 hover:underline font-bold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
