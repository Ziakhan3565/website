import React, { useState, useRef } from 'react';
import {
  User,
  ShieldCheck,
  Camera,
  Upload,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Lesson, LiveClass, SpotSignal, FuturesSignal, ExchangeReferral } from '../../types/index.ts';
import { ProfilePictureModal } from './ProfilePictureModal.tsx';
import { compressImageFile } from '../../utils/avatarUtils.ts';
import { ExchangeReferralCards } from '../common/ExchangeReferralCards.tsx';

interface ProfileViewProps {
  beginnerLessons: Lesson[];
  advancedLessons: Lesson[];
  liveClasses: LiveClass[];
  spotSignals: SpotSignal[];
  futuresSignals: FuturesSignal[];
  exchanges?: ExchangeReferral[];
  onNavigate: (view: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  exchanges = [],
}) => {
  const { user, isAdmin, isPremium, updateProfile, changePassword } = useAuth();
  const [isDPModalOpen, setIsDPModalOpen] = useState(false);
  const [uploadingDirect, setUploadingDirect] = useState(false);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <User className="w-12 h-12 text-purple-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Please sign in to view your profile</h3>
      </div>
    );
  }

  const displayName = user.name || user.email || 'User';

  const handleDirectGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingDirect(true);
      const compressed = await compressImageFile(file, 350, 0.85);
      await updateProfile({ avatarUrl: compressed });
    } catch (err: any) {
      alert(err.message || 'Failed to update profile picture from gallery');
    } finally {
      setUploadingDirect(false);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordUpdating(true);
    try {
      const res = await changePassword(newPassword, currentPassword || undefined);
      if (res.success) {
        setPasswordSuccess(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(res.message);
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-5xl mx-auto">
      {/* Profile Header Card with Learn & Grow Theme */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/80 border border-purple-200/90 p-5 sm:p-7 lg:p-8 shadow-sm relative overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* User Avatar with Learn & Grow Border */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 p-1 shadow-md shadow-purple-600/25">
                <div className="w-full h-full rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-100">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-extrabold text-purple-700 font-mono">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Camera Icon Overlay on DP */}
              <button
                type="button"
                onClick={() => setIsDPModalOpen(true)}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-white transition-all hover:scale-110 cursor-pointer"
                title="Upload Profile Picture"
              >
                <Camera className="w-4 h-4 fill-white/20" />
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                  isAdmin ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  isPremium ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {isAdmin ? '★ ADMINISTRATOR' : user.tier + ' MEMBER'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-700 font-mono mt-0.5 font-semibold">{user.email}</p>
              
              <div className="mt-2 text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-2 sm:gap-3">
                <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                <span>·</span>
                <span className="text-purple-700 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Identity Verified
                </span>
                <span>·</span>
                <span className="text-emerald-700 font-semibold">
                  {user.hasAdvancedAccess ? '✓ Advanced VIP Unlocked' : user.hasBeginnerAccess ? '✓ Beginner Academy Active' : 'Student Account'}
                </span>
              </div>

              {/* Profile Picture Actions with 'Upload Profile Picture' */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDPModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>Upload Profile Picture</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickFileInputRef.current?.click()}
                  disabled={uploadingDirect}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-600" />
                  <span>{uploadingDirect ? 'Uploading DP...' : 'Upload from Gallery'}</span>
                </button>

                <input
                  type="file"
                  ref={quickFileInputRef}
                  onChange={handleDirectGalleryUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Official Exchange Referral Accounts (MEXC • Binance • Bybit) */}
      {exchanges && exchanges.length > 0 && (
        <ExchangeReferralCards
          exchanges={exchanges}
          title="Official Partner Exchange Accounts (MEXC • Binance • Bybit)"
          subtitle="Direct registration links and bracketed fee discount codes for your student trading terminal."
        />
      )}

      {/* Account Security & Password Management */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Security & Password Management</h2>
            <p className="text-xs text-slate-500">
              Update your account password securely through Supabase Authentication.
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Current Password <span className="text-[11px] text-slate-400 font-normal">(optional security check)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              New Password <span className="text-[11px] text-slate-400 font-normal">(minimum 6 characters)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
              {confirmNewPassword && newPassword && (
                <span className={`text-[10px] font-mono font-bold ${
                  confirmNewPassword === newPassword ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {confirmNewPassword === newPassword ? '✓ Passwords Match' : '✗ Passwords do not match'}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                  confirmNewPassword && newPassword && confirmNewPassword !== newPassword
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                    : confirmNewPassword && newPassword && confirmNewPassword === newPassword
                    ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500'
                    : 'border-slate-200 focus:border-purple-600 focus:ring-purple-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                tabIndex={-1}
                aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
              >
                {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordUpdating || newPassword.length < 6 || (confirmNewPassword.length > 0 && newPassword !== confirmNewPassword)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {passwordUpdating ? (
              <span>Updating Password...</span>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Profile Picture / DP Gallery Modal */}
      <ProfilePictureModal
        isOpen={isDPModalOpen}
        onClose={() => setIsDPModalOpen(false)}
      />
    </div>
  );
};
