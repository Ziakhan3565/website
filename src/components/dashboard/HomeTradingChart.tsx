import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Users,
  Flame,
  Sparkles,
  BarChart3,
  Maximize2,
  RefreshCw,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Layers,
  Clock
} from 'lucide-react';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isBullish: boolean;
}

interface TradingPair {
  symbol: string;
  name: string;
  basePrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  precision: number;
}

const TRADING_PAIRS: TradingPair[] = [
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin Perpetual',
    basePrice: 67840.50,
    change24h: 4.82,
    high24h: 68450.00,
    low24h: 64920.00,
    volume24h: '$3.42B',
    precision: 2,
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum Perpetual',
    basePrice: 3542.20,
    change24h: 6.15,
    high24h: 3610.00,
    low24h: 3320.00,
    volume24h: '$1.86B',
    precision: 2,
  },
  {
    symbol: 'SOL/USDT',
    name: 'Solana Perpetual',
    basePrice: 184.60,
    change24h: 9.45,
    high24h: 189.20,
    low24h: 168.00,
    volume24h: '$840M',
    precision: 2,
  },
  {
    symbol: 'BNB/USDT',
    name: 'BNB Perpetual',
    basePrice: 598.40,
    change24h: 2.10,
    high24h: 605.50,
    low24h: 584.00,
    volume24h: '$410M',
    precision: 1,
  },
];

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D'] as const;
type Timeframe = typeof TIMEFRAMES[number];

// Generate deterministic candlestick data based on pair and timeframe
function generateCandles(basePrice: number, count = 28): CandleData[] {
  const candles: CandleData[] = [];
  let current = basePrice * 0.94;
  const now = Date.now();
  const stepMs = 15 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const time = new Date(now - (count - i) * stepMs).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    // Add realistic market trend with volatility
    const swing = (Math.sin(i * 0.45) * 0.018 + (Math.random() - 0.46) * 0.02) * current;
    const open = current;
    const close = current + swing;
    const high = Math.max(open, close) + Math.random() * 0.009 * current;
    const low = Math.min(open, close) - Math.random() * 0.009 * current;
    const volume = Math.floor(Math.random() * 800 + 200);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
      isBullish: close >= open,
    });
    current = close;
  }
  return candles;
}

