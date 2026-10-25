import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  GraduationCap,
  CandlestickChart,
  Radio,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Award,
  Camera,
  Upload,
  Image as ImageIcon,
  Receipt,
  FileText,
  CreditCard,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Lesson, LiveClass, SpotSignal, FuturesSignal, PaymentTransaction, CourseEnrollment } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ProfilePictureModal } from './ProfilePictureModal.tsx';
import { compressImageFile } from '../../utils/avatarUtils.ts';

interface ProfileViewProps {
  beginnerLessons: Lesson[];
  advancedLessons: Lesson[];
  liveClasses: LiveClass[];
  spotSignals: SpotSignal[];
  futuresSignals: FuturesSignal[];
  onNavigate: (view: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  beginnerLessons,
  advancedLessons,
  liveClasses,
  spotSignals,
  futuresSignals,
  onNavigate,
}) => {
  const { user, isAdmin, isPremium, upgradeTier, updateProfile } = useAuth();
  const [isDPModalOpen, setIsDPModalOpen] = useState(false);
  const [uploadingDirect, setUploadingDirect] = useState(false);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      api.getUserTransactions()
        .then((res) => {
          if (res.transactions) setTransactions(res.transactions);
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [user?.id, user?.hasBeginnerAccess, user?.hasAdvancedAccess]);

  if (!user) {
    return (
      <div className="p-12 text-center bg-[#171717] rounded-2xl border border-[#2a2a2a]">
        <User className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Please sign in to view your learning profile</h3>
      </div>
    );
  }

  // Safe arrays
  const completedLessons = user.completedLessons || [];
  const attendedClasses = user.attendedClasses || [];
  const savedSignals = user.savedSignals || [];
  const displayName = user.name || user.email || 'User';

  // Progress calculations
  const begCompleted = beginnerLessons.filter(l => completedLessons.includes(l.id));
  const begPercent = beginnerLessons.length > 0 ? Math.round((begCompleted.length / beginnerLessons.length) * 100) : 0;

  const advCompleted = advancedLessons.filter(l => completedLessons.includes(l.id));
  const advPercent = advancedLessons.length > 0 ? Math.round((advCompleted.length / advancedLessons.length) * 100) : 0;

  const attendedClassesList = liveClasses.filter(c => attendedClasses.includes(c.id));

  const savedSpot = spotSignals.filter(s => savedSignals.includes(s.id));
  const savedFutures = futuresSignals.filter(s => savedSignals.includes(s.id));

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
    <div className="space-y-6 pb-12">
      {/* Profile Header Card */}
      <div className="rounded-2xl bg-[#171717] border border-[#2a2a2a] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* User Avatar with Gallery DP Change Controls */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#7c3aed] via-[#4f46e5] to-[#10a37f] p-1 shadow-xl">
                <div className="w-full h-full rounded-xl bg-[#171717] overflow-hidden flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-[#10a37f]">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Camera Icon Overlay on DP */}
              <button
                type="button"
                onClick={() => setIsDPModalOpen(true)}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg border border-purple-400/40 transition-all hover:scale-110 cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  isAdmin ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                  isPremium ? 'bg-[#10a37f]/15 text-[#19c37d] border border-[#10a37f]/30' :
                  'bg-[#262626] text-neutral-300'
                }`}>
                  {isAdmin ? 'ADMINISTRATOR' : user.tier + ' MEMBER'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{user.email}</p>
              
              <div className="mt-2 text-[11px] font-mono text-neutral-500 flex items-center gap-3">
                <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                <span>·</span>
                <span className="text-[#10a37f] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Identity Verified
                </span>
              </div>

              {/* Direct Profile Picture / DP Actions */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDPModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Set Profile Picture</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickFileInputRef.current?.click()}
                  disabled={uploadingDirect}
                  className="px-3.5 py-1.5 rounded-xl bg-[#232435] hover:bg-[#2d2e44] text-neutral-200 border border-[#383a54] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{uploadingDirect ? 'Uploading DP...' : 'Quick Gallery Upload'}</span>
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
            <div className="p-4 rounded-xl bg-[#212121] border border-[#2e2e2e] text-right sm:max-w-xs">
              <span className="text-xs font-bold text-white block mb-1">Upgrade to Premium Track</span>
              <p className="text-[11px] text-neutral-400 leading-tight mb-3">
                Unlock all 12 Advanced Order Flow modules, CVD case studies, and live masterclass replays.
              </p>
              <button
                onClick={() => upgradeTier('premium')}
                className="w-full py-2 px-3 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,163,127,0.3)] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Upgrade Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Academic Progress Breakdown: 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Beginner Progress */}
        <div className="rounded-xl bg-[#171717] border border-[#2a2a2a] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#10a37f]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Beginner Academy Progress
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#10a37f]">{begPercent}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#262626] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10a37f] to-[#06b6d4] rounded-full transition-all duration-500"
              style={{ width: `${begPercent}%` }}
            />
          </div>

          <div className="text-xs font-mono text-neutral-400 flex items-center justify-between">
            <span>{begCompleted.length} of {beginnerLessons.length} Modules Finished</span>
            <button
              onClick={() => onNavigate('beginner')}
              className="text-[#10a37f] hover:text-[#19c37d] font-semibold flex items-center gap-0.5"
            >
              Continue Learning <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {begCompleted.length > 0 && (
            <div className="pt-2 border-t border-[#262626]">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                Completed Lessons:
              </span>
              <div className="space-y-1">
                {begCompleted.map((l) => (
                  <div key={l.id} className="text-xs text-neutral-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10a37f] shrink-0" />
                    <span className="truncate">{l.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Progress */}
        <div className="rounded-xl bg-[#171717] border border-[#2a2a2a] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CandlestickChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Advanced Academy Progress
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">{advPercent}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#262626] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-[#10a37f] rounded-full transition-all duration-500"
              style={{ width: `${advPercent}%` }}
            />
          </div>

          <div className="text-xs font-mono text-neutral-400 flex items-center justify-between">
            <span>{advCompleted.length} of {advancedLessons.length} Modules Finished</span>
            <button
              onClick={() => onNavigate('advanced')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5"
            >
              Explore Modules <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {advCompleted.length > 0 && (
            <div className="pt-2 border-t border-[#262626]">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                Completed Advanced Modules:
              </span>
              <div className="space-y-1">
                {advCompleted.map((l) => (
                  <div key={l.id} className="text-xs text-neutral-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{l.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchased Courses & Verified Enrollments Desk */}
      <div className="rounded-2xl bg-[#171717] border border-[#2a2a2a] p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Purchased Courses & Official Enrollments
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Your verified course access, transaction receipts, and payment ledger recorded securely on the server.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-Fraud Verified</span>
            </span>
          </div>
        </div>

        {/* Active Unlocked Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Beginner Track Status */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
            user.hasBeginnerAccess || isAdmin
              ? 'bg-[#121c17] border-emerald-500/40'
              : 'bg-[#1a1a1a] border-[#292929] opacity-75'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> Beginner Trading Academy
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  user.hasBeginnerAccess || isAdmin
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {user.hasBeginnerAccess || isAdmin ? '✓ ACTIVE ENROLLMENT' : 'LOCKED'}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1.5">
                Foundations of Market Structure, Candlestick Dynamics, Liquidity Concepts, and Risk Sizing.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[11px] font-mono text-neutral-400">
                {user.hasBeginnerAccess || isAdmin ? 'Lifetime Access Included' : 'Enrollment Required'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('beginner')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1 ${
                  user.hasBeginnerAccess || isAdmin
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                }`}
              >
                <span>{user.hasBeginnerAccess || isAdmin ? 'Open Academy' : 'View Course'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Advanced VIP Masterclass Status */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
            user.hasAdvancedAccess || user.tier === 'premium' || isAdmin
              ? 'bg-[#1a1224] border-purple-500/40'
              : 'bg-[#1a1a1a] border-[#292929] opacity-75'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Advanced VIP Institutional Track
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  user.hasAdvancedAccess || user.tier === 'premium' || isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {user.hasAdvancedAccess || user.tier === 'premium' || isAdmin ? '★ VIP ACCESS ACTIVE' : 'LOCKED'}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1.5">
                CVD Delta Absorption, Order Flow Execution, High-Leverage Perpetual Futures & Real-Time Spot Signals.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[11px] font-mono text-neutral-400">
                {user.hasAdvancedAccess || user.tier === 'premium' || isAdmin ? 'Lifetime Access + Signals' : 'Enrollment Required'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('advanced')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1 ${
                  user.hasAdvancedAccess || user.tier === 'premium' || isAdmin
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                }`}
              >
                <span>{user.hasAdvancedAccess || user.tier === 'premium' || isAdmin ? 'Open Masterclass' : 'View Course'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Transactions & Receipts Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-neutral-400" /> Order History & Receipts
            </h4>
            <span className="text-[11px] font-mono text-neutral-400">
              {transactions.length} Payment {transactions.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>

          {loadingOrders ? (
            <div className="py-6 text-center text-xs font-mono text-neutral-500">
              Loading verified billing records...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#212121] border border-[#2a2a2a] text-xs text-neutral-400 space-y-1">
              <Receipt className="w-6 h-6 text-neutral-500 mx-auto mb-1" />
              <p className="text-white font-semibold">No payment orders on file yet.</p>
              <p className="text-neutral-500 text-[11px]">When you purchase a course track, your official invoice and receipt will be accessible here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#262626]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1f1f1f] text-neutral-400 text-[10px] uppercase border-b border-[#262626]">
                  <tr>
                    <th className="py-2.5 px-3">Order Ref / ID</th>
                    <th className="py-2.5 px-3">Course Plan</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626] text-neutral-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#1f1f1f] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {tx.transactionReference}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.courseType === 'advanced'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        }`}>
                          {tx.courseType === 'advanced' ? 'Advanced VIP' : 'Beginner Course'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        ${tx.amount} {tx.currency}
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] text-neutral-400 font-sans">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-neutral-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : tx.status === 'failed' || tx.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : tx.status === 'cancelled'
                            ? 'bg-neutral-800 text-neutral-400'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {tx.status === 'approved' ? '✓ Paid & Unlocked' : tx.status === 'failed' ? '✕ Failed' : tx.status === 'cancelled' ? 'Cancelled' : '● Pending Verification'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(tx)}
                          className="px-2.5 py-1 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-neutral-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-[#10a37f]" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice / Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161722] border border-[#2c2e44] rounded-2xl p-6 space-y-4 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#2c2e44] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">Official Course Invoice</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0f1017] border border-[#222438] space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Order Reference:</span>
                <span className="font-bold text-white">{selectedReceipt.transactionReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Student Account:</span>
                <span className="text-white">{selectedReceipt.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Course Track:</span>
                <span className="text-purple-300 font-bold uppercase">
                  {selectedReceipt.courseType === 'advanced' ? 'Advanced VIP Masterclass' : 'Beginner Course Crash'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Amount Charged:</span>
                <span className="font-bold text-emerald-400 text-sm">${selectedReceipt.amount} {selectedReceipt.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment Channel:</span>
                <span className="text-neutral-200 uppercase">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Order Status:</span>
                <span className={`font-bold uppercase ${selectedReceipt.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedReceipt.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Timestamp:</span>
                <span className="text-neutral-400">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
              </div>
              {selectedReceipt.senderAccount && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Account / Mask:</span>
                  <span className="text-neutral-300">{selectedReceipt.senderAccount}</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              This invoice serves as permanent verifiable proof of course enrollment under the Zia Khan Course Crash Academy.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attended Live Classes Ledger */}
      <div className="rounded-xl bg-[#171717] border border-[#2a2a2a] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Trading Class Attendance Record
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {attendedClassesList.length} Sessions Logged
          </span>
        </div>

        {attendedClassesList.length > 0 ? (
          <div className="space-y-2">
            {attendedClassesList.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg bg-[#212121] border border-[#2e2e2e] flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{c.title}</h4>
                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    Instructor: {c.instructorName} · {c.durationMinutes} mins · {c.platform}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10a37f]/15 text-[#19c37d] border border-[#10a37f]/30 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Verified Attendance
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#212121] rounded-lg border border-[#2e2e2e]">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">No live sessions logged yet.</p>
            <button
              onClick={() => onNavigate('live')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs font-semibold"
            >
              Join Live Classes
            </button>
          </div>
        )}
      </div>

      {/* Bookmarked / Saved Signals */}
      <div className="rounded-xl bg-[#171717] border border-[#2a2a2a] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Saved / Bookmarked Signals
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {savedSpot.length + savedFutures.length} Signals Bookmarked
          </span>
        </div>

        {savedSpot.length + savedFutures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedSpot.map((sig) => (
              <div
                key={sig.id}
                onClick={() => onNavigate('spot')}
                className="p-3 rounded-lg bg-[#212121] border border-[#2e2e2e] hover:border-[#10a37f]/40 cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{sig.pair} (Spot)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10a37f]/15 text-[#19c37d]">
                    {sig.direction}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <span>Entry: ${sig.entryZone}</span>
                  <span className="text-[#38bdf8]">{sig.status}</span>
                </div>
              </div>
            ))}

            {savedFutures.map((sig) => (
              <div
                key={sig.id}
                onClick={() => onNavigate('futures')}
                className="p-3 rounded-lg bg-[#212121] border border-[#2e2e2e] hover:border-[#10a37f]/40 cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{sig.pair} (Futures {sig.leverage})</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400">
                    {sig.direction}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <span>Entry: ${sig.entryZone}</span>
                  <span className="text-[#38bdf8]">{sig.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#212121] rounded-lg border border-[#2e2e2e]">
            <Bookmark className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">No signals bookmarked yet. Click the bookmark icon on any spot or futures setup to pin it here.</p>
          </div>
        )}
      </div>

      {/* Profile Picture / DP Gallery Modal */}
      <ProfilePictureModal
        isOpen={isDPModalOpen}
        onClose={() => setIsDPModalOpen(false)}
      />
    </div>
  );
};
