import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  isLive?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  className = '',
  isLive = false,
}) => {
  const dimensions = {
    sm: { box: 34, title: 'text-sm', sub: 'text-[8px]' },
    md: { box: 44, title: 'text-base sm:text-lg', sub: 'text-[9px] sm:text-[10px]' },
    lg: { box: 56, title: 'text-xl sm:text-2xl', sub: 'text-[10px] sm:text-[11px]' },
    xl: { box: 74, title: 'text-2xl sm:text-3xl', sub: 'text-xs' },
  }[size];

  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3.5 select-none group cursor-pointer relative ${className}`}
      title="Learn and Grow - Official Trading Academy"
    >
      {/* 
        Side Area: Pure White Container with subtle modern elevation
        Center: Striking Electric Cyan & Growth Emerald Learning Symbol
      */}
      <div
        className={`relative shrink-0 rounded-2xl p-1 bg-white shadow-md shadow-white/10 ring-1 ring-slate-200/80 transition-all duration-300 group-hover:scale-105 group-hover:shadow-cyan-500/20 ${
          isLive ? 'ring-2 ring-rose-500 animate-pulse' : ''
        }`}
        style={{ width: dimensions.box, height: dimensions.box }}
      >
        <div className="w-full h-full rounded-[11px] overflow-hidden bg-white flex items-center justify-center p-0.5 relative">
          <img
            src="/logo.png"
            alt="Learn and Grow Logo"
            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* High-res SVG fallback emblem with suggested Cyan & Emerald learning-growth color */}
          <div className="w-full h-full flex flex-col items-center justify-center rounded-[10px] bg-gradient-to-br from-white to-slate-50">
            <svg
              viewBox="0 0 32 32"
              className="w-full h-full p-0.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="learningGradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0284c7" />
                  <stop offset="0.5" stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="glowCandle" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#00f2fe" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
              {/* Educational graduation cap apex */}
              <path
                d="M16 4L4 10L16 16L28 10L16 4Z"
                fill="url(#learningGradient)"
              />
              <path
                d="M8 12.5V18.5C8 22 11.5 24.5 16 24.5C20.5 24.5 24 22 24 18.5V12.5L16 16.5L8 12.5Z"
                fill="url(#learningGradient)"
                fillOpacity="0.85"
              />
              {/* Upward Trading Growth Arrow & Candlesticks inside */}
              <path
                d="M13 20L16 14L19 20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="28" cy="11.5" r="1.5" fill="#0ea5e9" />
            </svg>
          </div>
        </div>

        {/* Pulsing Live indicator badge on the Logo emblem */}
        {isLive && (
          <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 border border-white text-white font-mono font-black text-[8px] uppercase tracking-wider shadow-lg flex items-center gap-1 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>LIVE</span>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-none uppercase font-serif transition-all text-xs sm:text-base ${dimensions.title}`}
              style={{ fontFamily: "'Cinzel', serif, system-ui" }}
            >
              <span className="text-white drop-shadow-sm">Learn </span>
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                and Grow
              </span>
            </span>
            {isLive && (
              <span className="px-1.5 py-0.5 rounded bg-rose-600/90 text-[8px] sm:text-[9px] font-mono font-black text-white border border-rose-400/40 animate-pulse uppercase shrink-0">
                ON AIR
              </span>
            )}
          </div>

          {showTagline && (
            <div className="hidden xs:flex sm:flex items-center gap-1.5 mt-0.5">
              <span className={`font-mono uppercase font-bold text-cyan-400/90 tracking-widest leading-none text-[8px] sm:text-[9px] flex items-center gap-1 ${dimensions.sub}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Trading • Education • Success</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
