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
  Play,
  HelpCircle,
  Share2
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
}) => {
  const { hasBeginnerAccess, hasAdvancedAccess, isAdmin } = useAuth();

  const beginnerPrice = pricing ? pricing.beginnerPrice : 2;
  const advancedPrice = pricing ? pricing.advancedPrice : 5;

  const currentLive = liveClasses.find((c) => c.status === 'live');
  const activeSpot = spotSignals.filter((s) => s.status === 'Active');
  const activeFutures = futuresSignals.filter((s) => s.status === 'Active');

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* 1. HERO SECTION: BRANDING & FINANCIAL MARKETS OVERVIEW */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-10 border border-amber-500/40 bg-gradient-to-br from-[#1a160d]/95 via-[#10111a]/95 to-[#080910]/95 shadow-2xl backdrop-blur-xl">
        {/* Ambient gold glow orbs matching logo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/20 via-yellow-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-600/15 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>LEARN AND GROW · TRADING • EDUCATION • SUCCESS</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
              Official Academy by Zia Khan
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Master Financial Markets with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe58f] via-[#ffd700] to-[#f59e0b]">
              Learn and Grow
            </span>
          </h1>

          {/* Core Financial Market Knowledge */}
          <div className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed bg-black/40 p-5 sm:p-6 rounded-2xl border border-amber-500/20 shadow-inner">
            <p>
              <strong className="text-white">What are Financial Markets?</strong> Financial markets are continuous auction environments where global participants trade capital assets, currencies, commodities, and cryptocurrencies. Prices do not move randomly; they move via supply and demand, order book liquidity, and institutional positioning.
            </p>
            <p className="text-neutral-300">
              <strong className="text-white">How Trading Works:</strong> Retail traders guess directions based on hype, whereas professional traders understand market structure: identifying liquidity pools, order flow absorption (where whale orders get filled), and asymmetric risk-to-reward execution.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#141526]/80 border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Beginner Track</span>
              <span className="text-lg font-black text-amber-400 font-mono">${beginnerPrice} USD</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">{beginnerLessons.length} Video Lessons</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#141526]/80 border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Advance VIP Track</span>
              <span className="text-lg font-black text-amber-300 font-mono">${advancedPrice} USD</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">{advancedLessons.length} Video Modules</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#141526]/80 border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Active Signals</span>
              <span className="text-lg font-black text-white font-mono">{activeSpot.length + activeFutures.length}</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Spot & Futures</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#141526]/80 border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Live Desk</span>
              <span className="text-lg font-black text-rose-400 font-mono">{currentLive ? 'LIVE NOW' : 'Scheduled'}</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Interactive Sessions</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STUDENT PORTAL QUICK DESK (DECLUTTERED & HARMONIZED WITH GOLD ACCENTS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Student Portal Quick Desk</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-400">
            1-Click access to channels and terminals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Beginner Academy */}
          <div
            onClick={() => onNavigate('beginner')}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#131616] via-[#101318] to-[#0a0c10] border border-amber-500/30 hover:border-amber-400 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-black/40 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                {beginnerLessons.length} LESSONS
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Beginner Academy
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Beginner Track · Candlestick patterns, order types & 1% risk rule
            </p>
          </div>

          {/* Card 2: Advanced VIP Academy */}
          <div
            onClick={() => onNavigate('advanced')}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#16131c] via-[#12111a] to-[#0a0a10] border border-amber-500/30 hover:border-amber-400 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-black/40 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <PlayCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                {advancedLessons.length} MODULES
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Advanced VIP Masterclass
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Quantitative SMC · Order flow CVD absorption & liquidation maps
            </p>
          </div>

          {/* Card 3: Spot Signals */}
          <div
            onClick={() => onNavigate('signals')}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#0e141a] via-[#0d1217] to-[#090b0e] border border-amber-500/30 hover:border-amber-400 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-black/40 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                {activeSpot.length} ACTIVE
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Spot Market Signals
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Spot Accumulation · Multi-target exits with zero liquidation risk
            </p>
          </div>

          {/* Card 4: Futures Signals */}
          <div
            onClick={() => onNavigate('signals')}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#18140f] via-[#14100c] to-[#0b0a08] border border-amber-500/30 hover:border-amber-400 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-black/40 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                {activeFutures.length} ACTIVE
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Futures Leverage Signals
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Perpetual Futures · Leverage setups, short pools & funding rates
            </p>
          </div>
        </div>
      </div>

      {/* 4. WHY OUR COURSES ARE THE BEST CHOICE */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0f101a] border border-amber-500/25 shadow-xl space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
            FOUNDATION ADVANTAGE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            Why Learn and Grow is the Best Starting Point
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Most beginners lose capital because they follow signals without understanding chart anatomy, order execution, or risk limits. Here is why our academy is built differently:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#141523] border border-[#26283d] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Zero Prior Knowledge Required</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We start from absolute scratch: explaining what cryptocurrency is, how blockchain works, and how to safely navigate exchanges without costly rookie mistakes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141523] border border-[#26283d] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Pure Video Curriculum</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No endless textbook reading. Every single module is a visual video walkthrough recorded directly on real exchange screens and live TradingView charts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141523] border border-[#26283d] space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Strict Capital Preservation (1% Rule)</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Before teaching you how to make profit, we teach you how to never blow up your account. Strict position sizing formulas keep your funds secure.
            </p>
          </div>
        </div>
      </section>

      {/* 5. DETAILED CURRICULUM PREVIEWS (DECLUTTERED: NO PAYMENT BUTTONS HERE) */}
      <section className="space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
            COURSE SYLLABUS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
            What You Will Learn in Our Courses
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Note: Course enrollment and purchasing is handled solely inside the course sections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Beginner Crash Course */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0f1019] border border-amber-500/25 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
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
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Beginner Cryptocurrency Academy Course
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Fast-track zero-fluff training to take you from foundational mechanics to disciplined execution. Master the core essentials before risking capital.
                </p>
              </div>

              {/* What will be taught inside */}
              <div className="space-y-2 pt-2 border-t border-[#1d1f2e]">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                  Topics Taught in This Course:
                </span>
                <ul className="space-y-2 text-xs text-neutral-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Candlestick Anatomy & Timeframes:</strong> Understand wicks, bodies, trends, and support/resistance zones.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Spot Market Execution:</strong> How to buy and sell on Binance without paying excessive slippage fees.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Order Types Demystified:</strong> Difference between Market, Limit, and Stop-Loss orders.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Wallet & Account Security:</strong> 2FA setup, phishing defense, hardware cold storage vs exchange custody.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>The 1% Risk Management Protocol:</strong> Exact mathematical formula to calculate position size for every trade.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Clean Single Action Target */}
            <div className="pt-4 border-t border-[#1d1f2e]">
              <button
                type="button"
                onClick={() => onNavigate('beginner')}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>View Beginner Curriculum & Videos ({beginnerLessons.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Advance Quant VIP Course */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0f1019] border border-amber-500/25 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
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
                  <Zap className="w-5 h-5 text-amber-400" />
                  Advance Quantitative VIP Masterclass
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Institutional order flow mechanics, Cumulative Volume Delta (CVD), perpetual futures leverage, and live desk access for seasoned traders.
                </p>
              </div>

              {/* What will be taught inside */}
              <div className="space-y-2 pt-2 border-t border-[#1d1f2e]">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                  Topics Taught in This Course:
                </span>
                <ul className="space-y-2 text-xs text-neutral-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Order Flow & CVD (Cumulative Volume Delta):</strong> Spot delta absorption and aggressive limit order walls.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Perpetual Futures Leverage:</strong> Safe leverage scaling (5x - 20x), Cross vs Isolated margin, and funding rate arbitrage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Liquidation Heatmaps:</strong> Identify retail stop-hunt clusters and institutional trap reversals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Anchored VWAP Confluences:</strong> Volume-weighted average price anchors across weekly/monthly market cycles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Live Execution Floor & VIP Signals:</strong> Real-time streaming desk access and institutional trade setups.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Clean Single Action Target */}
            <div className="pt-4 border-t border-[#1d1f2e]">
              <button
                type="button"
                onClick={() => onNavigate('advanced')}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>View Advance VIP Curriculum & Videos ({advancedLessons.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. KEY TRADING CONCEPTS: SPOT VS FUTURES & RISK MANAGEMENT */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0f101a] border border-amber-500/20 shadow-xl space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
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
            <div className="flex items-center gap-2.5 text-amber-400">
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
            <div className="flex items-center gap-2.5 text-amber-400">
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

      {/* 7. COMMUNITY LECTURE & ASSET DEMAND VOTING PORTAL (WHATSAPP/INSTAGRAM STYLE) */}
      <CommunityDemandPortal
        onNavigate={onNavigate}
        onOpenLiveClass={() => onNavigate('live')}
      />
    </div>
  );
};
