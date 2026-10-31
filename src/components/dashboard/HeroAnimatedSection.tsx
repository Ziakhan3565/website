import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Activity,
  Flame,
  Radio,
  ExternalLink,
  ChevronRight,
  Eye,
  Users
} from 'lucide-react';

interface HeroAnimatedSectionProps {
  onNavigate: (view: string) => void;
  beginnerLessonsCount: number;
  advancedLessonsCount: number;
  activeSignalsCount: number;
  beginnerPrice?: number;
  advancedPrice?: number;
  onScrollToExchanges?: () => void;
}

const ROTATING_TITLES = [
  {
    author: 'ZIA KHAN',
    subtitle: 'Founder & Chief Trading Mentor',
    headline: 'Master Institutional SMC & Order Flow Trading',
    badge: 'LEAD INSTRUCTOR & ANALYST',
    color: 'from-cyan-400 via-teal-300 to-emerald-400',
  },
  {
    author: 'LEARN AND GROW',
    subtitle: 'Official Crypto Trading Academy',
    headline: 'From Absolute Beginner to Profitable Market Specialist',
    badge: 'VERIFIED CRYPTO ACADEMY',
    color: 'from-emerald-400 via-cyan-300 to-teal-400',
  },
  {
    author: 'ZIA KHAN × LEARN AND GROW',
    subtitle: 'Smart Money Trading & Real-Time Signals',
    headline: 'Trade Alongside Institutional Liquidity & Zero Guesswork',
    badge: 'OFFICIAL PLATFORM',
    color: 'from-teal-300 via-cyan-400 to-sky-400',
  },
];

export const HeroAnimatedSection: React.FC<HeroAnimatedSectionProps> = ({
  onNavigate,
  beginnerLessonsCount,
  advancedLessonsCount,
  activeSignalsCount,
  beginnerPrice = 2,
  advancedPrice = 5,
  onScrollToExchanges,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [pulseLive, setPulseLive] = useState(true);

  // Auto-rotate hero branding animation every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % ROTATING_TITLES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Heartbeat pulse for mentor online status
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setPulseLive((prev) => !prev);
    }, 1800);
    return () => clearInterval(pulseTimer);
  }, []);

  const current = ROTATING_TITLES[activeIdx];

  return (
    <section className="relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-10 border border-cyan-500/40 bg-gradient-to-br from-[#0a1220]/95 via-[#070d17]/95 to-[#04070d]/95 shadow-[0_0_50px_-10px_rgba(6,182,212,0.25)] backdrop-blur-2xl transition-all duration-700">
      {/* Animated ambient background orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-bl from-cyan-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Grid line pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      <div className="relative z-10 space-y-6 max-w-5xl">
        {/* Top Floating Badge Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Animated Mentor Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold shadow-sm shadow-cyan-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${pulseLive ? 'scale-125' : 'scale-100'}`} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span>ZIA KHAN · OFFICIAL ACADEMY</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] font-mono text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{current.badge}</span>
            </div>
          </div>

          {/* Quick Indicator: 300+ Active Students & Tickers */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-bold">300+ Students</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">98.4% Win Rate</span>
          </div>
        </div>

        {/* Dynamic Animated Name & Brand Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              {current.subtitle}
            </span>
          </div>

          {/* Animated Big Shimmering Name: ZIA KHAN / LEARN AND GROW */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            <span className="block text-slate-400 text-base sm:text-xl font-mono font-semibold tracking-normal mb-1">
              Welcome to the Platform of
            </span>
            <span
              key={current.author}
              className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${current.color} drop-shadow-[0_0_35px_rgba(6,182,212,0.45)] transition-all duration-500 transform hover:scale-[1.01]`}
            >
              {current.author}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-medium max-w-3xl leading-relaxed">
            {current.headline} — Learn professional trading mechanics, order flow absorption, and live execution directly on world-class crypto exchanges.
          </p>
        </div>

        {/* Quick Interactive Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-[#09111e]/90 border border-cyan-500/30 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">Beginner Track</span>
              <GraduationCap className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-lg font-black text-white font-mono mt-1 block">${beginnerPrice} USD</span>
            <span className="text-[10px] text-cyan-300 font-mono block">{beginnerLessonsCount} Video Lessons</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#09111e]/90 border border-teal-500/30 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">Advance VIP Track</span>
              <Zap className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-lg font-black text-white font-mono mt-1 block">${advancedPrice} USD</span>
            <span className="text-[10px] text-teal-300 font-mono block">{advancedLessonsCount} VIP Modules</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#09111e]/90 border border-emerald-500/30 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">VIP Signals</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-lg font-black text-white font-mono mt-1 block">{activeSignalsCount} Active</span>
            <span className="text-[10px] text-emerald-400 font-mono block">Spot & Futures</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#09111e]/90 border border-blue-500/30 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">Official Partners</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-lg font-black text-white font-mono mt-1 block">MEXC • Binance</span>
            <span className="text-[10px] text-blue-300 font-mono block">Bybit Partner Links</span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Join Exchanges Quick Jump Button */}
          {onScrollToExchanges && (
            <button
              type="button"
              onClick={onScrollToExchanges}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Join Exchanges (MEXC • Binance • Bybit)</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('beginner')}
            className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs font-mono uppercase tracking-wider border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Beginner Academy (${beginnerPrice})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('signals')}
            className="py-3 px-5 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-bold text-xs font-mono uppercase tracking-wider border border-cyan-500/40 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Live Signals</span>
          </button>
        </div>

        {/* Rotating indicator dots */}
        <div className="flex items-center gap-2 pt-1">
          {ROTATING_TITLES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIdx === i ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`Switch to slide ${i + 1}`}
            />
          ))}
          <span className="text-[10px] font-mono text-slate-500 ml-2">
            Auto-animating Zia Khan & Learn and Grow Academy
          </span>
        </div>
      </div>
    </section>
  );
};
