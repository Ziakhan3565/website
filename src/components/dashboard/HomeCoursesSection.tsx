import React from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Lesson, CoursePricingConfig } from '../../types/index.ts';

interface HomeCoursesSectionProps {
  onNavigate: (view: string) => void;
  onOpenPayment: (plan: 'beginner' | 'advanced') => void;
  beginnerLessons?: Lesson[];
  advancedLessons?: Lesson[];
  pricing?: CoursePricingConfig;
}

export const HomeCoursesSection: React.FC<HomeCoursesSectionProps> = ({
  onNavigate,
  onOpenPayment,
  beginnerLessons = [],
  advancedLessons = [],
  pricing,
}) => {
  const { user, isAdmin, hasBeginnerAccess, hasAdvancedAccess } = useAuth();

  const beginnerPrice = pricing?.beginnerPrice ?? 2;
  const advancedPrice = pricing?.advancedPrice ?? 5;
  const currency = pricing?.currency ?? 'USD';

  const canAccessBeginner = isAdmin || hasBeginnerAccess;
  const canAccessAdvanced = isAdmin || hasAdvancedAccess;

  const handleBeginnerClick = () => {
    if (canAccessBeginner) {
      onNavigate('beginner');
    } else {
      onOpenPayment('beginner');
    }
  };

  const handleAdvancedClick = () => {
    if (canAccessAdvanced) {
      onNavigate('advanced');
    } else {
      onOpenPayment('advanced');
    }
  };

  return (
    <section id="home-courses-section" className="space-y-6 pt-2">
      {/* Financial Market Educational Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 p-6 sm:p-8 text-center relative overflow-hidden shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-700 text-xs font-mono font-bold uppercase mb-3">
          <Globe className="w-3.5 h-3.5 text-purple-600" />
          <span>Financial Markets Education Portal</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Master Trading in Financial Markets
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Financial markets offer limitless opportunities across Crypto, Forex, Commodities, and Equities.
          Enroll in our structured training courses to acquire disciplined risk management, candlestick price action mastery, and institutional strategy.
          Click either course below to start—simply complete <strong>Pay Now</strong> for instant lifetime access.
        </p>
      </div>

      {/* Courses Grid: Mobile 1-col, Tablet/Laptop 2-cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Beginner Academy Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl group">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                Beginner Academy
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                ${beginnerPrice} <span className="text-xs text-slate-500 font-sans">{currency}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              Trading Foundation & Market Basics
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Designed for newcomers. Master how global markets move, learn how to read candlesticks, understand chart timeframes, and protect your capital with foundational risk management rules.
            </p>

            <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Introduction to Crypto & Financial Markets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Candlestick Anatomy, Trends & Chart Patterns</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Support, Resistance & Supply-Demand Zones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Trading Psychology & Capital Protection 101</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Full Lifetime Access ({beginnerLessons.length || 10}+ structured lessons)</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={handleBeginnerClick}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                canAccessBeginner
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25'
              }`}
            >
              {canAccessBeginner ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Access Beginner Academy</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay Now to Unlock (${beginnerPrice})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Advance VIP Masterclass Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl group">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                Advance VIP Masterclass
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                ${advancedPrice} <span className="text-xs text-slate-500 font-sans">{currency}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              Institutional Strategy & VIP Signals
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Designed for serious traders. Dive into Smart Money Concepts (SMC), liquidity sweeps, order blocks, advanced futures leverage execution, and real-time live trading signals.
            </p>

            <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Smart Money Concepts (SMC) & Liquidity Sweeps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Institutional Order Flow, Fair Value Gaps (FVG)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>High-Leverage Futures Strategies & Position Sizing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>VIP Live Signals & Multi-Timeframe Confluence</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Direct Mentor Support ({advancedLessons.length || 10}+ master lessons)</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={handleAdvancedClick}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                canAccessAdvanced
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25'
              }`}
            >
              {canAccessAdvanced ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Access Advance Academy</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay Now to Unlock (${advancedPrice})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
