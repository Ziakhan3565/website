import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  MousePointer2,
  Send,
  MessageCircle,
  GraduationCap,
  Zap,
  Radio,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Phone,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { Logo } from '../common/Logo.tsx';

export interface VideoChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  cursorTarget: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    label: string;
    isClicking?: boolean;
  };
  simulatedView: 'market' | 'channel' | 'beginner' | 'advance' | 'live' | 'signals';
  narrationEnglish: string;
  appView: string;
}

export const CHAPTERS: VideoChapter[] = [
  {
    id: 'market_structure',
    chapterNumber: 1,
    title: 'Financial Market Mechanics & Order Flow',
    subtitle: 'Understanding market liquidity, spot & futures order book depth',
    startTime: 0,
    endTime: 25,
    cursorTarget: { x: 50, y: 32, label: 'Analyzing Institutional Order Flow', isClicking: false },
    simulatedView: 'market',
    appView: 'home',
    narrationEnglish:
      'Welcome to Learn and Grow. Financial markets are continuous auction environments governed by institutional liquidity, order flow imbalance, and supply and demand dynamics. Learn and Grow equips you with institutional market structure to trade profitably.',
  },
  {
    id: 'channels',
    chapterNumber: 2,
    title: 'Top Navigation & Official Channels',
    subtitle: 'Join verified WhatsApp community & Telegram VIP desks',
    startTime: 25,
    endTime: 50,
    cursorTarget: { x: 62, y: 12, label: 'Click Top "Channel" Hub', isClicking: true },
    simulatedView: 'channel',
    appView: 'home',
    narrationEnglish:
      'Chapter 2: Official Channels. At the top of your screen, click the Channel button to join our verified WhatsApp Community and Telegram VIP desks for real-time market updates, trade announcements, and direct mentor support.',
  },
  {
    id: 'beginner_academy',
    chapterNumber: 3,
    title: 'Beginner Academy & Course Enrollment',
    subtitle: 'Candlestick patterns, 1% risk rule, and easy course checkout',
    startTime: 50,
    endTime: 75,
    cursorTarget: { x: 74, y: 38, label: 'Click "Enroll Now" to Buy Course', isClicking: true },
    simulatedView: 'beginner',
    appView: 'beginner',
    narrationEnglish:
      'Chapter 3: Beginner Academy. Master candlestick patterns, market structures, and the strict one percent risk management rule. Course enrollment is located right here in the Beginner section via EasyPaisa, JazzCash, USDT, or Card.',
  },
  {
    id: 'advance_vip',
    chapterNumber: 4,
    title: 'Advance VIP Masterclass (SMC & Futures)',
    subtitle: 'Institutional Smart Money Concepts & CVD absorption',
    startTime: 75,
    endTime: 100,
    cursorTarget: { x: 22, y: 46, label: 'Open Advance VIP Curriculum', isClicking: true },
    simulatedView: 'advance',
    appView: 'advanced',
    narrationEnglish:
      'Chapter 4: Advance VIP Masterclass. Designed for serious traders. Dive into institutional Smart Money Concepts, Order Block mitigation, Cumulative Volume Delta divergence, and advanced perpetual futures strategies.',
  },
  {
    id: 'live_desk',
    chapterNumber: 5,
    title: '1-Click Live Trading Desk & Webinars',
    subtitle: 'Join New York open execution in 1 click with Zia Khan',
    startTime: 100,
    endTime: 125,
    cursorTarget: { x: 48, y: 22, label: 'Click "1-Click Join Live Stream"', isClicking: true },
    simulatedView: 'live',
    appView: 'live',
    narrationEnglish:
      'Chapter 5: Live Trading Desk. Whenever an instructor goes live, a broadcast bar appears at the top. Click the one-click Join button to instantly enter the live room, watch real-time New York open execution, and chat with Zia Khan.',
  },
  {
    id: 'signals_desk',
    chapterNumber: 6,
    title: 'Signals Terminal & Quantitative Setups',
    subtitle: 'Verified spot/futures trade calls & disciplined risk targets',
    startTime: 125,
    endTime: 150,
    cursorTarget: { x: 50, y: 64, label: 'Access Spot & Futures Signals', isClicking: true },
    simulatedView: 'signals',
    appView: 'signals',
    narrationEnglish:
      'Chapter 6: Signals Desk. Access verified trade setups with exact Entry, Take Profit, and Stop Loss targets. High-accuracy quantitative trade execution for students.',
  },
];

