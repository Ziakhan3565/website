import React from 'react';
import {
  GraduationCap,
  Zap,
  Radio,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
  PlayCircle,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight,
  Calculator,
  Compass,
  AlertTriangle,
  Flame,
  Activity,
  DollarSign
} from 'lucide-react';
import type { Lesson, LiveClass, SpotSignal, FuturesSignal, MarketTicker, CoursePricingConfig } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { CommunityDemandPortal } from '../portal/CommunityDemandPortal.tsx';

interface HomeDashboardProps {
  onNavigate: (view: string) => void;
  beginnerLessons: Lesson[];
  advancedLessons: Lesson[];
  liveClasses: LiveClass[];
  spotSignals: SpotSignal[];
  futuresSignals: FuturesSignal[];
  tickers: MarketTicker[];
  completedLessonsCount: number;
  pricing?: CoursePricingConfig;
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  beginnerLessons,
  advancedLessons,
  liveClasses,
  spotSignals,
  futuresSignals,
  pricing,
  onOpenPayment,
}) => {
  const { hasBeginnerAccess, hasAdvancedAccess, isAdmin } = useAuth();

  const beginnerPrice = pricing ? pricing.beginnerPrice : 2;
  const advancedPrice = pricing ? pricing.advancedPrice : 5;

  const currentLive = liveClasses.find((c) => c.status === 'live');
  const activeSpot = spotSignals.filter((s) => s.status === 'Active');
  const activeFutures = futuresSignals.filter((s) => s.status === 'Active');

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      {/* 1. HERO SECTION: FINANCIAL MARKETS OVERVIEW */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-10 border border-purple-500/25 bg-gradient-to-br from-[#16132b]/95 via-[#0e101f]/95 to-[#080913]/95 shadow-2xl backdrop-blur-xl">
        {/* Ambient glow orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-600/25 via-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-600/20 via-emerald-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-cyan-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>COURSE CRASH · FINANCIAL MARKETS & CRYPTOCURRENCY ACADEMY</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Master Financial Markets with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-[#818cf8] to-[#38bdf8]">
              Mathematical Discipline
            </span>
          </h1>

          {/* Core Financial Market Knowledge */}
          <div className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed bg-black/40 p-5 sm:p-6 rounded-2xl border border-white/10 shadow-inner">
            <p>
              <strong className="text-white">What are Financial Markets?</strong> Financial markets are continuous auction environments where global participants buy and sell capital assets, commodities, currencies, and cryptocurrencies. Prices do not move by chance; they move as a direct result of supply and demand, order book liquidity, and the constant positioning of institutional market makers.
            </p>
            <p className="text-neutral-300">
              <strong className="text-white">How Trading Works:</strong> Retail traders often guess directions based on social hype. Professional traders, however, understand market structure: identifying liquidity pools, order flow absorption (where large orders are filled), and executing asymmetric trade setups where potential rewards greatly outweigh the controlled risk.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#141526]/80 border border-purple-500/25">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Beginner Track</span>
              <span className="text-lg font-black text-emerald-400 font-mono">${beginnerPrice} USD</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">{beginnerLessons.length} Video Lessons</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#141526]/80 border border-purple-500/25">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Advance VIP Track</span>
              <span className="text-lg font-black text-purple-400 font-mono">${advancedPrice} USD</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">{advancedLessons.length} Video Modules</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#141526]/80 border border-purple-500/25">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Active Signals</span>
              <span className="text-lg font-black text-white font-mono">{activeSpot.length + activeFutures.length}</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Spot & Futures</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#141526]/80 border border-purple-500/25">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Live Desk</span>
              <span className="text-lg font-black text-rose-400 font-mono">Interactive</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Live Streaming</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY THIS COURSE IS THE BEST CHOICE FOR BEGINNERS */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0f101a] border border-[#23253b] shadow-xl space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
            FOUNDATION ADVANTAGE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            Why Our Beginner Course is the Best Starting Point
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Most beginners lose capital because they follow signals without understanding basic chart anatomy, order execution, or risk limits. Here is why Course Crash is designed for your success:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#141523] border border-[#26283d] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Zero Prior Knowledge Required</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We start from absolute scratch: explaining what cryptocurrency is, how blockchain works, and how to safely set up and protect exchange accounts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141523] border border-[#26283d] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Pure Video Curriculum</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No endless textbook reading. Every single module is a visual video walkthrough recorded directly on real exchange screens and live TradingView charts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141523] border border-[#26283d] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Strict Capital Preservation (1% Rule)</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Before teaching you how to make profit, we teach you how to never blow up your account. Strict position sizing formulas keep your funds secure.
            </p>
          </div>
        </div>
      </section>

      {/* 3. DETAILED CURRICULUM: WHAT IS TAUGHT IN BEGINNER & ADVANCE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
              COURSE SYLLABUS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
              What You Will Learn in Our Courses
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onOpenPayment ? onOpenPayment('beginner') : null}
            className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-colors"
          >
            <PlayCircle className="w-4 h-4 text-purple-400" />
            <span>How to Pay & Enroll (Video)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Beginner Crash Course */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0f1019] border border-[#23253b] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  BEGINNER TRACK
                </span>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    ${beginnerPrice}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 ml-1">USD</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  Beginner Cryptocurrency Course Crash
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Fast-track zero-fluff training to take you from foundational mechanics to disciplined execution. Master the core essentials before risking capital.
                </p>
              </div>

              {/* What will be taught inside */}
              <div className="space-y-2 pt-2 border-t border-[#1d1f2e]">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                  Topics Taught in This Course:
                </span>
                <ul className="space-y-2 text-xs text-neutral-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Candlestick Anatomy & Timeframes:</strong> Understand wicks, bodies, trends, and support/resistance zones.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Spot Market Execution:</strong> How to buy and sell on Binance without paying excessive slippage fees.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Order Types Demystified:</strong> Difference between Market, Limit, and Stop-Loss orders.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Wallet & Account Security:</strong> 2FA setup, phishing defense, hardware cold storage vs exchange custody.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>The 1% Risk Management Protocol:</strong> Exact mathematical formula to calculate position size for every trade.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1d1f2e] flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('beginner')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>View Beginner Videos ({beginnerLessons.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {!hasBeginnerAccess && !isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenPayment ? onOpenPayment('beginner') : onNavigate('beginner')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#10a37f] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enroll (${beginnerPrice} USD)</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Advance Quant VIP Course */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0f1019] border border-[#23253b] hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                  ADVANCE VIP TRACK
                </span>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    ${advancedPrice}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 ml-1">USD</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Advance Quantitative VIP Masterclass
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Institutional order flow mechanics, Cumulative Volume Delta (CVD), perpetual futures leverage, and live desk access for seasoned traders.
                </p>
              </div>

              {/* What will be taught inside */}
              <div className="space-y-2 pt-2 border-t border-[#1d1f2e]">
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-bold block">
                  Topics Taught in This Course:
                </span>
                <ul className="space-y-2 text-xs text-neutral-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Order Flow & CVD (Cumulative Volume Delta):</strong> Spot delta absorption and aggressive limit order walls.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Perpetual Futures Leverage:</strong> Safe leverage scaling (5x - 20x), Cross vs Isolated margin, and funding rate arbitrage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Liquidation Heatmaps:</strong> Identify retail stop-hunt clusters and institutional trap reversals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Anchored VWAP Confluences:</strong> Volume-weighted average price anchors across weekly/monthly market cycles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>Live Execution Floor & VIP Signals:</strong> Real-time streaming desk access and institutional trade setups.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1d1f2e] flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('advanced')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>View Advance Videos ({advancedLessons.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {!hasAdvancedAccess && !isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenPayment ? onOpenPayment('advanced') : onNavigate('advanced')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock VIP (${advancedPrice} USD)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY TRADING CONCEPTS: SPOT VS FUTURES & RISK MANAGEMENT */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0f101a] border border-[#23253b] shadow-xl space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
            TRADING CONCEPTS & MECHANICS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            Essential Market Knowledge Every Trader Must Know
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Understand the key differences between trading spot assets and derivative contracts, and master the mathematical principles of risk control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Concept 1: Spot vs Futures */}
          <div className="p-5 rounded-2xl bg-[#141524] border border-[#24263b] space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <Layers className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Spot Trading vs. Futures Trading
              </h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              <strong>Spot Trading:</strong> You buy the actual underlying crypto asset (e.g., BTC, ETH). You own it directly in your wallet. If the price drops, your asset cannot be liquidated. You can hold through cycles with zero expiration date or funding fees.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              <strong>Futures Trading:</strong> You trade derivative contracts with leverage (e.g. 5x to 20x). You can profit in both bull markets (LONG) and bear markets (SHORT). However, leverage introduces a liquidation price, requiring strict stop-loss orders.
            </p>
          </div>

          {/* Concept 2: Risk Management & The 1% Rule */}
          <div className="p-5 rounded-2xl bg-[#141524] border border-[#24263b] space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                The Non-Negotiable 1% Risk Rule
              </h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              <strong>Capital Preservation First:</strong> Professional traders never risk more than 1% to 2% of their total account on any single trade setup. If your portfolio is $10,000, your maximum stop-loss risk is strictly $100.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              <strong>The Math of Drawdowns:</strong> If you lose 50% of your account, you need a 100% gain just to break even! By risking only 1% per trade, a series of 5 losing trades only draws down 5%, keeping your psychology and trading account completely safe.
            </p>
          </div>
        </div>
      </section>

      {/* 5. COMMUNITY LECTURE & ASSET DEMAND VOTING PORTAL */}
      <CommunityDemandPortal
        onNavigate={onNavigate}
        onOpenLiveClass={() => onNavigate('live')}
      />

      {/* 6. DIRECT PLATFORM NAVIGATION SECTIONS */}
      <section className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
          Explore Academy Modules & Live Desk
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Beginner Section Link */}
          <div
            onClick={() => onNavigate('beginner')}
            className="p-5 rounded-2xl bg-[#0f1019] border border-[#23253b] hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">Beginner Videos</h4>
                <p className="text-xs text-neutral-400">{beginnerLessons.length} Uploaded Lessons</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Advance Section Link */}
          <div
            onClick={() => onNavigate('advanced')}
            className="p-5 rounded-2xl bg-[#0f1019] border border-[#23253b] hover:border-purple-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300">Advance VIP Videos</h4>
                <p className="text-xs text-neutral-400">{advancedLessons.length} Uploaded Modules</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Signals Section Link (Opens Spot & Futures Desk) */}
          <div
            onClick={() => onNavigate('signals')}
            className="p-5 rounded-2xl bg-[#0f1019] border border-[#23253b] hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">Spot & Futures Signals</h4>
                <p className="text-xs text-neutral-400">{spotSignals.length} Spot • {futuresSignals.length} Futures</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </section>
    </div>
  );
};
