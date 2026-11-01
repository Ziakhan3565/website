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
  const [imgFailed, setImgFailed] = React.useState(false);

  const dimensions = {
    sm: { box: 36, title: 'text-sm', sub: 'text-[8px]' },
    md: { box: 46, title: 'text-base sm:text-lg', sub: 'text-[9px] sm:text-[10px]' },
    lg: { box: 60, title: 'text-xl sm:text-2xl', sub: 'text-[10px] sm:text-[11px]' },
    xl: { box: 80, title: 'text-2xl sm:text-3xl', sub: 'text-xs' },
  }[size];

  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3.5 select-none group cursor-pointer relative ${className}`}
      title="Learn and Grow - Official Trading Academy"
    >
      {/* 
        Side Area: Pure White Container with subtle modern elevation
        Center: The official Learn and Grow emblem ("L" with candlesticks and arrow)
      */}
      <div
        className={`relative shrink-0 rounded-2xl p-1 bg-white shadow-md shadow-black/10 ring-1 ring-slate-200/90 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/20 ${
          isLive ? 'ring-2 ring-rose-500 animate-pulse' : ''
        }`}
        style={{ width: dimensions.box, height: dimensions.box }}
      >
        <div className="w-full h-full rounded-[11px] overflow-hidden bg-white flex items-center justify-center relative">
          {!imgFailed ? (
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_9.11.16_PM_3e22bda3.jpeg"
              alt="Learn and Grow Logo"
              className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center rounded-[10px] bg-white text-slate-900 font-serif font-black text-lg">
              L
            </div>
          )}
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
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif, system-ui" }}
            >
              <span className="text-slate-900">Learn </span>
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                and Grow
              </span>
            </span>
            {isLive && (
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-[8px] sm:text-[9px] font-mono font-black text-white uppercase shrink-0">
                ON AIR
              </span>
            )}
          </div>

          {showTagline && (
            <div className="hidden xs:flex sm:flex items-center gap-1.5 mt-1">
              <span className={`font-mono uppercase font-bold text-slate-500 tracking-wider leading-none text-[8px] sm:text-[9px] flex items-center gap-1 ${dimensions.sub}`}>
                <span>— LEARN • TRADE • INVEST • GROW —</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
