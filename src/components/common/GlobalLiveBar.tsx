import React from 'react';
import { Radio, Users, ArrowRight, Video, Sparkles, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { LiveClass } from '../../types/index.ts';

interface GlobalLiveBarProps {
  activeLiveClass?: LiveClass | null;
  onNavigateToLive: () => void;
  className?: string;
}

export const GlobalLiveBar: React.FC<GlobalLiveBarProps> = ({
  activeLiveClass,
  onNavigateToLive,
  className = '',
}) => {
  const [isMinimized, setIsMinimized] = React.useState(false);

  if (!activeLiveClass) return null;

  return (
    <aside
      aria-label="Live Broadcast Alert"
      className={`relative z-40 bg-gradient-to-r from-[#1c1208] via-[#120a06] to-[#1c1208] border-b border-amber-500/40 px-3 sm:px-6 py-2 shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Background ambient red/amber glow */}
      <div className="absolute top-0 left-1/4 w-96 h-full bg-red-600/10 blur-xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-full bg-amber-500/10 blur-xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left: Pulsing Red Indicator + Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono font-black text-[10px] tracking-wider uppercase shrink-0">
            <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>LIVE NOW</span>
          </div>

          {!isMinimized && (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-white truncate">
                <span className="text-amber-300 font-semibold">{activeLiveClass.instructorName || 'Zia Khan'}: </span>
                {activeLiveClass.title}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 shrink-0">
                <Users className="w-3 h-3 text-amber-400" />
                <span>{activeLiveClass.attendees?.length || 142} attending</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: 1-Click Join Button & Minimize */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNavigateToLive}
            className="px-2.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-black font-black text-[11px] sm:text-xs shadow-md shadow-amber-500/30 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
          >
            <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Join Live<span className="hidden sm:inline"> Stream</span></span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={isMinimized ? 'Expand notification' : 'Minimize notification'}
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
