import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Activity,
  AlertTriangle,
  Layers
} from 'lucide-react';
import type { SpotSignal, FuturesSignal, SignalStatus, ExchangeReferral } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { ExchangeReferralCards } from '../common/ExchangeReferralCards.tsx';

interface SignalsSectionViewProps {
  spotSignals: SpotSignal[];
  futuresSignals: FuturesSignal[];
  exchanges?: ExchangeReferral[];
  defaultSection?: 'spot' | 'futures';
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
  pricing?: { beginnerPrice: number; advancedPrice: number };
  onRefreshSignals?: () => void;
}

export const SignalsSectionView: React.FC<SignalsSectionViewProps> = ({
  spotSignals,
  futuresSignals,
  exchanges = [],
  defaultSection = 'spot',
  onOpenPayment,
  pricing,
  onRefreshSignals,
}) => {
  const { user, isAdmin, isPremium, hasAdvancedAccess } = useAuth();
  const canAccessSignals = isAdmin || isPremium || hasAdvancedAccess;
  const advancedPrice = pricing ? pricing.advancedPrice : 5;

  // Clickable two sections: 'spot' or 'futures'
  const [activeTab, setActiveTab] = useState<'spot' | 'futures'>(defaultSection);

  // Quick Signal Create Modals for Admin authority
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [showAddFuturesModal, setShowAddFuturesModal] = useState(false);

  // Spot form state
  const [spotForm, setSpotForm] = useState<Partial<SpotSignal>>({
    pair: 'BTC/USDT',
    direction: 'BUY',
    entryZone: '65,000 - 65,400',
    tp1: '66,800',
    tp2: '68,500',
    tp3: '71,000',
    stopLoss: '63,800',
    timeframe: '4H',
    technicalReasoning: 'Bullish order block bounce with high spot CVD buying absorption.',
    riskLevel: 'Medium',
    riskRewardRatio: '1:3.2',
    status: 'Active',
    publishedBy: user?.name || 'Zia Khan',
  });

  // Futures form state
  const [futuresForm, setFuturesForm] = useState<Partial<FuturesSignal>>({
    pair: 'BTC/USDT',
    direction: 'LONG',
    entryZone: '64,800 - 65,200',
    tp1: '66,500',
    tp2: '67,800',
    tp3: '69,500',
    tp4: '72,000',
    stopLoss: '63,900',
    leverage: '10x',
    marginType: 'Isolated',
    fundingRate: '+0.008%',
    openInterest: '$5.4B (+4.2%)',
    cvdObservations: 'Aggressive buyer delta absorption at local support.',
    liquidationLevels: 'Short liquidation cluster at $67,500.',
    technicalReasoning: 'Liquidity sweep followed by strong volume reclamation above 4H VWAP.',
    riskLevel: 'Medium',
    riskRewardRatio: '1:3.5',
    status: 'Active',
    publishedBy: user?.name || 'Zia Khan',
  });

  const handleCreateSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSpotSignal(spotForm);
      setShowAddSpotModal(false);
      if (onRefreshSignals) onRefreshSignals();
    } catch (err: any) {
      alert(err.message || 'Failed to create spot signal');
    }
  };

  const handleCreateFutures = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFuturesSignal(futuresForm);
      setShowAddFuturesModal(false);
      if (onRefreshSignals) onRefreshSignals();
    } catch (err: any) {
      alert(err.message || 'Failed to create futures signal');
    }
  };

  const handleDeleteSpot = async (id: string) => {
    try {
      await api.deleteSpotSignal(id);
      if (onRefreshSignals) onRefreshSignals();
    } catch (err: any) {
      console.error('Failed to delete spot signal:', err);
    }
  };

  const handleDeleteFutures = async (id: string) => {
    try {
      await api.deleteFuturesSignal(id);
      if (onRefreshSignals) onRefreshSignals();
    } catch (err: any) {
      console.error('Failed to delete futures signal:', err);
    }
  };

  const handleUpdateSpotStatus = async (id: string, status: SignalStatus) => {
    await api.updateSpotSignal(id, { status });
    if (onRefreshSignals) onRefreshSignals();
  };

  const handleUpdateFuturesStatus = async (id: string, status: SignalStatus) => {
    await api.updateFuturesSignal(id, { status });
    if (onRefreshSignals) onRefreshSignals();
  };

  const activeSpotCount = spotSignals.filter((s) => s.status === 'Active').length;
  const activeFuturesCount = futuresSignals.filter((s) => s.status === 'Active').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/80 border border-purple-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-mono font-bold mb-2 shadow-xs">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span>LEARN AND GROW · INSTITUTIONAL SIGNALS DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Market Signals Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Real-time algorithmic trading setups across Spot accumulation and Perpetual Futures leverage. Select a section below to view active trades.
          </p>
        </div>

        {!canAccessSignals && (
          <div className="relative z-10">
            <button
              type="button"
              onClick={() => onOpenPayment?.('advanced')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock VIP Signals (${advancedPrice})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* TWO CLICKABLE SECTIONS: SPOT vs. FUTURES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
        <div className="flex items-center gap-2">
          {/* Section 1: Spot Button */}
          <button
            type="button"
            onClick={() => setActiveTab('spot')}
            className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-bold font-mono transition-all flex items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer ${
              activeTab === 'spot'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white/80'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'spot' ? 'text-white' : 'text-purple-600'}`} />
            <span>SPOT SIGNALS</span>
            <span
              className={`text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full ${
                activeTab === 'spot'
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {activeSpotCount}
            </span>
          </button>

          {/* Section 2: Futures Button */}
          <button
            type="button"
            onClick={() => setActiveTab('futures')}
            className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-bold font-mono transition-all flex items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer ${
              activeTab === 'futures'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white/80'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'futures' ? 'text-white' : 'text-purple-600'}`} />
            <span>FUTURES SIGNALS</span>
            <span
              className={`text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full ${
                activeTab === 'futures'
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {activeFuturesCount}
            </span>
          </button>
        </div>

        {/* Admin Quick Action Button */}
        {isAdmin && (
          <div className="flex items-center gap-2 px-2">
            {activeTab === 'spot' ? (
              <button
                type="button"
                onClick={() => setShowAddSpotModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Post Spot Signal</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddFuturesModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Post Futures Signal</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= SECTION 1: ONLY SPOT SIGNALS ================= */}
      {activeTab === 'spot' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Spot Market Trades ({spotSignals.length} Total)
            </h3>
            <span className="text-xs font-mono text-slate-500">
              No Liquidation Risk • Pure Spot Accumulation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spotSignals.map((sig) => (
              <div
                key={sig.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {sig.pair}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {sig.direction}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {sig.timeframe || '4H'}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 border ${
                        sig.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                          : sig.status.includes('Hit')
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {sig.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      {sig.status}
                    </span>
                  </div>

                  {/* Signal Price Levels */}
                  {canAccessSignals ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 block mb-0.5">BUY ZONE</span>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{sig.entryZone}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                          <span className="text-[10px] text-emerald-700 block mb-0.5">TARGET (TP1)</span>
                          <span className="font-bold text-emerald-700 text-xs sm:text-sm">{sig.tp1}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200">
                          <span className="text-[10px] text-rose-700 block mb-0.5">STOP LOSS</span>
                          <span className="font-bold text-rose-700 text-xs sm:text-sm">{sig.stopLoss}</span>
                        </div>
                      </div>

                      {/* TP2 & TP3 */}
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-600 px-1">
                        <span className="text-[10px] text-slate-400">RUNNERS:</span>
                        <span className="text-emerald-700 font-semibold">TP2: {sig.tp2}</span>
                        {sig.tp3 && <span className="text-emerald-700 font-semibold">| TP3: {sig.tp3}</span>}
                      </div>

                      {/* Technical Reasoning */}
                      {sig.technicalReasoning && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-purple-50/40 p-3 rounded-xl border border-purple-100">
                          <strong className="text-slate-800 font-mono text-[10px] block mb-0.5 uppercase">
                            Technical Rationale:
                          </strong>
                          {sig.technicalReasoning}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-center space-y-2">
                      <Lock className="w-5 h-5 text-purple-600 mx-auto" />
                      <p className="text-xs text-slate-800 font-semibold">
                        Spot Trade Entry, Targets & Stop Loss are Locked
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenPayment?.('advanced')}
                        className="text-xs font-bold text-purple-700 hover:text-purple-800 underline cursor-pointer"
                      >
                        Enroll to unlock all Spot & Futures setups (${advancedPrice} USD) →
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer & Admin Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500">
                    By {sig.publishedBy || 'Zia Khan'} • R:R {sig.riskRewardRatio || '1:3'}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <select
                        value={sig.status}
                        onChange={(e) => handleUpdateSpotStatus(sig.id, e.target.value as SignalStatus)}
                        className="px-2 py-1 rounded bg-slate-50 text-slate-800 border border-slate-300 text-[11px] font-mono focus:outline-hidden"
                      >
                        <option value="Active">Active</option>
                        <option value="Hit TP1">Hit TP1</option>
                        <option value="Hit TP2">Hit TP2</option>
                        <option value="Hit TP3">Hit TP3</option>
                        <option value="Stopped Out">Stopped Out</option>
                        <option value="Closed">Closed</option>
                      </select>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteSpot(sig.id);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteSpot(sig.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 border border-rose-200 text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer shrink-0"
                        title="Delete Spot Signal Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {spotSignals.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-2 shadow-xs">
                <Zap className="w-8 h-8 text-purple-400 mx-auto" />
                <p>No active Spot signals right now.</p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAddSpotModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold cursor-pointer"
                  >
                    + Publish First Spot Signal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: ONLY FUTURES SIGNALS ================= */}
      {activeTab === 'futures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              Perpetual Futures Setups ({futuresSignals.length} Total)
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Leverage Mechanics • Long & Short Liquidation Maps
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {futuresSignals.map((sig) => {
              const isLong = sig.direction === 'LONG';
              return (
                <div
                  key={sig.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 font-mono">
                          {sig.pair}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                            isLong
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {sig.direction}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                          {sig.leverage || '10x'}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 border ${
                          sig.status === 'Active'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse'
                            : sig.status.includes('Hit')
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {sig.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                        {sig.status}
                      </span>
                    </div>

                    {/* Signal Levels */}
                    {canAccessSignals ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-500 block mb-0.5">ENTRY ZONE</span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{sig.entryZone}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 block mb-0.5">TARGET (TP1)</span>
                            <span className="font-bold text-emerald-700 text-xs sm:text-sm">{sig.tp1}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200">
                            <span className="text-[10px] text-rose-700 block mb-0.5">STOP LOSS</span>
                            <span className="font-bold text-rose-700 text-xs sm:text-sm">{sig.stopLoss}</span>
                          </div>
                        </div>

                        {/* Extended Targets */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600 px-1">
                          <span className="text-[10px] text-slate-400">TIERS:</span>
                          <span className="text-emerald-700 font-semibold">TP2: {sig.tp2}</span>
                          {sig.tp3 && <span className="text-emerald-700 font-semibold">| TP3: {sig.tp3}</span>}
                          {sig.tp4 && <span className="text-indigo-700 font-semibold">| TP4: {sig.tp4}</span>}
                        </div>

                        {/* Liquidation & CVD Notes */}
                        <div className="p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-xs space-y-1.5">
                          {sig.liquidationLevels && (
                            <div className="flex items-center gap-1.5 text-purple-800 font-mono text-[11px] font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                              <span>Liq Cluster: {sig.liquidationLevels}</span>
                            </div>
                          )}
                          {sig.cvdObservations && (
                            <p className="text-slate-600 text-[11px]">
                              <strong className="text-slate-800 font-mono text-[10px]">CVD: </strong>
                              {sig.cvdObservations}
                            </p>
                          )}
                          {sig.technicalReasoning && (
                            <p className="text-slate-600 text-[11px]">
                              <strong className="text-slate-800 font-mono text-[10px]">Reasoning: </strong>
                              {sig.technicalReasoning}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-center space-y-2">
                        <Lock className="w-5 h-5 text-purple-600 mx-auto" />
                        <p className="text-xs text-slate-800 font-semibold">
                          Futures Setup Entry, Leverage & Targets are Locked
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenPayment?.('advanced')}
                          className="text-xs font-bold text-purple-700 hover:text-purple-800 underline cursor-pointer"
                        >
                          Unlock VIP Futures Access (${advancedPrice} USD) →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer & Admin Controls */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      By {sig.publishedBy || 'Zia Khan'} • Margin: {sig.marginType || 'Isolated'}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <select
                          value={sig.status}
                          onChange={(e) => handleUpdateFuturesStatus(sig.id, e.target.value as SignalStatus)}
                          className="px-2 py-1 rounded bg-slate-50 text-slate-800 border border-slate-300 text-[11px] font-mono focus:outline-hidden"
                        >
                          <option value="Active">Active</option>
                          <option value="Hit TP1">Hit TP1</option>
                          <option value="Hit TP2">Hit TP2</option>
                          <option value="Hit TP3">Hit TP3</option>
                          <option value="Hit TP4">Hit TP4</option>
                          <option value="Stopped Out">Stopped Out</option>
                          <option value="Closed">Closed</option>
                        </select>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteFutures(sig.id);
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteFutures(sig.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 border border-rose-200 text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer shrink-0"
                          title="Delete Futures Signal Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {futuresSignals.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-2 shadow-xs">
                <Activity className="w-8 h-8 text-purple-400 mx-auto" />
                <p>No active Futures signals right now.</p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAddFuturesModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold cursor-pointer"
                  >
                    + Publish First Futures Signal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Exchange Referral Accounts (MEXC • Binance • Bybit) */}
      {exchanges && exchanges.length > 0 && (
        <ExchangeReferralCards
          exchanges={exchanges}
          title="Official Exchange Portals (MEXC • Binance • Bybit)"
          subtitle="Open an account on recommended exchanges to execute spot and futures signals with 0% maker fee perks."
        />
      )}

      {/* ADMIN MODAL: ADD SPOT SIGNAL */}
      {showAddSpotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-6 text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 font-mono flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Publish Spot Trading Signal
            </h3>

            <form onSubmit={handleCreateSpot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Pair</label>
                  <input
                    type="text"
                    value={spotForm.pair}
                    onChange={(e) => setSpotForm({ ...spotForm, pair: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Direction</label>
                  <select
                    value={spotForm.direction}
                    onChange={(e) => setSpotForm({ ...spotForm, direction: e.target.value as 'BUY' | 'SELL' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Entry Zone</label>
                  <input
                    type="text"
                    value={spotForm.entryZone}
                    onChange={(e) => setSpotForm({ ...spotForm, entryZone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">TP 1</label>
                  <input
                    type="text"
                    value={spotForm.tp1}
                    onChange={(e) => setSpotForm({ ...spotForm, tp1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Stop Loss</label>
                  <input
                    type="text"
                    value={spotForm.stopLoss}
                    onChange={(e) => setSpotForm({ ...spotForm, stopLoss: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">TP 2 (Optional)</label>
                  <input
                    type="text"
                    value={spotForm.tp2}
                    onChange={(e) => setSpotForm({ ...spotForm, tp2: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">TP 3 (Optional)</label>
                  <input
                    type="text"
                    value={spotForm.tp3}
                    onChange={(e) => setSpotForm({ ...spotForm, tp3: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Technical Rationale</label>
                <textarea
                  rows={2}
                  value={spotForm.technicalReasoning}
                  onChange={(e) => setSpotForm({ ...spotForm, technicalReasoning: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 resize-none focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSpotModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Publish Signal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN MODAL: ADD FUTURES SIGNAL */}
      {showAddFuturesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-6 text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 font-mono flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Publish Perpetual Futures Signal
            </h3>

            <form onSubmit={handleCreateFutures} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Pair</label>
                  <input
                    type="text"
                    value={futuresForm.pair}
                    onChange={(e) => setFuturesForm({ ...futuresForm, pair: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Direction</label>
                  <select
                    value={futuresForm.direction}
                    onChange={(e) => setFuturesForm({ ...futuresForm, direction: e.target.value as 'LONG' | 'SHORT' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                  >
                    <option value="LONG">LONG (Buy)</option>
                    <option value="SHORT">SHORT (Sell)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Leverage</label>
                  <input
                    type="text"
                    value={futuresForm.leverage}
                    onChange={(e) => setFuturesForm({ ...futuresForm, leverage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    placeholder="10x"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Entry Zone</label>
                  <input
                    type="text"
                    value={futuresForm.entryZone}
                    onChange={(e) => setFuturesForm({ ...futuresForm, entryZone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">TP 1</label>
                  <input
                    type="text"
                    value={futuresForm.tp1}
                    onChange={(e) => setFuturesForm({ ...futuresForm, tp1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Stop Loss</label>
                  <input
                    type="text"
                    value={futuresForm.stopLoss}
                    onChange={(e) => setFuturesForm({ ...futuresForm, stopLoss: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Liquidation Levels</label>
                  <input
                    type="text"
                    value={futuresForm.liquidationLevels}
                    onChange={(e) => setFuturesForm({ ...futuresForm, liquidationLevels: e.target.value })}
                    placeholder="e.g. $67,500 short pool"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">CVD Observations</label>
                  <input
                    type="text"
                    value={futuresForm.cvdObservations}
                    onChange={(e) => setFuturesForm({ ...futuresForm, cvdObservations: e.target.value })}
                    placeholder="e.g. Bullish delta divergence"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFuturesModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Publish Futures Signal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
