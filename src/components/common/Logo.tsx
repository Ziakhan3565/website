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
    sm: { img: 34, title: 'text-sm', sub: 'text-[8px]' },
    md: { img: 42, title: 'text-base sm:text-lg', sub: 'text-[9px] sm:text-[10px]' },
    lg: { img: 54, title: 'text-xl sm:text-2xl', sub: 'text-[10px] sm:text-[11px]' },
    xl: { img: 72, title: 'text-2xl sm:text-3xl', sub: 'text-xs' },
  }[size];

  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 select-none group cursor-pointer relative ${className}`}
      title="Learn and Grow"
    >
      {/* Official Gold Monogram Emblem Container */}
      <div
        className={`relative shrink-0 rounded-2xl p-0.5 transition-all duration-300 ${
          isLive
            ? 'bg-gradient-to-br from-rose-500 via-amber-400 to-red-600 shadow-xl shadow-rose-500/40 animate-pulse'
            : 'bg-gradient-to-br from-[#ffd700] via-[#f59e0b] to-[#b45309] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 group-hover:scale-105'
        }`}
        style={{ width: dimensions.img, height: dimensions.img }}
      >
        <div className="w-full h-full rounded-[14px] overflow-hidden bg-black flex items-center justify-center border border-amber-400/40">
          <img
            src="/logo.png"
            alt="Learn and Grow Logo"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to stylized gold LG monogram if image loading is delayed
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Pulsing Live indicator badge on the Logo emblem */}
        {isLive && (
          <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 border border-white/40 text-white font-mono font-black text-[8px] uppercase tracking-wider shadow-lg flex items-center gap-1 z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>LIVE</span>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-none uppercase font-serif bg-gradient-to-r from-[#fffbeb] via-[#fcd34d] to-[#d97706] bg-clip-text text-transparent group-hover:brightness-110 transition-all text-xs sm:text-base ${dimensions.title}`}
              style={{ fontFamily: "'Cinzel', serif, system-ui" }}
            >
              Learn and Grow
            </span>
            {isLive && (
              <span className="px-1.5 py-0.5 rounded bg-rose-600/80 text-[8px] sm:text-[9px] font-mono font-black text-white border border-rose-400/40 animate-pulse uppercase shrink-0">
                ON AIR
              </span>
            )}
          </div>

          {showTagline && (
            <div className="hidden xs:flex sm:flex items-center gap-1 mt-0.5">
              <span className={`font-mono uppercase font-bold text-amber-300/80 tracking-widest leading-none text-[8px] sm:text-[9px] ${dimensions.sub}`}>
                Trading • Education • Success
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
