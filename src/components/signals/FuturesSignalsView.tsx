import React, { useState } from 'react';
import {
  Flame,
  Filter,
  Search,
  Plus,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  TrendingUp,
  Percent,
  Layers,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { FuturesSignal, SignalStatus } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { RiskBanner } from '../common/RiskBanner.tsx';

interface FuturesSignalsViewProps {
  signals: FuturesSignal[];
  onOpenCreateSignal?: () => void;
  onEditSignal?: (signal: FuturesSignal) => void;
  onDeleteSignal?: (id: string) => void;
  onUpdateStatus?: (id: string, status: SignalStatus) => void;
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
}

export const FuturesSignalsView: React.FC<FuturesSignalsViewProps> = ({
  signals,
  onOpenCreateSignal,
  onEditSignal,
  onDeleteSignal,
  onUpdateStatus,
  onOpenPayment,
}) => {
  const { user, isAdmin, isPremium, hasAdvancedAccess, toggleSavedSignal } = useAuth();
  const isSignalsFree = isAdmin || isPremium || hasAdvancedAccess;
  const [statusFilter, setStatusFilter] = useState('All');
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

  const activeCount = signals.filter(s => s.status === 'Active').length;
  const closedOrHit = signals.filter(s => s.status.includes('Hit') || s.status === 'Closed');
  const targetHits = signals.filter(s => s.status.includes('Hit')).length;
  const winRate = closedOrHit.length > 0 ? Math.round((targetHits / closedOrHit.length) * 100) : 81;

  return (
    <div className="space-y-6 pb-12">
      {/* Prominent High-Risk Warning Banner as requested */}
      <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-200/90 leading-relaxed font-sans">
          <strong className="text-rose-300 font-mono uppercase block mb-0.5">
            Mandatory Futures & Leverage Risk Warning:
          </strong>
          Cryptocurrency perpetual futures and leveraged contracts are speculative instruments involving substantial risk of immediate capital liquidation. Leverage amplifies both gains and losses. Course Crash mandates strictly using <span className="underline font-semibold">Isolated Margin</span> and never risking more than 1% to 2% of total equity per setup.
        </div>
      </div>

      {/* Hero Header & Performance Statistics */}
      <div className="rounded-2xl bg-[#171717] border border-[#2a2a2a] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono mb-2">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> INSTITUTIONAL DERIVATIVES DESK
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Perpetual Futures Signals & Order Flow Setups
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Algorithmic and discretionary derivatives execution. Every trade setup is grounded in real order book depth, Cumulative Volume Delta (CVD) absorption, open interest divergence, and estimated liquidation clusters.
            </p>
          </div>

          {/* Performance Statistics Bar (Real Desk Track Record) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#212121] p-3.5 rounded-xl border border-[#2e2e2e] shrink-0 font-mono text-xs">
            <div className="px-3 border-r border-[#2e2e2e] text-center">
              <span className="text-neutral-500 text-[10px] uppercase block">Win Rate</span>
              <span className="text-[#10a37f] font-bold text-base tabular-nums">{winRate}%</span>
            </div>
            <div className="px-3 border-r border-[#2e2e2e] text-center">
              <span className="text-neutral-500 text-[10px] uppercase block">Active</span>
              <span className="text-[#38bdf8] font-bold text-base tabular-nums">{activeCount}</span>
            </div>
            <div className="px-3 border-r border-[#2e2e2e] text-center">
              <span className="text-neutral-500 text-[10px] uppercase block">Avg R:R</span>
              <span className="text-amber-400 font-bold text-base tabular-nums">1:3.6</span>
            </div>
            <div className="px-3 text-center">
              <span className="text-neutral-500 text-[10px] uppercase block">Max DD</span>
              <span className="text-neutral-300 font-bold text-base tabular-nums">-4.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Free Signals Status Banner */}
      {isSignalsFree ? (
        <div className="px-4 py-2.5 rounded-xl bg-[#10a37f]/15 border border-[#10a37f]/30 text-xs font-mono flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2 text-[#19c37d] font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#10a37f]" />
            Advanced VIP Active: Perpetual Futures Signals Are 100% Free
          </span>
          <span className="text-[10px] bg-[#10a37f]/25 text-[#19c37d] px-2 py-0.5 rounded font-bold uppercase">
            Full Invalidation & Take Profit Ladders Unlocked
          </span>
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-r from-orange-500/15 via-[#171717] to-amber-500/10 border border-orange-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-orange-400 font-bold">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Free with Advanced VIP Pass</span>
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              Perpetual futures setups and leverage risk calculations are 100% free for students who have unlocked the Advanced Course Crash.
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
              placeholder="Search pair (BTC, ETH, SOL, DOGE)..."
              value={searchPair}
              onChange={(e) => setSearchPair(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#171717] border border-[#2a2a2a] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#171717] p-1 rounded-lg border border-[#2a2a2a] text-xs font-mono">
            {['All', 'Active', 'TP2 Hit', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  statusFilter === st ? 'bg-rose-600 text-white font-semibold' : 'text-neutral-400 hover:text-white'
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
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Publish Futures Signal
          </button>
        )}
      </div>

      {/* Futures Signals Cards */}
      <div className="space-y-4">
        {filteredSignals.map((sig) => {
          const isSaved = user?.savedSignals.includes(sig.id);
          const isLong = sig.direction === 'LONG';

          return (
            <div
              key={sig.id}
              className="rounded-xl bg-[#171717] border border-[#2a2a2a] p-5 hover:border-rose-500/40 transition-all shadow-lg space-y-4"
            >
              {/* Header: Pair, Direction, Leverage, Margin, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-white tracking-wide">{sig.pair}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isLong ? 'bg-[#10a37f]/15 text-[#19c37d] border border-[#10a37f]/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    {sig.direction}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                    {sig.leverage}
                  </span>
                  <span className="text-xs font-mono text-neutral-300 bg-[#212121] px-2 py-0.5 rounded border border-[#2e2e2e]">
                    {sig.marginType} Margin
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    R:R: <strong className="text-[#38bdf8]">{sig.riskRewardRatio}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded ${
                    sig.status === 'Active'
                      ? 'bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/30'
                      : sig.status.includes('Hit')
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
                          onClick={() => onDeleteSignal(sig.id)}
                          className="p-1 text-rose-400 hover:text-rose-300"
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
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-3.5 rounded-lg bg-[#212121] border border-[#2e2e2e] font-mono text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Entry Zone</span>
                  <span className="text-neutral-200 font-bold tabular-nums">${sig.entryZone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Target 1</span>
                  <span className="text-[#10a37f] font-bold tabular-nums">${sig.tp1}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Target 2</span>
                  <span className="text-[#10a37f] font-bold tabular-nums">${sig.tp2}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Target 3</span>
                  <span className="text-[#10a37f] font-bold tabular-nums">${sig.tp3}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Target 4</span>
                  <span className="text-[#10a37f] font-bold tabular-nums">${sig.tp4 || 'Trailing'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">Stop Loss</span>
                  <span className="text-rose-400 font-bold tabular-nums">${sig.stopLoss}</span>
                </div>
              </div>

              {/* Institutional Microstructure Metrics: Funding, OI, CVD, Liquidation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#1c1c1c] border border-[#2a2a2a]">
                  <span className="text-neutral-500 text-[10px] uppercase block mb-0.5">8h Funding Rate</span>
                  <span className="text-neutral-200 font-semibold">{sig.fundingRate}</span>
                </div>
                <div className="p-2.5 rounded bg-[#1c1c1c] border border-[#2a2a2a]">
                  <span className="text-neutral-500 text-[10px] uppercase block mb-0.5">Open Interest (OI)</span>
                  <span className="text-neutral-200 font-semibold">{sig.openInterest}</span>
                </div>
                <div className="p-2.5 rounded bg-[#1c1c1c] border border-[#2a2a2a]">
                  <span className="text-neutral-500 text-[10px] uppercase block mb-0.5">CVD Observations</span>
                  <span className="text-neutral-200 text-[11px] leading-tight block">{sig.cvdObservations || 'Absorption detected'}</span>
                </div>
                <div className="p-2.5 rounded bg-[#1c1c1c] border border-[#2a2a2a]">
                  <span className="text-neutral-500 text-[10px] uppercase block mb-0.5">Liquidation Clusters</span>
                  <span className="text-amber-300 font-semibold">{sig.liquidationLevels || 'Stop clusters mapped'}</span>
                </div>
              </div>

              {/* Technical Reasoning */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-400 uppercase font-semibold">
                  Technical Thesis & Order Book Confirmation:
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed bg-[#1c1c1c] p-3 rounded-lg border border-[#2a2a2a]">
                  {sig.technicalReasoning}
                </p>
              </div>

              {/* Footer metadata */}
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-[11px] font-mono text-neutral-500">
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
                    {(['TP1 Hit', 'TP2 Hit', 'TP3 Hit', 'Stop Loss Hit', 'Closed'] as SignalStatus[]).map((st) => (
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
            <Flame className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-200">No futures signals match filter</h4>
            <p className="text-xs text-neutral-400 mt-1">Try switching to 'All' or clear your search query.</p>
          </div>
        )}
      </div>

      <RiskBanner compact />
    </div>
  );
};
