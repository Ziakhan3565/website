import React from 'react';
import {
  Upload,
  CheckCircle2,
  Zap,
  GraduationCap,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Loader2
} from 'lucide-react';

export interface UploadProgressState {
  isOpen: boolean;
  title: string;
  subTitle?: string;
  type: 'video' | 'spot' | 'futures' | 'general';
  percent: number;
  stageText: string;
  isComplete: boolean;
}

interface UploadProgressModalProps {
  state: UploadProgressState;
  onCancel?: () => void;
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({ state }) => {
  if (!state.isOpen) return null;

  const getIcon = () => {
    switch (state.type) {
      case 'video':
        return <Upload className="w-7 h-7 text-emerald-400 animate-bounce" />;
      case 'spot':
        return <TrendingUp className="w-7 h-7 text-emerald-400 animate-pulse" />;
      case 'futures':
        return <Zap className="w-7 h-7 text-purple-400 animate-pulse" />;
      default:
        return <Sparkles className="w-7 h-7 text-cyan-400 animate-spin" />;
    }
  };

  const getColorTheme = () => {
    switch (state.type) {
      case 'video':
        return {
          bar: 'from-emerald-500 via-teal-400 to-cyan-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          glow: 'shadow-emerald-500/20',
        };
      case 'futures':
        return {
          bar: 'from-purple-600 via-indigo-500 to-pink-500',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          glow: 'shadow-purple-500/20',
        };
      default:
        return {
          bar: 'from-cyan-500 via-blue-500 to-emerald-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          glow: 'shadow-cyan-500/20',
        };
    }
  };

  const theme = getColorTheme();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#10121c] border border-[#2b2e46] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center">
        {/* Glow ambient background inside modal */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Status Badge */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#171928] border border-[#2d3049] flex items-center justify-center shadow-inner relative">
            {state.isComplete ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in-75 duration-200" />
            ) : (
              getIcon()
            )}
          </div>
          {state.isComplete && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-white tracking-tight">
          {state.title}
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
          {state.subTitle || 'Synchronizing with high-speed student network and database...'}
        </p>

        {/* Big Percentage Display */}
        <div className="my-5 flex items-baseline justify-center gap-1">
          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
            {Math.min(100, Math.max(0, Math.round(state.percent)))}
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400">%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="w-full h-3 rounded-full bg-[#171927] border border-[#26283d] overflow-hidden p-0.5 relative">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${theme.bar} transition-all duration-300 ease-out shadow-lg ${theme.glow}`}
              style={{ width: `${Math.min(100, Math.max(0, state.percent))}%` }}
            />
          </div>

          {/* Current Stage Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono px-1">
            <span className="flex items-center gap-1.5 text-neutral-300 truncate max-w-[280px]">
              {state.isComplete ? (
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              )}
              <span className="truncate">{state.stageText}</span>
            </span>
            <span className="text-neutral-500 font-bold shrink-0">
              {state.percent >= 100 ? 'DONE' : `${Math.round(state.percent)}/100`}
            </span>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="w-full grid grid-cols-4 gap-1.5 mt-5 pt-4 border-t border-[#1e2030] text-[10px] font-mono">
          <div className={`p-1.5 rounded-lg border text-center ${state.percent >= 25 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-[#151724] border-[#222538] text-neutral-500'}`}>
            <span>1. Validate</span>
          </div>
          <div className={`p-1.5 rounded-lg border text-center ${state.percent >= 55 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-[#151724] border-[#222538] text-neutral-500'}`}>
            <span>2. Encode</span>
          </div>
          <div className={`p-1.5 rounded-lg border text-center ${state.percent >= 85 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-[#151724] border-[#222538] text-neutral-500'}`}>
            <span>3. Broadcast</span>
          </div>
          <div className={`p-1.5 rounded-lg border text-center ${state.percent >= 100 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-[#151724] border-[#222538] text-neutral-500'}`}>
            <span>4. Synced</span>
          </div>
        </div>

        {/* Reassurance text */}
        <p className="text-[10px] text-neutral-500 mt-4 font-mono">
          {state.isComplete ? 'Complete! Updating dashboard...' : 'Please keep this window open while processing...'}
        </p>
      </div>
    </div>
  );
};