const TOTAL_VIDEO_DURATION = 150; // 150 seconds = 2 mins 30 seconds

interface ScreenRecordingSimulatorProps {
  onNavigateToSection?: (view: string) => void;
  onClose?: () => void;
  isCompact?: boolean;
}

export const ScreenRecordingSimulator: React.FC<ScreenRecordingSimulatorProps> = ({
  onNavigateToSection,
  onClose,
  isCompact = false,
}) => {
  // Continuous global timeline in seconds (0.0 to 150.0)
  const [globalTime, setGlobalTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default muted so it never speaks unprompted
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.25); // Brisk 1.25x natural video pacing
  const [clickRipple, setClickRipple] = useState(false);
  const [simulatedVoted, setSimulatedVoted] = useState(false);

  // Derive current chapter from continuous globalTime
  const currentChapter =
    CHAPTERS.find((ch) => globalTime >= ch.startTime && globalTime < ch.endTime) ||
    CHAPTERS[CHAPTERS.length - 1];

  // Helper to stop all speech synthesis cleanly
  const stopAllSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  };

  // Speak narration cleanly when chapter shifts and audio is unmuted
  const lastSpokenChapterRef = useRef<string | null>(null);

  const speakChapterNarration = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      stopAllSpeech();
      if (isMuted || !isPlaying) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  };

  // Trigger speech on chapter transition or unmute
  useEffect(() => {
    if (isPlaying && !isMuted) {
      if (lastSpokenChapterRef.current !== currentChapter.id) {
        lastSpokenChapterRef.current = currentChapter.id;
        speakChapterNarration(currentChapter.narrationEnglish);
      }
    } else {
      stopAllSpeech();
      lastSpokenChapterRef.current = null;
    }
  }, [currentChapter.id, isMuted, isPlaying, playbackSpeed]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  // Continuous timer loop updating globalTime smoothly
  useEffect(() => {
    if (!isPlaying) return;

    const tickMs = 200; // 5 updates per second
    const increment = (tickMs / 1000) * playbackSpeed;

    const timer = setInterval(() => {
      setGlobalTime((prev) => {
        if (prev + increment >= TOTAL_VIDEO_DURATION) {
          return 0; // Seamless loop from start
        }
        return prev + increment;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Periodic click animation
  useEffect(() => {
    const clickInterval = setInterval(() => {
      setClickRipple(true);
      setTimeout(() => setClickRipple(false), 500);
    }, 2800 / playbackSpeed);

    return () => clearInterval(clickInterval);
  }, [playbackSpeed]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (newTime: number) => {
    stopAllSpeech();
    lastSpokenChapterRef.current = null;
    setGlobalTime(newTime);
  };

  const handleJumpToChapter = (chapter: VideoChapter) => {
    handleSeek(chapter.startTime);
  };

  return (
    <div className="flex flex-col rounded-3xl bg-[#090a10] border-2 border-amber-500/40 shadow-2xl overflow-hidden select-none">
      {/* 1. TOP VIDEO HEADER BAR WITH BRAND & CHAPTER NAV */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#17140b] via-[#11121d] to-[#0c0d16] border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wide">
                Learn & Grow Platform Tour
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300 uppercase">
                Continuous HD Walkthrough
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              Chapter {currentChapter.chapterNumber} of {CHAPTERS.length}: {currentChapter.title}
            </p>
          </div>
        </div>

        {/* Chapter Quick Pills */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => handleJumpToChapter(ch)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                currentChapter.id === ch.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Ch.{ch.chapterNumber}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CONTINUOUS VIDEO VIEWPORT (SIMULATED SCREEN RECORDING) */}
      <div className="relative aspect-video w-full bg-[#07080d] overflow-hidden">
        {/* Ambient background glow matching current chapter */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* SIMULATED BROWSER CHROME (TOP APP BAR SIMULATION) */}
        <div className="absolute top-0 inset-x-0 h-10 bg-[#0d0e17]/90 border-b border-amber-500/20 backdrop-blur-md px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="ml-3 px-3 py-1 rounded-md bg-black/60 border border-white/10 text-[9px] font-mono text-neutral-400 flex items-center gap-1.5">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>https://learnandgrow.academy/app</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
            <span className="text-amber-300 font-bold">1080p 60fps</span>
          </div>
        </div>

        {/* DYNAMIC SCENE CONTAINER (FLUID, UNFRAGMENTED TRANSITIONS) */}
        <div className="absolute inset-0 pt-10 p-4 flex flex-col justify-between z-10 transition-all duration-700">
          {/* CHAPTER 1: FINANCIAL MARKETS OVERVIEW SIMULATION */}
          {currentChapter.simulatedView === 'market' && (
            <div className="h-full flex flex-col justify-between p-2 sm:p-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[#10121e]/90 border border-amber-500/30 backdrop-blur-md shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-xs sm:text-sm font-black text-white">
                      Binance Institutional Market Flow & Depth
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    LIVE EXCHANGE FEED
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/20">
                    <span className="text-neutral-400 block text-[9px]">BTC/USDT SPOT</span>
                    <span className="text-emerald-400 font-bold text-xs sm:text-sm">$68,420.50</span>
                    <span className="text-emerald-400 text-[9px] block">+4.12% 24h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/20">
                    <span className="text-neutral-400 block text-[9px]">ETH/USDT FUTURES</span>
                    <span className="text-emerald-400 font-bold text-xs sm:text-sm">$2,640.80</span>
                    <span className="text-emerald-400 text-[9px] block">+2.84% 24h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/20">
                    <span className="text-neutral-400 block text-[9px]">SOL/USDT PERP</span>
                    <span className="text-amber-400 font-bold text-xs sm:text-sm">$182.40</span>
                    <span className="text-emerald-400 text-[9px] block">+6.90% 24h</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-[11px] text-neutral-300 flex items-center justify-between">
                <span>💡 Order book liquidity absorption points & CVD imbalances active</span>
                <span className="text-amber-400 font-mono text-[10px] font-bold">12s Polling Rate</span>
              </div>
            </div>
          )}

          {/* CHAPTER 2: OFFICIAL CHANNELS SIMULATION */}
          {currentChapter.simulatedView === 'channel' && (
            <div className="h-full flex flex-col justify-between p-2 sm:p-4 animate-fade-in">
              <div className="flex items-center justify-center py-2">
                <div className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#17140b] to-[#121320] border-2 border-amber-400 shadow-xl shadow-amber-500/30 flex items-center gap-3">
                  <span className="text-xs font-black text-amber-300">Top Navigation:</span>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-black font-black text-xs shadow-md">
                    📢 Channel Hub
                  </span>
                  <span className="text-xs text-neutral-300">Service</span>
                  <span className="text-xs text-neutral-300">About</span>
                  <span className="text-xs text-neutral-300">Feedback</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full">
                <div className="p-3.5 rounded-2xl bg-[#111220] border border-amber-500/40 text-left space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Official Community</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Join verified students group & daily bias updates
                  </p>
                  <span className="text-[9px] font-mono text-amber-400 underline block pt-1">
                    Click to Open WhatsApp →
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111220] border border-amber-500/40 text-left space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram VIP Desk</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Instant signals notifications and market charts
                  </p>
                  <span className="text-[9px] font-mono text-amber-400 underline block pt-1">
                    Click to Join Telegram →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 3: BEGINNER ACADEMY SIMULATION */}
          {currentChapter.simulatedView === 'beginner' && (
            <div className="h-full flex flex-col justify-between p-2 sm:p-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-[#131422] border border-amber-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase">
                    Curriculum Level 1
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Beginner Trading Academy Foundations
                  </h3>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Candlestick psychology, support/resistance, and strict 1% risk rule
                  </p>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Enroll ($2 USD)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-300">
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                  <span className="text-amber-300 font-bold block">Module 1</span>
                  <span>What are Candlestick Shadows?</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                  <span className="text-amber-300 font-bold block">Module 2</span>
                  <span>Order Types: Limit vs Market</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                  <span className="text-amber-300 font-bold block">Module 3</span>
                  <span>The Golden 1% Risk Formula</span>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 4: ADVANCE VIP SIMULATION */}
          {currentChapter.simulatedView === 'advance' && (
            <div className="h-full flex flex-col justify-between p-2 sm:p-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1c1409] to-[#121325] border-2 border-amber-500/50 shadow-2xl flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold mb-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>INSTITUTIONAL QUANT STRATEGY</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Advance VIP: Smart Money Concepts & Futures
                  </h3>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Order block mitigation, fair value gaps, and CVD absorption scalps
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
                  VIP Access
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-around text-center text-xs font-mono">
                <div>
                  <span className="text-neutral-400 text-[9px] block">Order Flow</span>
                  <span className="text-amber-300 font-bold">CVD Divergence</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="text-neutral-400 text-[9px] block">Risk / Reward</span>
                  <span className="text-emerald-400 font-bold">1 : 4.5 Target</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="text-neutral-400 text-[9px] block">Execution</span>
                  <span className="text-white font-bold">New York Open</span>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 5: 1-CLICK LIVE STREAM DESK SIMULATION */}
          {currentChapter.simulatedView === 'live' && (
            <div className="h-full flex flex-col justify-between p-2 sm:p-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 to-[#120804] border-2 border-amber-500/60 shadow-xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[10px] font-mono font-black text-rose-400 uppercase">
                      LIVE ON AIR
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    New York Open Live Scalping & Order Flow Analysis
                  </h3>
                  <p className="text-[10px] text-neutral-300">
                    Instructor: Zia Khan • Live Attendance & Q&A
                  </p>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/40 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>1-Click Join Live Stream</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-xs flex items-center justify-between">
                <span className="text-neutral-300">🎙️ Direct mic Q&A & order flow execution in real time</span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">✅ 1-Click Connect</span>
              </div>
            </div>
          )}

          {/* CHAPTER 6: SIGNALS TERMINAL SIMULATION */}
          {currentChapter.simulatedView === 'signals' && (
            <div className="h-full flex flex-col justify-between p-2 sm:p-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-[#121320] border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs sm:text-sm font-black text-white">
                    BTC/USDT Perpetual Long Setup
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  Active Signal
                </span>
              </div>

              {/* Trade Levels */}
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto w-full text-center">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-[9px] font-mono text-neutral-400 block uppercase">Entry Zone</span>
                  <span className="text-xs font-bold text-white font-mono">$67,420</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[9px] font-mono text-emerald-400 block uppercase">Target (TP)</span>
                  <span className="text-xs font-bold text-emerald-300 font-mono">$72,800</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[9px] font-mono text-rose-400 block uppercase">Stop Loss</span>
                  <span className="text-xs font-bold text-rose-300 font-mono">$65,900</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CONTINUOUS SMOOTH CURSOR WITH GOLD TARGET RING */}
        <div
          className="absolute z-30 transition-all duration-700 ease-out pointer-events-none"
          style={{
            left: `${currentChapter.cursorTarget.x}%`,
            top: `${currentChapter.cursorTarget.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Pulsing Target Halo */}
          <div className="relative flex items-center justify-center">
            <span
              className={`absolute rounded-full border-2 border-amber-400 transition-all duration-300 ${
                clickRipple ? 'w-14 h-14 bg-amber-400/30 scale-125' : 'w-8 h-8 bg-amber-400/10'
              }`}
            />
            {/* Glowing Mouse Cursor */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black flex items-center justify-center shadow-lg shadow-amber-500/50">
              <MousePointer2 className="w-4 h-4 fill-black stroke-black -rotate-12 translate-x-0.5 translate-y-0.5" />
            </div>

            {/* Target Label Bubble */}
            <div className="absolute left-7 top-1 px-2.5 py-1 rounded-lg bg-black/90 border border-amber-400/70 text-[10px] font-mono font-bold text-amber-300 whitespace-nowrap shadow-xl">
              {currentChapter.cursorTarget.label}
            </div>
          </div>
        </div>

        {/* BOTTOM REAL-TIME NARRATION TRANSCRIPT BAR (CLEAN ENGLISH) */}
        <div className="absolute inset-x-3 bottom-3 z-20 p-2.5 sm:p-3 rounded-2xl bg-black/85 border border-amber-500/35 backdrop-blur-md flex items-center justify-between gap-3 text-xs shadow-xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase shrink-0">
              English Audio Narration
            </span>
            <p className="text-white text-xs sm:text-sm font-medium truncate">
              {currentChapter.narrationEnglish}
            </p>
          </div>

          {/* Jump directly to this view in the app */}
          {onNavigateToSection && (
            <button
              type="button"
              onClick={() => {
                stopAllSpeech();
                onNavigateToSection(currentChapter.appView);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-md"
            >
              <span>Explore Section</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* 3. CONTINUOUS VIDEO TIMELINE SCRUBBER & PLAYER CONTROLS */}
      <div className="p-3 sm:p-4 bg-[#0a0b12] border-t border-amber-500/30 space-y-3">
        {/* Continuous Scrubber Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={TOTAL_VIDEO_DURATION}
            step="0.5"
            value={globalTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-300 font-bold">{formatTime(globalTime)}</span>
              <span>/</span>
              <span>{formatTime(TOTAL_VIDEO_DURATION)}</span>
            </div>

            <span className="text-neutral-400">
              Current: <strong className="text-white">{currentChapter.title}</strong>
            </span>
          </div>
        </div>

        {/* Control Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Play/Pause & Chapter Jumps */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isPlaying) {
                  stopAllSpeech();
                }
                setIsPlaying(!isPlaying);
              }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              title={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleSeek(0)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Restart from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Prev Chapter */}
            <button
              type="button"
              onClick={() => {
                const prev = CHAPTERS.find((ch) => ch.chapterNumber === currentChapter.chapterNumber - 1);
                if (prev) handleJumpToChapter(prev);
              }}
              disabled={currentChapter.chapterNumber === 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Chapter */}
            <button
              type="button"
              onClick={() => {
                const next = CHAPTERS.find((ch) => ch.chapterNumber === currentChapter.chapterNumber + 1);
                if (next) handleJumpToChapter(next);
              }}
              disabled={currentChapter.chapterNumber === CHAPTERS.length}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Next Chapter"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Speed & Volume Controls */}
          <div className="flex items-center gap-2.5">
            {/* Speed Selector */}
            <div className="flex items-center bg-[#151624] p-1 rounded-xl border border-white/10">
              {[1, 1.25, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Mute/Unmute English Audio */}
            <button
              type="button"
              onClick={() => {
                if (isMuted) {
                  setIsMuted(false);
                  speakChapterNarration(currentChapter.narrationEnglish);
                } else {
                  setIsMuted(true);
                  stopAllSpeech();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                !isMuted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                  : 'bg-white/5 text-neutral-400 hover:text-white border-white/10'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isMuted ? 'Unmute Audio' : 'Audio On'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
