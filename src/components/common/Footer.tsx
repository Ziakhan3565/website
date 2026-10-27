import React from 'react';
import {
  ShieldAlert,
  GraduationCap,
  Radio,
  Zap,
  BarChart2,
  FileText,
  Share2,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import type { LegalModalType } from './LegalModals.tsx';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenLegal: (type: LegalModalType) => void;
  onOpenTopNavModal?: (type: 'channel' | 'service' | 'about' | 'feedback') => void;
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenLegal,
  onOpenTopNavModal,
  onOpenPayment,
}) => {
  return (
    <footer className="mt-16 pt-12 pb-10 border-t border-[#1f2133] bg-gradient-to-b from-[#0a0b12] to-[#06070a] relative overflow-hidden">
      {/* Ambient background gold glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => onNavigate('home')} className="inline-block cursor-pointer">
              <Logo size="lg" showText={true} showTagline={true} />
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed">
              <strong>Learn and Grow</strong> is a specialized trading education and financial market research academy founded by Lead Instructor Zia Khan. We bridge retail trading and institutional order book dynamics with mathematical discipline and risk-first execution.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Trading • Education • Success</span>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#141624] text-neutral-300 border border-[#23263c]">
                By Lead Instructor Zia Khan
              </span>
            </div>
          </div>

          {/* Column 2: Academy Curriculum */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Academy Modules</span>
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('beginner')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Beginner Foundation Videos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('advanced')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Advance VIP Masterclasses
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('live')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Live Interactive Desk
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPayment?.('beginner')}
                  className="hover:text-emerald-400 text-emerald-400/90 transition-colors text-left font-mono"
                >
                  Enroll Beginner ($2 USD) →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Signals & Trading Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Desk & Signals</span>
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('spot')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Spot Accumulation Signals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('futures')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Perpetual Futures Setups
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('market')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Live Binance Market Tickers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('materials')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Course Study Notes & PDFs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('announcements')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Official Platform Dispatches
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Trust & Legal</span>
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('risk')}
                  className="hover:text-amber-300 transition-colors text-left flex items-center gap-1"
                >
                  <span>Risk Disclosure</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('refund')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenTopNavModal?.('service')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Official Support Desk
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Highlighted Gold Risk Advisory Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-4xl">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <strong className="text-amber-300 font-bold font-mono uppercase tracking-wider text-[11px]">
                High-Risk Warning & Educational Disclaimer:
              </strong>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-300">
              Trading foreign exchange, spot cryptocurrencies, and perpetual futures involves substantial risk of loss and is not appropriate for every individual. All lessons, signals, and commentary provided on <strong>Learn and Grow</strong> are strictly educational and should never be construed as personalized investment advice.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenLegal('risk')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold shrink-0 transition-all cursor-pointer"
          >
            Read Full Disclosure →
          </button>
        </div>

        {/* Bottom Bar: Copyright & Student Badges */}
        <div className="pt-6 border-t border-[#181a28] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Learn and Grow. All rights reserved.</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Trading • Education • Success</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-white transition-colors"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('risk')}
              className="hover:text-white transition-colors"
            >
              Risk Warning
            </button>
            <button
              type="button"
              onClick={() => onOpenTopNavModal?.('about')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