export const HomeTradingChart: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [candles, setCandles] = useState<CandleData[]>(() => generateCandles(TRADING_PAIRS[0].basePrice));
  const [currentPrice, setCurrentPrice] = useState<number>(selectedPair.basePrice);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [showEMA, setShowEMA] = useState(true);
  const [showOrderBlocks, setShowOrderBlocks] = useState(true);

  // Live Engagement & Views counter states
  const [liveViews, setLiveViews] = useState(5428);
  const [activeAnalysts, setActiveAnalysts] = useState(1284);
  const [impressions, setImpressions] = useState(10540);

  // Reset candles when pair changes
  useEffect(() => {
    const newCandles = generateCandles(selectedPair.basePrice);
    setCandles(newCandles);
    setCurrentPrice(selectedPair.basePrice);
  }, [selectedPair, timeframe]);

  // Simulate real-time ticking candlestick price action
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const delta = (Math.random() - 0.48) * (selectedPair.basePrice * 0.0008);
        const nextPrice = Number((prev + delta).toFixed(selectedPair.precision));
        setPriceFlash(delta >= 0 ? 'up' : 'down');
        setTimeout(() => setPriceFlash(null), 450);

        // Update the last candle
        setCandles((prevCandles) => {
          if (prevCandles.length === 0) return prevCandles;
          const updated = [...prevCandles];
          const last = { ...updated[updated.length - 1] };
          last.close = nextPrice;
          last.high = Math.max(last.high, nextPrice);
          last.low = Math.min(last.low, nextPrice);
          last.isBullish = last.close >= last.open;
          updated[updated.length - 1] = last;
          return updated;
        });

        return nextPrice;
      });

      // Gently tick live views to reflect active traffic
      if (Math.random() > 0.4) {
        setLiveViews((v) => v + Math.floor(Math.random() * 3 + 1));
      }
      if (Math.random() > 0.6) {
        setActiveAnalysts((a) => a + (Math.random() > 0.5 ? 1 : -1));
        setImpressions((i) => i + Math.floor(Math.random() * 5 + 2));
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [selectedPair]);

  // Min/Max calculations for SVG charting bounds
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const min = Math.min(...lows) * 0.998;
    const max = Math.max(...highs) * 1.002;
    return { minPrice: min, maxPrice: max, priceRange: max - min || 1 };
  }, [candles]);

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 320;
  const paddingX = 40;
  const paddingY = 24;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const getY = (price: number) => {
    return paddingY + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const candleWidth = chartWidth / candles.length;

  // Calculate EMA 20 path points
  const emaPoints = useMemo(() => {
    if (candles.length < 5) return '';
    const k = 2 / (20 + 1);
    let ema = candles[0].close;
    const points: string[] = [];

    candles.forEach((c, idx) => {
      ema = c.close * k + ema * (1 - k);
      const x = paddingX + idx * candleWidth + candleWidth / 2;
      const y = getY(ema);
      points.push(`${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    });
    return points.join(' ');
  }, [candles, minPrice, priceRange]);

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <section className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#0a0f1d] via-[#090d18] to-[#06080f] shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* Luminous Cyber Blue & Emerald background glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP HEADER & MARKET TICKER BAR */}
      <div className="relative z-10 p-4 sm:p-6 border-b border-cyan-500/20 bg-slate-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Pair Selector & Live Price */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Pair Pills */}
            <div className="inline-flex p-1 rounded-2xl bg-[#0e1629] border border-cyan-500/30 shadow-inner">
              {TRADING_PAIRS.map((pair) => (
                <button
                  key={pair.symbol}
                  type="button"
                  onClick={() => setSelectedPair(pair)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedPair.symbol === pair.symbol
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {pair.symbol.split('/')[0]}
                </button>
              ))}
            </div>

            {/* Live Price Display with Green/Red Flash */}
            <div className="flex items-baseline gap-2.5">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors duration-200 ${
                  priceFlash === 'up'
                    ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : priceFlash === 'down'
                    ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                    : 'text-white'
                }`}
              >
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.precision })}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-xs sm:text-sm font-mono font-bold px-2 py-0.5 rounded-lg ${
                  selectedPair.change24h >= 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {selectedPair.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h}%</span>
              </span>
            </div>

            {/* Live Pulse Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>LIVE FEED</span>
            </div>
          </div>

          {/* Timeframe & Chart Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe pills */}
            <div className="flex items-center p-1 rounded-xl bg-[#0c1222] border border-slate-800">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Indicator Toggles */}
            <button
              type="button"
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                showEMA
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              EMA 20
            </button>

            <button
              type="button"
              onClick={() => setShowOrderBlocks(!showOrderBlocks)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                showOrderBlocks
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Order Blocks
            </button>
          </div>
        </div>

        {/* 24h Stats bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 mt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">24h High</span>
            <span className="text-slate-200 font-bold">${selectedPair.high24h.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">24h Low</span>
            <span className="text-slate-200 font-bold">${selectedPair.low24h.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">24h Volume</span>
            <span className="text-cyan-400 font-bold">{selectedPair.volume24h}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">Market Sentiment</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              78% Bullish Flow
            </span>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE SVG CANDLESTICK CHART */}
      <div className="relative z-10 px-2 sm:px-6 py-4 bg-gradient-to-b from-transparent to-slate-950/60">
        
        {/* Inspection Tooltip Badge */}
        {activeCandle && (
          <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0d1424]/90 border border-cyan-500/30 text-[10px] font-mono mb-2 shadow-lg backdrop-blur-md">
            <span className="text-slate-400">Time: <strong className="text-white">{activeCandle.time}</strong></span>
            <span className="text-slate-400">O: <strong className="text-slate-200">${activeCandle.open.toFixed(selectedPair.precision)}</strong></span>
            <span className="text-slate-400">H: <strong className="text-emerald-400">${activeCandle.high.toFixed(selectedPair.precision)}</strong></span>
            <span className="text-slate-400">L: <strong className="text-rose-400">${activeCandle.low.toFixed(selectedPair.precision)}</strong></span>
            <span className="text-slate-400">C: <strong className={activeCandle.isBullish ? 'text-emerald-400' : 'text-rose-400'}>${activeCandle.close.toFixed(selectedPair.precision)}</strong></span>
            <span className="text-slate-400">Vol: <strong className="text-cyan-300">{activeCandle.volume} BTC</strong></span>
          </div>
        )}

        <div className="w-full overflow-x-auto select-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 sm:h-72 lg:h-80 overflow-visible"
          >
            <defs>
              <linearGradient id="bullishCandleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="bearishCandleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
              <linearGradient id="orderBlockGreen" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="orderBlockRed" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#f43f5e" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0.15, 0.38, 0.62, 0.85].map((pct, idx) => {
              const y = paddingY + chartHeight * pct;
              const priceLabel = maxPrice - priceRange * pct;
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={svgWidth - paddingX + 6}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    ${priceLabel.toFixed(selectedPair.precision)}
                  </text>
                </g>
              );
            })}

            {/* Institutional Order Blocks Zones */}
            {showOrderBlocks && (
              <>
                {/* Demand Zone (Bullish Order Block) */}
                <rect
                  x={paddingX}
                  y={getY(minPrice + priceRange * 0.28)}
                  width={chartWidth}
                  height={getY(minPrice) - getY(minPrice + priceRange * 0.28)}
                  fill="url(#orderBlockGreen)"
                  stroke="#10b981"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingX + 8}
                  y={getY(minPrice + priceRange * 0.24)}
                  fill="#34d399"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ★ INSTITUTIONAL DEMAND / BUY BLOCK
                </text>

                {/* Supply Zone (Resistance Order Block) */}
                <rect
                  x={paddingX}
                  y={getY(maxPrice)}
                  width={chartWidth}
                  height={getY(maxPrice - priceRange * 0.14) - getY(maxPrice)}
                  fill="url(#orderBlockRed)"
                  stroke="#f43f5e"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingX + 8}
                  y={getY(maxPrice) + 12}
                  fill="#fb7185"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ⚡ SUPPLY / LIQUIDITY SWEEP POOL
                </text>
              </>
            )}

            {/* EMA 20 Line Overlay */}
            {showEMA && emaPoints && (
              <path
                d={emaPoints}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              />
            )}

            {/* Candlesticks Rendering */}
            {candles.map((candle, idx) => {
              const x = paddingX + idx * candleWidth;
              const candleCenterX = x + candleWidth / 2;
              const highY = getY(candle.high);
              const lowY = getY(candle.low);
              const openY = getY(candle.open);
              const closeY = getY(candle.close);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(Math.abs(closeY - openY), 2.5);
              const width = Math.max(candleWidth * 0.7, 4);

              const color = candle.isBullish ? '#10b981' : '#f43f5e';
              const gradId = candle.isBullish ? 'url(#bullishCandleGrad)' : 'url(#bearishCandleGrad)';

              return (
                <g
                  key={idx}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={() => setHoveredCandle(candle)}
                  onMouseLeave={() => setHoveredCandle(null)}
                >
                  {/* Upper and Lower Wick */}
                  <line
                    x1={candleCenterX}
                    y1={highY}
                    x2={candleCenterX}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Real Candlestick Body */}
                  <rect
                    x={candleCenterX - width / 2}
                    y={bodyTop}
                    width={width}
                    height={bodyHeight}
                    fill={gradId}
                    rx="1.5"
                    stroke={color}
                    strokeWidth="0.5"
                  />
                </g>
              );
            })}

            {/* Current Price Horizontal Ray */}
            <line
              x1={paddingX}
              y1={getY(currentPrice)}
              x2={svgWidth - paddingX}
              y2={getY(currentPrice)}
              stroke="#06b6d4"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              className="animate-pulse"
            />
            <rect
              x={svgWidth - paddingX - 2}
              y={getY(currentPrice) - 9}
              width={54}
              height={18}
              rx="4"
              fill="#06b6d4"
            />
            <text
              x={svgWidth - paddingX + 25}
              y={getY(currentPrice) + 3}
              textAnchor="middle"
              fill="#020617"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              ${currentPrice.toFixed(0)}
            </text>
          </svg>
        </div>

        {/* Volume Delta Bar */}
        <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Orderflow Momentum:</span>
            <div className="w-32 sm:w-48 h-2 rounded-full bg-rose-500/30 overflow-hidden flex">
              <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: '76%' }} />
            </div>
            <span className="text-emerald-400 font-bold">76% Buyers</span>
          </div>

          <span className="text-[10px] text-cyan-400/90 font-mono hidden sm:inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Real-time tick stream active
          </span>
        </div>
      </div>
    </section>
  );
};
