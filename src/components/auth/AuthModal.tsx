import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Logo } from '../common/Logo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  forced?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  forced = false,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(defaultMode);

  // Form states
  const [identifier, setIdentifier] = useState(''); // Email or Username (e.g. admin)
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  useEffect(() => {
    setMode(defaultMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailStatus(null);
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  // Real-time email validation
  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    setErrorMessage(null);

    const clean = val.trim();
    if (!clean) {
      setEmailStatus(null);
      return;
    }

    if (mode === 'register') {
      if (!EMAIL_REGEX.test(clean)) {
        setEmailStatus({
          validFormat: false,
          checked: false,
          message: 'Invalid email format. Please enter a valid email (e.g. user@gmail.com)',
        });
        return;
      }
      setEmailStatus({ validFormat: true, checked: false });
    }
  };

  const handleIdentifierBlur = async () => {
    const clean = identifier.trim();
    if (!clean) return;

    if (EMAIL_REGEX.test(clean)) {
      try {
        const res = await api.checkEmail(clean);
        setEmailStatus({
          validFormat: true,
          checked: true,
          exists: res.exists,
          message: res.message,
        });

        if (mode === 'register' && res.exists) {
          setErrorMessage('This email already exists! You already have an account. Please sign in instead.');
        } else {
          setErrorMessage(null);
        }
      } catch (e) {
        // Non-blocking
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setErrorMessage('Please provide both username/email and password.');
      return;
    }

    if (mode === 'register') {
      if (!EMAIL_REGEX.test(cleanId)) {
        setErrorMessage('Invalid email format. Please enter a valid email address (e.g. name@gmail.com).');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(cleanId, password);
        onClose();
      } else if (mode === 'register') {
        await register(name.trim() || cleanId.split('@')[0], cleanId, password);
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(cleanId);
        setSuccessMessage(res.message);
        if (res.resetToken) {
          setResetToken(res.resetToken);
          setMode('reset');
        }
      } else if (mode === 'reset') {
        const res = await api.resetPassword(resetToken, newPassword);
        setSuccessMessage(res.message);
        setMode('login');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#111219] border border-[#232533] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f202d]">
          <Logo size="sm" showText={true} />
          {!forced && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-[#1a1b26] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dual Tab Switcher: LOGIN vs NEW USER SIGN UP (Matching Screenshot) */}
        <div className="grid grid-cols-2 gap-2 mt-5 mb-5 p-1 bg-[#181924] rounded-full border border-[#232533]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
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
            }}
            className={`py-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Heading */}
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Your Student Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'Set New Password'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login' && 'Enter your username or email and password to access the learning portal.'}
            {mode === 'register' && 'Join the community. Complete your registration for full curriculum access.'}
            {mode === 'forgot' && 'Enter your registered email address to receive password reset instructions.'}
          </p>
        </div>

        {/* Real-time Email Format Notification */}
        {emailStatus && !emailStatus.validFormat && mode === 'register' && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{emailStatus.message}</span>
          </div>
        )}

        {/* Warning if email already registered */}
        {mode === 'register' && emailStatus?.exists && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="font-bold">Account Already Exists!</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              An account with this email address is already registered. You can log in directly.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className="mt-1 py-1 px-3 rounded-lg bg-amber-400 text-black font-bold text-xs text-center hover:bg-amber-300 w-fit"
            >
              Switch to Login
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="text-neutral-300 text-xs font-semibold block mb-1">
                Full Name / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#181924] border border-[#232533] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-300 text-xs font-semibold">
                  {mode === 'register' ? 'Gmail / Email Address' : 'Email Address or Username'}
                </label>
                {emailStatus?.validFormat && emailStatus?.checked && (
                  <span className={`text-[10px] font-mono ${emailStatus.exists ? 'text-purple-400' : 'text-neutral-400'}`}>
                    {emailStatus.exists ? 'Account Found' : 'Available'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={mode === 'register' ? 'email' : 'text'}
                  placeholder={mode === 'register' ? 'you@gmail.com' : 'Username or Email'}
                  value={identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  onBlur={handleIdentifierBlur}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#181924] border border-[#232533] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-300 text-xs font-semibold">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-mono"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#181924] border border-[#232533] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div>
                <label className="text-neutral-300 text-xs block mb-1">Reset Token</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181924] border border-[#232533] text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-neutral-300 text-xs block mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181924] border border-[#232533] text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:opacity-95 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-wider"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Submit'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-5 pt-4 border-t border-[#1f202d] text-center text-xs text-neutral-400">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="text-purple-400 hover:underline font-bold"
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
                }}
                className="text-purple-400 hover:underline font-bold"
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
