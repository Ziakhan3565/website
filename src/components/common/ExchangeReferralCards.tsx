import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Gift
} from 'lucide-react';
import type { ExchangeReferral } from '../../types/index.ts';
import { api } from '../../services/api.ts';

// Official Vector Logo: Binance
const BinanceLogo: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <div className={`${className} rounded-2xl bg-[#F0B90B] flex items-center justify-center p-2 shadow-lg shrink-0`}>
    <svg viewBox="0 0 120 120" className="w-full h-full fill-[#181A20]" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 22 L75 37 L67.5 44.5 L60 37 L52.5 44.5 L45 37 Z" />
      <path d="M28 53 L43 38 L50.5 45.5 L35.5 60.5 Z" />
      <path d="M92 53 L77 38 L69.5 45.5 L84.5 60.5 Z" />
      <path d="M28 67 L35.5 59.5 L50.5 74.5 L43 82 Z" />
      <path d="M92 67 L84.5 59.5 L69.5 74.5 L77 82 Z" />
      <path d="M60 98 L45 83 L52.5 75.5 L60 83 L67.5 75.5 L75 83 Z" />
      <path d="M60 48 L72 60 L60 72 L48 60 Z" />
    </svg>
  </div>
);

// Official Vector Logo: Bybit
const BybitLogo: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <div className={`${className} rounded-2xl bg-[#12161F] border border-amber-500/30 flex items-center justify-center p-2 shadow-lg shrink-0`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 25 h26 c10 0 17 5 17 14 c0 6 -4 10 -9 12 c7 2 12 8 12 16 c0 10 -8 16 -19 16 h-27 z M34 35 v14 h14 c4 0 7 -2 7 -7 c0 -4 -3 -7 -7 -7 z M34 57 v18 h16 c5 0 8 -3 8 -9 c0 -6 -3 -9 -8 -9 z" fill="#FFFFFF" />
      <path d="M72 25 h12 v40 h-12 z" fill="#F7A600" />
      <circle cx="78" cy="77" r="6" fill="#F7A600" />
    </svg>
  </div>
);

// Official Vector Logo: MEXC Global
const MexcLogo: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <div className={`${className} rounded-2xl bg-[#08182B] border border-cyan-500/30 flex items-center justify-center p-2 shadow-lg shrink-0`}>
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 75 L38 25 L50 50 L40 75 Z" fill="#00D2FF" />
      <path d="M84 75 L62 25 L50 50 L60 75 Z" fill="#1E88E5" />
      <path d="M38 75 L50 48 L62 75 Z" fill="#00E5FF" opacity="0.95" />
      <circle cx="50" cy="62" r="4.5" fill="#FFFFFF" />
    </svg>
  </div>
);

interface ExchangeReferralCardsProps {
  exchanges?: ExchangeReferral[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ExchangeReferralCards: React.FC<ExchangeReferralCardsProps> = ({
  exchanges = [],
  className = '',
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter only active exchanges (the ones ticked in Admin Panel: "جس کو بھی میں ٹک لگاؤں")
  const activeExchanges = exchanges.filter((e) => e.active);

  if (activeExchanges.length === 0) return null;

  const handleCopyCode = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleOpenReferral = async (exchange: ExchangeReferral) => {
    try {
      api.trackExchangeClick(exchange.id).catch(() => {});
    } catch {
      // non-blocking
    }
    window.open(exchange.referralUrl, '_blank', 'noopener,noreferrer');
  };

  const getExchangeVisuals = (exchange: ExchangeReferral) => {
    const key = (exchange.exchangeKey || '').toLowerCase();
    const name = (exchange.name || '').toLowerCase();

    if (key === 'binance' || name.includes('binance')) {
      return {
        gradient: 'from-[#2a220c] via-[#1b1507] to-[#100d05]',
        borderColor: 'border-amber-500/50 hover:border-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        btnGradient: 'from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-black shadow-amber-500/30',
        codeBox: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
        logoComponent: <BinanceLogo className="w-12 h-12" />,
      };
    }

    if (key === 'bybit' || name.includes('bybit')) {
      return {
        gradient: 'from-[#26190d] via-[#1a1108] to-[#0e0904]',
        borderColor: 'border-orange-500/50 hover:border-orange-400',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        btnGradient: 'from-orange-500 via-amber-400 to-yellow-500 hover:opacity-95 text-slate-950 font-black shadow-orange-500/30',
        codeBox: 'bg-orange-950/70 border-orange-500/50 text-orange-300',
        logoComponent: <BybitLogo className="w-12 h-12" />,
      };
    }

    // Default to MEXC
    return {
      gradient: 'from-[#0b253a] via-[#091b2c] to-[#06121d]',
      borderColor: 'border-cyan-500/50 hover:border-cyan-400',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      btnGradient: 'from-cyan-500 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 font-black shadow-cyan-500/30',
      codeBox: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300',
      logoComponent: <MexcLogo className="w-12 h-12" />,
    };
  };

  return (
    <section className={`space-y-4 ${className}`}>
      {/* 
        🎁 Sign Up Today & Grab Your FREE $10 Bonus!
        (As specifically requested: "oor sath hi is ka upar likhu 🎁 Sign Up Today & Grab Your FREE $10 Bonus!")
      */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-cyan-500/15 border border-amber-400/40 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-xl shrink-0 shadow-md">
            🎁
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>🎁 Sign Up Today &amp; Grab Your FREE $10 Bonus!</span>
            </h3>
            <p className="text-xs text-amber-200/90 mt-0.5">
              Create your official account on MEXC, Binance, or Bybit using our partner links below to claim your free $10 reward instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 1 col on Mobile, 2 cols on Tablet, 3 cols on Laptop/Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeExchanges.map((exchange) => {
          const visuals = getExchangeVisuals(exchange);
          const isCopied = copiedCodeId === exchange.id;

          return (
            <div
              key={exchange.id}
              className={`group relative rounded-3xl p-5 bg-gradient-to-br ${visuals.gradient} border ${visuals.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between`}
            >
              <div>
                {/* Top Row: Official Exchange SVG Logo & Name */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Official Vector Logo */}
                    <div className="shrink-0 transition-transform group-hover:scale-105">
                      {visuals.logoComponent}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                        <span>{exchange.name}</span>
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                        ✓ FREE $10 Bonus Included
                      </span>
                    </div>
                  </div>

                  {exchange.badge && (
                    <span
                      className={`text-[9px] font-mono font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${visuals.badgeBg}`}
                    >
                      {exchange.badge}
                    </span>
                  )}
                </div>

                {/* 
                  BRACKETED REFERRAL CODE SECTION
                  Displays [ Code: {exchange.referralCode} ] with 1-click copy
                */}
                <div className="mb-4 p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                      Referral Code
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">
                      [ In Brackets ]
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex-1 px-3 py-2 rounded-xl border font-mono font-extrabold text-xs sm:text-sm tracking-wider text-center select-all shadow-sm ${visuals.codeBox}`}
                    >
                      [ Code: {exchange.referralCode} ]
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(exchange.id, exchange.referralCode, e)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isCopied
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-white/10 hover:bg-white/20 text-white border-white/20 active:scale-95'
                      }`}
                      title="Copy Referral Code"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct CTA Button: 1-Click to Open Exchange Registration Page */}
              <button
                type="button"
                onClick={() => handleOpenReferral(exchange)}
                className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r ${visuals.btnGradient} shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer font-black`}
              >
                <span>Create {exchange.name} Account ($10 Bonus)</span>
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
