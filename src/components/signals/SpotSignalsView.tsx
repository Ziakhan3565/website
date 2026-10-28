import React, { useState } from 'react';
import {
  Zap,
  Filter,
  Search,
  Plus,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Info,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { SpotSignal, SignalStatus } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { RiskBanner } from '../common/RiskBanner.tsx';

interface SpotSignalsViewProps {
  signals: SpotSignal[];
  onOpenCreateSignal?: () => void;
  onEditSignal?: (signal: SpotSignal) => void;
  onDeleteSignal?: (id: string) => void;
  onUpdateStatus?: (id: string, status: SignalStatus) => void;
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
}

export const SpotSignalsView: React.FC<SpotSignalsViewProps> = ({
  signals,
  onOpenCreateSignal,
  onEditSignal,
  onDeleteSignal,
  onUpdateStatus,
  onOpenPayment,
}) => {
  const { user, isAdmin, isPremium, hasAdvancedAccess, toggleSavedSignal } = useAuth();
  const isSignalsFree = isAdmin || isPremium || hasAdvancedAccess;
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchPair, setSearchPair] = useState('');

  const filteredSignals = signals.filter((s) => {
    const matchesPair = s.pair.toLowerCase().includes(searchPair.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ? true :
      statusFilter === 'Active' ? s.status === 'Active' :
      statusFilter === 'Closed' ? (s.status === 'Closed' || s.status === 'Stop Loss Hit') :
      s.status.includes(statusFilter);
    return matchesPair && matchesStatus;
  });

  // Calculate metrics
  const activeCount = signals.filter(s => s.status === 'Active').length;
  const targetHitCount = signals.filter(s => s.status.includes('Target')).length;
  const closedCount = signals.filter(s => s.status === 'Closed' || s.status === 'Stop Loss Hit').length;
  const totalClosed = targetHitCount + signals.filter(s => s.status === 'Stop Loss Hit').length;
  const spotWinRate = totalClosed > 0 ? Math.round((targetHitCount / totalClosed) * 100) : 85;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#171717] border border-[#2a2a2a] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> INSTITUTIONAL SPOT DESK
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Spot Trading Signals & Position Setups
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Official asset accumulation setups published directly by the Learn and Grow Trading Desk. Every signal includes verified entry zones, 3 structured take-profit targets, invalidation stop-loss, and multi-timeframe technical reasoning.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 bg-[#212121] p-3.5 rounded-xl border border-[#2e2e2e] shrink-0 text-center font-mono text-xs">
            <div className="px-3 border-r border-[#2e2e2e]">
              <span className="text-neutral-500 text-[10px] uppercase block">Active</span>
              <span className="text-[#38bdf8] font-bold text-base tabular-nums">{activeCount}</span>
            </div>
            <div className="px-3 border-r border-[#2e2e2e]">
              <span className="text-neutral-500 text-[10px] uppercase block">Targets Hit</span>
              <span className="text-[#10a37f] font-bold text-base tabular-nums">{targetHitCount}</span>
            </div>
            <div className="px-3">
              <span className="text-neutral-500 text-[10px] uppercase block">Win Rate</span>
              <span className="text-amber-400 font-bold text-base tabular-nums">{spotWinRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Free Signals Status Banner */}
      {isSignalsFree ? (
        <div className="px-4 py-2.5 rounded-xl bg-[#10a37f]/15 border border-[#10a37f]/30 text-xs font-mono flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2 text-[#19c37d] font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#10a37f]" />
            Advanced VIP Active: All Spot Signals Are 100% Free
          </span>
          <span className="text-[10px] bg-[#10a37f]/25 text-[#19c37d] px-2 py-0.5 rounded font-bold uppercase">
            Full Invalidation & Target Levels Visible
          </span>
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-r from-amber-500/15 via-[#171717] to-amber-500/10 border border-amber-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-amber-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>100% Free with Advanced VIP Pass</span>
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              Enrolling in the Advanced Track automatically unlocks all Spot & Futures trading signals for free with zero recurring subscription fees.
            </p>
          </div>
          <button
            onClick={() => onOpenPayment?.('advanced')}
            className="px-4 py-2 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs font-bold shadow-[0_0_15px_rgba(16,163,127,0.3)] transition-all flex items-center gap-1.5 shrink-0"
          >
            <Lock className="w-3.5 h-3.5" /> Unlock Free Signals ($79) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by pair (BTC, ETH, SOL)..."
              value={searchPair}
              onChange={(e) => setSearchPair(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#171717] border border-[#2a2a2a] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#10a37f]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#171717] p-1 rounded-lg border border-[#2a2a2a] text-xs font-mono">
            {['All', 'Active', 'Target 2 Hit', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  statusFilter === st ? 'bg-[#10a37f] text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {isAdmin && onOpenCreateSignal && (
          <button
            onClick={onOpenCreateSignal}
            className="px-4 py-2 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,163,127,0.3)] transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Publish Spot Signal
          </button>
        )}
      </div>

      {/* Signals Table / Grid */}
      <div className="space-y-4">
        {filteredSignals.map((sig) => {
          const isSaved = user?.savedSignals.includes(sig.id);
          const isBuy = sig.direction === 'BUY';

          return (
            <div
              key={sig.id}
              className="rounded-xl bg-[#171717] border border-[#2a2a2a] p-5 hover:border-[#10a37f]/40 transition-all shadow-lg"
            >
              {/* Header: Pair, Direction, Timeframe, Status, Bookmark */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-white tracking-wide">{sig.pair}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isBuy ? 'bg-[#10a37f]/15 text-[#19c37d] border border-[#10a37f]/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    {sig.direction}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 bg-[#212121] px-2 py-0.5 rounded border border-[#2e2e2e]">
                    TF: {sig.timeframe}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Risk: <strong className={sig.riskLevel === 'Low' ? 'text-[#10a37f]' : sig.riskLevel === 'Medium' ? 'text-amber-400' : 'text-rose-400'}>{sig.riskLevel}</strong>
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    R:R: <strong className="text-[#38bdf8]">{sig.riskRewardRatio}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded ${
                    sig.status === 'Active'
                      ? 'bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/30'
                      : sig.status.includes('Target')
                      ? 'bg-[#10a37f]/15 text-[#19c37d] border border-[#10a37f]/30'
                      : 'bg-[#212121] text-neutral-400'
                  }`}>
                    {sig.status}
                  </span>

                  <button
                    onClick={() => toggleSavedSignal(sig.id)}
                    className="p-1 rounded text-neutral-400 hover:text-amber-400 transition-colors"
                    title={isSaved ? 'Remove Bookmark' : 'Bookmark Signal'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-1 pl-2 border-l border-[#262626]">
                      {onEditSignal && (
                        <button
                          onClick={() => onEditSignal(sig)}
                          className="p-1 text-neutral-400 hover:text-white"
                          title="Edit Signal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteSignal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onDeleteSignal(sig.id);
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onDeleteSignal(sig.id);
                          }}
                          className="p-1 text-rose-400 hover:text-rose-300 active:scale-95 cursor-pointer"
                          title="Delete Signal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Execution Price Targets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4 p-3.5 rounded-lg bg-[#212121] border border-[#2e2e2e] font-mono text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Entry Zone</span>
                  <span className="text-neutral-200 font-bold tabular-nums">${sig.entryZone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Take Profit 1</span>
                  <span className="text-[#10a37f] font-bold tabular-nums">${sig.tp1}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Take Profit 2</span>
                  <span className="text-[#10a37f] font-bold tabular-nums">${sig.tp2}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Take Profit 3</span>
                  <span className="text-[#10a37f] font-bold tabular-nums">${sig.tp3}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Stop Loss</span>
                  <span className="text-rose-400 font-bold tabular-nums">${sig.stopLoss}</span>
                </div>
              </div>

              {/* Technical Reasoning */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">
                  Desk Technical Analysis & Order Flow Reasoning:
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed bg-[#1c1c1c] p-3 rounded-lg border border-[#2a2a2a]">
                  {sig.technicalReasoning}
                </p>
              </div>

              {/* Footer metadata */}
              <div className="mt-3 pt-2 border-t border-[#262626] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <div className="flex items-center gap-3">
                  <span>Published by: <strong className="text-neutral-300">{sig.publishedBy}</strong></span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    {new Date(sig.createdAt).toLocaleDateString()} {new Date(sig.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isAdmin && onUpdateStatus && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400 text-[10px]">Update:</span>
                    {(['Target 1 Hit', 'Target 2 Hit', 'Target 3 Hit', 'Stop Loss Hit', 'Closed'] as SignalStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateStatus(sig.id, st)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#212121] hover:bg-[#2a2a2a] text-neutral-300 border border-[#2e2e2e]"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredSignals.length === 0 && (
          <div className="p-12 text-center bg-[#171717] rounded-xl border border-[#2a2a2a]">
            <Zap className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-200">No spot signals found</h4>
            <p className="text-xs text-neutral-400 mt-1">Try clearing your filters or check back later for new setups.</p>
          </div>
        )}
      </div>

      <RiskBanner compact />
    </div>
  );
};
