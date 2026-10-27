import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Logo } from '../common/Logo.tsx';
import { ScreenRecordingSimulator } from './ScreenRecordingSimulator.tsx';

interface PlatformTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

export const PlatformTutorialModal: React.FC<PlatformTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('lg_tutorial_dismissed', 'true');
      } catch (e) {
        // ignore
      }
    }
    sessionStorage.setItem('lg_tutorial_seen_session', 'true');
    onClose();
  };

  const handleNavigate = (view: string) => {
    handleClose();
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0a0b12] border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header Bar */}
        <div className="relative z-10 px-5 sm:px-7 py-3 bg-[#0d0e17] border-b border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={true} />
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFICIAL SCREEN RECORDING GUIDE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Skip Walkthrough</span>
              <X className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Interactive Screen-Recording Simulator Body */}
        <div className="relative z-10 p-3 sm:p-5">
          <ScreenRecordingSimulator
            onNavigateToSection={handleNavigate}
            onClose={handleClose}
          />
        </div>

        {/* Modal Footer Bar */}
        <div className="relative z-10 px-5 py-3 bg-[#0d0e17] border-t border-[#1e2030] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-neutral-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded bg-[#181928] border-neutral-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
            <span>Don't show automatically on next login</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavigate('beginner')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Go to Beginner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:opacity-95 text-black font-black transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              Got It, Let's Trade!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
