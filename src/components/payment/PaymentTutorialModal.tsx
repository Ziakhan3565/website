import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CreditCard,
  Lock,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Coins,
  Send,
  Copy,
  Check,
  Building2,
  ExternalLink
} from 'lucide-react';

export type PaymentTutorialMethod = 'card' | 'crypto' | 'local';

interface PaymentTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMethod?: PaymentTutorialMethod;
  courseTitle?: string;
  coursePrice?: number;
  onProceedToPay?: (method: PaymentTutorialMethod) => void;
}

export const PaymentTutorialModal: React.FC<PaymentTutorialModalProps> = ({
  isOpen,
  onClose,
  defaultMethod = 'card',
  courseTitle = 'Course Subscription',
  coursePrice = 10,
  onProceedToPay,
}) => {
  // Method tab: 'card' (Short, No OTP) | 'crypto' (USDT TRC20/BEP20) | 'local' (EasyPaisa/JazzCash/Bank)
  const [activeMethod, setActiveMethod] = useState<PaymentTutorialMethod>(defaultMethod);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Synchronize when defaultMethod changes
  useEffect(() => {
    if (defaultMethod) {
      setActiveMethod(defaultMethod);
      setCurrentTime(0);
      setIsCompleted(false);
      setIsPlaying(true);
    }
  }, [defaultMethod]);

  // Durations:
  // Card: 16s (Short, No OTP)
  // Crypto: 18s
  // Local: 16s
  const totalDuration = activeMethod === 'crypto' ? 18 : 16;

  // Scene calculations
  // CARD METHOD:
  // Scene 1: 0 - 6s (16-Digit Card Number & Cardholder Name)
  // Scene 2: 6 - 12s (Expiry Date & 3D Card Turn to 3-digit CVV)
  // Scene 3: 12 - 16s (Instant 1-Click Pay & Course Activated! NO OTP)
  //
  // CRYPTO METHOD:
  // Scene 1: 0 - 6s (Copy USDT TRC20 / BEP20 Wallet Address & Scan QR)
  // Scene 2: 6 - 12s (Send USDT from Binance / Trust Wallet / OKX)
  // Scene 3: 12 - 18s (Paste TxID Hash & Instant Auto-Activation)
  //
  // LOCAL METHOD:
  // Scene 1: 0 - 6s (Send to EasyPaisa / JazzCash / Bank IBAN)
  // Scene 2: 6 - 11s (Get 11-digit Trx ID from SMS receipt)
  // Scene 3: 11 - 16s (Submit Trx ID & Immediate Verification)
  const cardScene = currentTime < 6 ? 1 : currentTime < 12 ? 2 : 3;
  const cryptoScene = currentTime < 6 ? 1 : currentTime < 12 ? 2 : 3;
  const localScene = currentTime < 6 ? 1 : currentTime < 11 ? 2 : 3;
  const currentScene =
    activeMethod === 'card'
      ? cardScene
      : activeMethod === 'crypto'
      ? cryptoScene
      : localScene;

  // Web Audio Synth for realistic sound effects
  const playSoundEffect = (type: 'type' | 'flip' | 'copy' | 'send' | 'success') => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'type') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'flip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'copy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.09);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // AudioContext unavailable
    }
  };

  // Web Speech API Voice Narration in English
  const lastSpokenSceneRef = useRef<string>('');
  const speakSceneNarration = (method: PaymentTutorialMethod, scene: number) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      let text = '';
      if (method === 'card') {
        if (scene === 1) text = 'Step one: Enter the sixteen digit number and your name printed on your debit or credit card.';
        else if (scene === 2) text = 'Step two: Enter the expiry date and the three digit CVV code on the back.';
        else if (scene === 3) text = 'Step three: Click Pay. Your payment is securely deducted and your full course is activated instantly!';
      } else if (method === 'crypto') {
        if (scene === 1) text = 'Step one: Copy the official USDT TRC20 or BEP20 deposit wallet address.';
        else if (scene === 2) text = 'Step two: Open your Binance or crypto wallet and send the exact course fee.';
        else if (scene === 3) text = 'Step three: Copy your transaction hash, paste it in the box, and access unlocks immediately!';
      } else if (method === 'local') {
        if (scene === 1) text = 'Step one: Send the course fee to the official EasyPaisa, JazzCash, or bank account.';
        else if (scene === 2) text = 'Step two: Note down the transaction reference ID from your SMS receipt.';
        else if (scene === 3) text = 'Step three: Enter your transaction reference to activate your course instantly!';
      }
      if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech synthesis unsupported
    }
  };

  // Sound and voice triggers on scene transitions
  useEffect(() => {
    const key = `${activeMethod}-${currentScene}`;
    if (key !== lastSpokenSceneRef.current) {
      lastSpokenSceneRef.current = key;
      if (activeMethod === 'card') {
        if (currentScene === 1) playSoundEffect('type');
        else if (currentScene === 2) playSoundEffect('flip');
        else if (currentScene === 3) playSoundEffect('success');
      } else if (activeMethod === 'crypto') {
        if (currentScene === 1) playSoundEffect('copy');
        else if (currentScene === 2) playSoundEffect('send');
        else if (currentScene === 3) playSoundEffect('success');
      } else if (activeMethod === 'local') {
        if (currentScene === 1) playSoundEffect('type');
        else if (currentScene === 2) playSoundEffect('copy');
        else if (currentScene === 3) playSoundEffect('success');
      }

      if (isPlaying && !isMuted) {
        speakSceneNarration(activeMethod, currentScene);
      }
    }
  }, [activeMethod, currentScene, isPlaying, isMuted]);

  // Keyboard Escape listener to cross and exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.speechSynthesis?.cancel();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.speechSynthesis?.cancel();
    };
  }, [isOpen, onClose]);

  // Playback timer loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        if (next >= totalDuration) {
          setIsPlaying(false);
          setIsCompleted(true);
          return totalDuration;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed, totalDuration]);

  if (!isOpen) return null;

  const handleSwitchMethod = (method: PaymentTutorialMethod) => {
    setActiveMethod(method);
    setCurrentTime(0);
    setIsCompleted(false);
    setIsPlaying(true);
    lastSpokenSceneRef.current = '';
    window.speechSynthesis?.cancel();
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsCompleted(false);
    setIsPlaying(true);
    lastSpokenSceneRef.current = '';
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Card animation values (Short, No OTP)
  const fullCardNumber = '4532 8920 1048 9201';
  const cardCharsRevealed = Math.min(
    fullCardNumber.length,
    Math.floor((Math.max(0, currentTime - 0.5) / 4) * fullCardNumber.length)
  );
  const animatedCardDisplay =
    fullCardNumber.slice(0, cardCharsRevealed) +
    '•'.repeat(Math.max(0, fullCardNumber.length - cardCharsRevealed));

  // Crypto animation values
  const cryptoAddress = 'TQ3aXm9yKLZpTRC20OfficialCourseCrashDesk99';
  const txidHash = '0x8f2a93b4e1c75019d87349102482019482019481903482019';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* 🔴 PROMINENT TOP FLOATING CROSS BUTTON - STRICTLY ENGLISH ONLY */}
      <button
        type="button"
        onClick={() => {
          window.speechSynthesis?.cancel();
          onClose();
        }}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-2xl shadow-rose-600/50 border border-white/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        title="Close Video"
        aria-label="Close Video"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] group-hover:rotate-90 transition-transform" />
        <span className="tracking-wide">Close</span>
        <span className="hidden md:inline-block text-[10px] bg-black/35 px-1.5 py-0.5 rounded font-mono font-normal">
          ESC
        </span>
      </button>

      <div className="relative w-full max-w-4xl bg-[#0f1019] border border-[#23253b] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 flex flex-col max-h-[94vh]">
        {/* Header Bar - Fully Responsive for Mobile, Tablet, Laptop */}
        <div className="bg-gradient-to-r from-[#6b21a8] via-[#7c3aed] to-[#4f46e5] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-white border-b border-purple-500/30 shrink-0">
          <div className="pr-10 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded font-bold">
                Interactive Video Tutorial
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Official Guide · ${coursePrice} USD
              </span>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight mt-0.5 truncate">
              {activeMethod === 'card' && 'How to Pay with Debit or Credit Card'}
              {activeMethod === 'crypto' && 'How to Transfer with USDT Crypto'}
              {activeMethod === 'local' && 'How to Pay via Mobile Wallet & Bank'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              window.speechSynthesis?.cancel();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Method Switcher Tabs: Card vs Crypto vs Mobile Wallet */}
        <div className="bg-[#141524] px-3 sm:px-6 py-2.5 border-b border-[#23253b] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 w-full sm:w-auto">
            {/* Tab 1: Card */}
            <button
              type="button"
              onClick={() => handleSwitchMethod('card')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer whitespace-nowrap ${
                activeMethod === 'card'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#1e2034] text-neutral-300 hover:text-white hover:bg-[#272a44]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-300" />
              <span>Card (Short, No OTP)</span>
            </button>

            {/* Tab 2: Crypto */}
            <button
              type="button"
              onClick={() => handleSwitchMethod('crypto')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer whitespace-nowrap ${
                activeMethod === 'crypto'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#1e2034] text-neutral-300 hover:text-white hover:bg-[#272a44]'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span>Crypto USDT</span>
            </button>

            {/* Tab 3: Mobile Wallet & Bank */}
            <button
              type="button"
              onClick={() => handleSwitchMethod('local')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer whitespace-nowrap ${
                activeMethod === 'local'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#1e2034] text-neutral-300 hover:text-white hover:bg-[#272a44]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>EasyPaisa / JazzCash / Bank</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-400 hidden md:inline-block">
              {activeMethod === 'card' ? '16s Quick Guide' : activeMethod === 'crypto' ? '18s Blockchain Guide' : '16s Fast Transfer'}
            </span>
          </div>
        </div>

        {/* Video Canvas Body (Responsive 16:9 Canvas) */}
        <div className="relative bg-[#06070c] aspect-video w-full min-h-[240px] sm:min-h-[360px] md:min-h-[420px] max-h-[500px] flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none shrink-0">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Resolution Badge */}
          <div className="absolute top-2.5 left-3 sm:top-3 sm:left-4 z-20 flex items-center gap-2">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 border border-purple-500/30 text-[9px] sm:text-[10px] font-mono text-purple-300 font-bold flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="uppercase">{activeMethod} TUTORIAL · 1080p HD</span>
            </span>
          </div>

          {/* ======================================================== */}
          {/* METHOD 1: CARD ANIMATED SCENES (Short, Crisp, NO OTP!) */}
          {/* ======================================================== */}
          {activeMethod === 'card' && (
            <>
              {/* Scene 1 & 2: 3D Credit/Debit Card Visualization */}
              {(currentScene === 1 || currentScene === 2) && (
                <div className="relative z-10 w-full max-w-[290px] sm:max-w-md transition-all duration-500">
                  <div
                    className={`relative w-full aspect-[1.586/1] rounded-2xl p-4 sm:p-6 shadow-2xl transition-all duration-700 ${
                      currentScene === 2
                        ? 'bg-gradient-to-br from-[#1a1c2e] via-[#121324] to-[#0a0b14] border-2 border-cyan-400/60 shadow-cyan-500/20'
                        : 'bg-gradient-to-br from-[#4c1d95] via-[#311042] to-[#1e1035] border-2 border-purple-400/50 shadow-purple-500/25'
                    }`}
                  >
                    {/* Chip & Brand */}
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className="w-9 sm:w-11 h-6 sm:h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 p-0.5 shadow flex items-center justify-center">
                        <div className="w-full h-full border border-amber-900/40 rounded flex flex-col justify-around py-0.5 px-1 opacity-70">
                          <div className="h-0.5 bg-amber-900/30" />
                          <div className="h-0.5 bg-amber-900/30" />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-purple-200 tracking-wider">
                          DEBIT / CREDIT
                        </span>
                        <p className="text-[8px] sm:text-[10px] text-neutral-400 font-mono">VISA · MASTERCARD</p>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="my-2 sm:my-3">
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase text-purple-300 block mb-0.5">
                        Card Number (16 Digits)
                      </span>
                      <div className="text-xs sm:text-lg md:text-xl font-mono font-bold text-white tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-1">
                        <span>{animatedCardDisplay}</span>
                        {currentScene === 1 && (
                          <span className="w-0.5 h-4 sm:h-5 bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Cardholder & Expiry / CVV */}
                    <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-white/10 text-[10px] sm:text-xs font-mono">
                      <div>
                        <span className="text-[7px] sm:text-[8px] uppercase text-neutral-400 block">Cardholder</span>
                        <span className="font-bold text-white tracking-wide">ZIA KHAN</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[7px] sm:text-[8px] uppercase text-neutral-400 block">Expires</span>
                        <span className={`font-bold transition-all ${
                          currentScene === 2 ? 'text-cyan-300 scale-110' : 'text-white'
                        }`}>
                          09 / 28
                        </span>
                      </div>

                      {currentScene === 2 && (
                        <div className="text-right bg-black/40 px-2 py-0.5 rounded border border-cyan-400/40 animate-pulse">
                          <span className="text-[7px] sm:text-[8px] uppercase text-cyan-400 block font-bold">CVV Code</span>
                          <span className="font-bold text-cyan-300">742</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Scene 3: Instant Payment Approval (NO OTP!) */}
              {currentScene === 3 && (
                <div className="relative z-10 w-full max-w-[290px] sm:max-w-md bg-gradient-to-b from-[#121e1a] to-[#0c1412] border-2 border-emerald-400/60 rounded-3xl p-5 sm:p-7 text-center space-y-3 sm:space-y-4 shadow-2xl shadow-emerald-500/30 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                      PAYMENT APPROVED
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                      Direct Deduct & Immediate Unlock
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-300 mt-1 leading-relaxed">
                      ${coursePrice} USD deducted automatically. Zero OTP waiting! All modules, live rooms, and VIP trading signals are unlocked on your account.
                    </p>
                  </div>

                  <div className="p-2 sm:p-3 rounded-2xl bg-[#162922] border border-emerald-500/30 text-[11px] sm:text-xs font-mono text-emerald-300 flex items-center justify-center gap-1.5 sm:gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant VIP Account Activated</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* METHOD 2: CRYPTO USDT (TRC20 / BEP20) ANIMATED SCENES */}
          {/* ======================================================== */}
          {activeMethod === 'crypto' && (
            <>
              {/* Scene 1: Copy Official Address */}
              {cryptoScene === 1 && (
                <div className="relative z-10 w-full max-w-[290px] sm:max-w-md bg-[#121424] border-2 border-amber-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-500/20 space-y-3 sm:space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-[#252846]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">USDT Deposit Address</h4>
                        <span className="text-[10px] text-amber-300 font-mono">TRON (TRC20) & BSC (BEP20)</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">${coursePrice} USDT</span>
                  </div>

                  {/* Address Copy Demonstration */}
                  <div className="p-3 rounded-2xl bg-[#191b30] border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span>Official Receiving Address:</span>
                      <span className="text-emerald-400 font-bold">1-Click Copy</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
                      <code className="text-[11px] font-mono text-amber-200 truncate flex-1">
                        {cryptoAddress}
                      </code>
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-bold shrink-0 flex items-center gap-1 animate-pulse">
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-neutral-300 leading-snug">
                    Always choose network <strong>TRON (TRC20)</strong> or <strong>BSC (BEP20)</strong> in Binance/Trust Wallet to ensure lowest fees and instant delivery.
                  </p>
                </div>
              )}

              {/* Scene 2: Send from Wallet */}
              {cryptoScene === 2 && (
                <div className="relative z-10 w-full max-w-[290px] sm:max-w-md bg-[#101322] border-2 border-cyan-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-500/20 space-y-3 sm:space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-[#232746]">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-white">Binance / Trust Wallet Withdrawal</h4>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-400/30">
                      Transferring
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex justify-between">
                      <span className="text-neutral-400">Withdraw Currency:</span>
                      <strong className="text-white">USDT (Tether)</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex justify-between">
                      <span className="text-neutral-400">Selected Network:</span>
                      <strong className="text-cyan-300">TRON (TRC20)</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex justify-between">
                      <span className="text-neutral-400">Transfer Amount:</span>
                      <strong className="text-emerald-400">${coursePrice} USDT</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono text-center flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Transaction Sent on Blockchain...</span>
                  </div>
                </div>
              )}

              {/* Scene 3: TxID Paste & Instant Verification */}
              {cryptoScene === 3 && (
                <div className="relative z-10 w-full max-w-[290px] sm:max-w-md bg-gradient-to-b from-[#121e1a] to-[#0c1412] border-2 border-emerald-400/60 rounded-3xl p-5 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-2xl shadow-emerald-500/30 animate-in fade-in duration-300">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 mx-auto shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Paste TxID / Transaction Hash</h3>
                    <p className="text-[11px] text-neutral-300 mt-1">
                      Paste the transaction hash from your transfer receipt into the box and click Submit.
                    </p>
                  </div>

                  <div className="p-2 bg-black/50 rounded-xl border border-emerald-500/30 font-mono text-[10px] text-emerald-300 truncate">
                    TxID: {txidHash}
                  </div>

                  <div className="text-[10px] sm:text-xs font-mono text-emerald-400 font-bold bg-emerald-500/15 py-1.5 px-3 rounded-full border border-emerald-500/30 inline-block">
                    ✓ Instant Blockchain Verification Complete
                  </div>
                </div>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* METHOD 3: MOBILE WALLET & BANK (EasyPaisa/JazzCash/IBAN) */}
          {/* ======================================================== */}
          {activeMethod === 'local' && (
            <>
              {/* Scene 1: Send to Account Number */}
              {localScene === 1 && (
                <div className="relative z-10 w-full max-w-[290px] sm:max-w-md bg-[#131626] border-2 border-emerald-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-500/20 space-y-3 sm:space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-[#252848]">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-white">Mobile Wallet & Bank Transfer</h4>
                    </div>
                    <span className="text-xs font-mono text-emerald-300 font-bold">${coursePrice} USD</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center">
                      <span className="text-neutral-400">EasyPaisa / JazzCash:</span>
                      <strong className="text-emerald-300 font-bold">0300-8492019</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex justify-between items-center">
                      <span className="text-neutral-400">Account Title:</span>
                      <strong className="text-amber-300">Learn and Grow Official</strong>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-neutral-300 leading-snug">
                    Open your EasyPaisa, JazzCash, or mobile banking app and send the fee amount to the account details shown.
                  </p>
                </div>
              )}

              {/* Scene 2: Get Trx ID from SMS receipt */}
              {localScene === 2 && (
                <div className="relative z-10 w-full max-w-[290px] sm:max-w-md bg-[#101422] border-2 border-cyan-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-500/20 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-[#232746]">
                    <span className="text-xs font-bold text-white">SMS Payment Receipt</span>
                    <span className="text-[10px] font-mono text-cyan-300">Just Now</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#181d33] border border-cyan-500/30 text-xs space-y-1.5">
                    <p className="text-[11px] text-neutral-200 leading-relaxed">
                      Payment sent successfully to Learn and Grow. Transaction ID is:
                    </p>
                    <div className="p-2 rounded-xl bg-black/50 border border-cyan-400/40 text-center">
                      <span className="text-sm font-mono font-bold text-cyan-300 tracking-wider">
                        TRX: 29481048201
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-neutral-300 text-center">
                    Note down or copy the 11-digit Trx ID number from your SMS receipt.
                  </p>
                </div>
              )}

              {/* Scene 3: Instant Verification */}
              {localScene === 3 && (
                <div className="relative z-10 w-full max-w-[290px] sm:max-w-md bg-gradient-to-b from-[#121e1a] to-[#0c1412] border-2 border-emerald-400/60 rounded-3xl p-5 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-2xl shadow-emerald-500/30 animate-in fade-in duration-300">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 mx-auto shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Enter Trx ID & Unlock Instantly</h3>
                    <p className="text-[11px] text-neutral-300 mt-1">
                      Type the transaction ID in the box and your account unlocks immediately!
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                    Trx ID: 29481048201 (Verified)
                  </div>

                  <div className="text-[10px] sm:text-xs font-mono text-emerald-400 font-bold bg-emerald-500/15 py-1.5 px-3 rounded-full border border-emerald-500/30 inline-block">
                    ✓ Immediate Access Approved
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step Caption Overlay at Bottom of Video Canvas */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 bg-black/80 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="px-1.5 sm:px-2 py-0.5 rounded bg-purple-600 text-white font-mono font-bold text-[9px] sm:text-[10px] shrink-0">
                STEP {currentScene} OF 3
              </span>
              <span className="text-white font-semibold truncate text-[11px] sm:text-xs">
                {activeMethod === 'card' && currentScene === 1 && 'Enter 16-Digit Card Number (Visa / Mastercard)'}
                {activeMethod === 'card' && currentScene === 2 && 'Enter Expiry (MM/YY) & Turn Over for 3-Digit CVV'}
                {activeMethod === 'card' && currentScene === 3 && 'Click Pay · Instant Deduct & Complete Access Unlocked (No OTP)'}

                {activeMethod === 'crypto' && currentScene === 1 && 'Copy USDT TRC20 or BEP20 Wallet Address'}
                {activeMethod === 'crypto' && currentScene === 2 && 'Send USDT from Binance, Trust Wallet, or OKX'}
                {activeMethod === 'crypto' && currentScene === 3 && 'Paste TxID Hash · Instant Blockchain Verification'}

                {activeMethod === 'local' && currentScene === 1 && 'Send Course Fee to EasyPaisa, JazzCash, or Bank Account'}
                {activeMethod === 'local' && currentScene === 2 && 'Get 11-Digit Transaction Reference from SMS'}
                {activeMethod === 'local' && currentScene === 3 && 'Submit Trx ID · Instant VIP Course Activation'}
              </span>
            </div>

            <span className="text-[10px] sm:text-[11px] font-mono text-purple-300 shrink-0 ml-2">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* 🏁 COMPLETION OVERLAY (Appears when video finishes) */}
          {isCompleted && (
            <div className="absolute inset-0 z-40 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-2xl shadow-emerald-500/40">
                <div className="w-full h-full rounded-full bg-[#0d1416] flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                  Tutorial Completed!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-md mt-1 leading-relaxed">
                  You are now ready to complete your payment with {activeMethod === 'card' ? 'Visa/Mastercard' : activeMethod === 'crypto' ? 'USDT Crypto' : 'EasyPaisa/JazzCash'}.
                </p>
              </div>

              {/* Big prominent Cross and Back buttons - STRICTLY ENGLISH ONLY */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    onClose();
                  }}
                  className="px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-2xl shadow-rose-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-rose-400"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  <span>Close Video & Return</span>
                </button>

                {onProceedToPay && (
                  <button
                    type="button"
                    onClick={() => {
                      window.speechSynthesis?.cancel();
                      onClose();
                      onProceedToPay(activeMethod);
                    }}
                    className="px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-xl shadow-purple-600/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#1e2034] hover:bg-[#282a44] text-neutral-300 text-xs font-semibold flex items-center gap-1.5 border border-[#2f3250] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Video</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-[#0d0e17] flex items-center justify-between gap-2 sm:gap-3 text-xs border-b border-[#1f202d] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 sm:p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-1.5 sm:p-2 rounded-full bg-[#1b1c2b] hover:bg-[#25263a] text-neutral-300 transition-colors cursor-pointer"
              title="Restart Video"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                if (next) window.speechSynthesis?.cancel();
              }}
              className={`p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-neutral-800 text-neutral-500'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
              title={isMuted ? 'Unmute Audio Narration' : 'Mute Audio Narration'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* Interactive Progress Bar */}
          <div className="flex-1 mx-2 sm:mx-3">
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(pos * totalDuration);
              }}
              className="w-full h-2 rounded-full bg-[#202234] overflow-hidden cursor-pointer group"
              title="Seek timeline"
            >
              <div
                className="h-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
                setPlaybackSpeed(nextSpeed);
              }}
              className="px-2 sm:px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-[#1b1c2b] hover:bg-[#25263a] text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
              title="Change Speed"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>

        {/* Step-by-Step Chapters (3 Steps per method) */}
        <div className="p-3 sm:p-5 space-y-3 bg-[#0a0b12] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[11px] sm:text-xs font-mono uppercase text-neutral-400 font-bold tracking-wider">
                {activeMethod === 'card' && 'Card Checkout Chapters (No OTP)'}
                {activeMethod === 'crypto' && 'Crypto USDT Transfer Chapters'}
                {activeMethod === 'local' && 'Mobile Wallet & Bank Chapters'}
              </h3>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-purple-300 font-bold bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
              3 Quick Steps
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                step: 1,
                time: 0,
                title:
                  activeMethod === 'card'
                    ? '1. 16-Digit Card Number'
                    : activeMethod === 'crypto'
                    ? '1. Copy USDT Address'
                    : '1. Send to Mobile / Bank',
                desc:
                  activeMethod === 'card'
                    ? 'Front of Visa / Mastercard'
                    : activeMethod === 'crypto'
                    ? 'TRC20 or BEP20 network'
                    : 'EasyPaisa, JazzCash, IBAN',
                active: currentScene === 1,
              },
              {
                step: 2,
                time: activeMethod === 'crypto' ? 6 : activeMethod === 'local' ? 6 : 6,
                title:
                  activeMethod === 'card'
                    ? '2. Expiry & 3-Digit CVV'
                    : activeMethod === 'crypto'
                    ? '2. Transfer from Wallet'
                    : '2. Note 11-Digit Trx ID',
                desc:
                  activeMethod === 'card'
                    ? 'MM/YY & signature strip'
                    : activeMethod === 'crypto'
                    ? 'Binance / Trust Wallet'
                    : 'From SMS receipt',
                active: currentScene === 2,
              },
              {
                step: 3,
                time: activeMethod === 'crypto' ? 12 : activeMethod === 'local' ? 11 : 12,
                title:
                  activeMethod === 'card'
                    ? '3. Direct Pay & Access'
                    : activeMethod === 'crypto'
                    ? '3. Paste TxID Hash'
                    : '3. Submit & Unlock',
                desc:
                  activeMethod === 'card'
                    ? 'Immediate deduction (No OTP)'
                    : activeMethod === 'crypto'
                    ? 'Instant blockchain verify'
                    : 'Instant account unlock',
                active: currentScene === 3,
              },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => handleSeek(s.time)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  s.active
                    ? 'bg-purple-950/50 border-purple-400 shadow-md shadow-purple-500/20 scale-[1.01]'
                    : 'bg-[#121320] border-[#222438] hover:border-[#343752]'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-bold ${
                      s.active ? 'bg-purple-500 text-white' : 'bg-[#1e2034] text-neutral-400'
                    }`}
                  >
                    {s.step}
                  </span>
                  {s.active && <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400 font-bold">PLAYING</span>}
                </div>
                <h4 className="text-[11px] sm:text-xs font-bold text-white leading-tight">{s.title}</h4>
                <p className="text-[9px] sm:text-[10px] text-neutral-400 mt-0.5 leading-snug">{s.desc}</p>
              </button>
            ))}
          </div>

          {/* Bottom Action Footer Bar - STRICTLY ENGLISH ONLY */}
          <div className="pt-2 sm:pt-3 border-t border-[#1f202d] flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>Full platform activation for <strong>${coursePrice} USD</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  onClose();
                }}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Close</span>
              </button>

              {onProceedToPay && (
                <button
                  type="button"
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    onClose();
                    onProceedToPay(activeMethod);
                  }}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to {activeMethod === 'card' ? 'Card' : activeMethod === 'crypto' ? 'Crypto' : 'Local'} Pay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
