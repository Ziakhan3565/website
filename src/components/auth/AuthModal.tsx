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

        {/* Dual Tab Switcher: LOGIN vs NEW USER SIGN UP */}
        <div className="grid grid-cols-2 gap-2 mt-5 mb-5 p-1 bg-slate-100 rounded-full border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
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

        {/* Heading */}
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Your Student Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'Set New Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Enter your username or email and password to access the learning portal.'}
            {mode === 'register' && 'Join the community. Complete your registration for full curriculum access.'}
            {mode === 'forgot' && 'Enter your registered email address to receive password reset instructions.'}
          </p>
        </div>

        {/* Real-time Email Format Notification */}
        {emailStatus && !emailStatus.validFormat && mode === 'register' && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{emailStatus.message}</span>
          </div>
        )}

        {/* Warning if email already registered */}
        {mode === 'register' && emailStatus?.exists && (
          <div className="mb-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-purple-600" />
              <span className="font-bold">Account Already Exists!</span>
            </div>
            <p className="text-[11px] text-purple-700 leading-relaxed">
              An account with this email address is already registered. You can log in directly.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
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

        {/* Success message */}
        {successMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="text-slate-700 text-xs font-semibold block mb-1">
                Full Name / Username
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
                  {mode === 'register' ? 'Gmail / Email Address' : 'Email Address or Username'}
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
                  type={mode === 'register' ? 'email' : 'text'}
                  placeholder={mode === 'register' ? 'you@gmail.com' : 'Username or Email'}
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
                <label className="text-slate-700 text-xs font-semibold">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div>
                <label className="text-slate-700 text-xs block mb-1">Reset Token</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
              <div>
                <label className="text-slate-700 text-xs block mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
            </>
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
                <span>{mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Submit'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
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
