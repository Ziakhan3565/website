import React, { useState, useRef } from 'react';
import {
  User,
  ShieldCheck,
  Camera,
  Upload,
  Sparkles
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
  const { user, isAdmin, isPremium, upgradeTier, updateProfile } = useAuth();
  const [isDPModalOpen, setIsDPModalOpen] = useState(false);
  const [uploadingDirect, setUploadingDirect] = useState(false);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

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

          {/* Upgrade Tier CTA if free */}
          {!isAdmin && !isPremium && (
            <div className="p-4 rounded-2xl bg-white border border-purple-200 text-left md:text-right md:max-w-xs shadow-xs">
              <span className="text-xs font-bold text-slate-900 block mb-1">Upgrade to Premium Track</span>
              <p className="text-[11px] text-slate-600 leading-tight mb-3">
                Unlock all Advanced Order Flow modules, CVD case studies, and live masterclass replays.
              </p>
              <button
                onClick={() => upgradeTier('premium')}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Upgrade Account
              </button>
            </div>
          )}
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

      {/* Profile Picture / DP Gallery Modal */}
      <ProfilePictureModal
        isOpen={isDPModalOpen}
        onClose={() => setIsDPModalOpen(false)}
      />
    </div>
  );
};
