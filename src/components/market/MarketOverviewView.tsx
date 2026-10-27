import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Search,
  ArrowUpDown,
  AlertCircle,
  Clock,
  ShieldCheck,
  Activity,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { MarketTicker } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface MarketOverviewViewProps {
  initialTickers: MarketTicker[];
  initialStale: boolean;
  initialError: string | null;
  lastUpdate: string | null;
  onRefresh: () => void;
}

export const MarketOverviewView: React.FC<MarketOverviewViewProps> = ({
  initialTickers,
  initialStale,
  initialError,
  lastUpdate,
  onRefresh,
}) => {
  const [tickers, setTickers] = useState<MarketTicker[]>(initialTickers);
  const [isStale, setIsStale] = useState<boolean>(initialStale);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'price' | 'symbol'>('volume');
  const [sortAsc, setSortAsc] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setTickers(initialTickers);
    setIsStale(initialStale);
    setErrorMessage(initialError);
  }, [initialTickers, initialStale, initialError]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.getMarketOverview();
      setTickers(res.tickers);
      setIsStale(res.stale);
      setErrorMessage(res.error);
    } catch (e: any) {
      setIsStale(true);
      setErrorMessage(e.message || 'Error updating market data');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter & Sort
  const filtered = tickers.filter(t =>
    t.baseAsset.toLowerCase().includes(search.toLowerCase()) ||
    t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'volume') diff = b.quoteVolume - a.quoteVolume;
    else if (sortBy === 'change') diff = b.priceChangePercent - a.priceChangePercent;
    else if (sortBy === 'price') diff = b.lastPrice - a.lastPrice;
    else if (sortBy === 'symbol') diff = a.baseAsset.localeCompare(b.baseAsset);
    return sortAsc ? -diff : diff;
  });

  const toggleSort = (col: 'volume' | 'change' | 'price' | 'symbol') => {
    if (sortBy === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(col);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#171717] border border-[#2a2a2a] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#10a37f]/15 border border-[#10a37f]/30 text-[#19c37d] text-xs font-mono mb-2">
              <Activity className="w-3.5 h-3.5 text-[#10a37f]" /> OFFICIAL BINANCE REST & FUTURES FEED
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Cryptocurrency Market Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Real-time exchange prices, 24-hour volume delta, high/low ranges, and perpetual funding rates directly from Binance. Independent of Learn and Grow internal trading signals.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(16,163,127,0.3)] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Tickers
            </button>
          </div>
        </div>

        {/* Status indicator bar */}
        <div className="mt-6 pt-4 border-t border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isStale ? 'bg-amber-400' : 'bg-[#10a37f] animate-pulse shadow-[0_0_8px_#10a37f]'}`} />
              <strong className="text-neutral-200">Exchange Connection:</strong>
            </span>
            <span className={isStale ? 'text-amber-400' : 'text-[#19c37d]'}>
              {isStale ? 'Stale Data / Cached State' : 'Live Connected to Binance v3 API'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Alert if Stale or Error */}
      {isStale && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed font-sans">
            <strong className="text-amber-300 font-mono uppercase block mb-0.5">
              Market Connection Warning:
            </strong>
            {errorMessage || 'Exchange latency detected. Displaying verified cached values rather than synthetic numbers until fresh feed settles.'}
          </div>
        </div>
      )}

      {/* Search & Sort Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crypto pair (BTC, ETH, SOL, SUI)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#171717] border border-[#2a2a2a] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#10a37f]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span>Sort by:</span>
          {(['volume', 'change', 'price', 'symbol'] as const).map((col) => (
            <button
              key={col}
              onClick={() => toggleSort(col)}
              className={`px-2.5 py-1 rounded capitalize transition-colors ${
                sortBy === col ? 'bg-[#2a2a2a] text-white font-semibold border border-[#3a3a3a]' : 'bg-[#171717] text-neutral-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              {col} {sortBy === col ? (sortAsc ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Market Tickers Data Table */}
      <div className="rounded-xl bg-[#171717] border border-[#2a2a2a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262626] bg-[#141414] text-[11px] font-mono uppercase text-neutral-400">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('price')}>
                  Price (USDT)
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('change')}>
                  24h Change
                </th>
                <th className="py-3 px-4 text-right">24h High / Low</th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('volume')}>
                  24h Volume (USDT)
                </th>
                <th className="py-3 px-4 text-right">Perp 8h Funding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626] font-mono text-xs">
              {sorted.map((t) => {
                const isPos = t.priceChangePercent >= 0;
                return (
                  <tr
                    key={t.symbol}
                    className="hover:bg-[#212121] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#212121] border border-[#2e2e2e] flex items-center justify-center font-bold text-white text-[11px]">
                          {t.baseAsset.slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{t.baseAsset}</span>
                          <span className="text-[10px] text-neutral-500">{t.quoteAsset}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                      ${t.lastPrice > 10 ? t.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : t.lastPrice.toFixed(4)}
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums">
                      <span className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded ${
                        isPos
                          ? 'bg-[#10a37f]/15 text-[#19c37d] border border-[#10a37f]/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPos ? '+' : ''}{t.priceChangePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums text-neutral-400">
                      <span className="text-neutral-200">${t.highPrice > 10 ? t.highPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : t.highPrice.toFixed(4)}</span>
                      <span className="text-neutral-600 mx-1">/</span>
                      <span className="text-neutral-500">${t.lowPrice > 10 ? t.lowPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : t.lowPrice.toFixed(4)}</span>
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums text-neutral-300">
                      ${(t.quoteVolume / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums">
                      {t.fundingRate !== undefined ? (
                        <span className={`font-semibold ${t.fundingRate > 0.0003 ? 'text-amber-400' : t.fundingRate < 0 ? 'text-cyan-400' : 'text-neutral-300'}`}>
                          {(t.fundingRate * 100).toFixed(4)}%
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
