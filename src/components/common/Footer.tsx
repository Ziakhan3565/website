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
    <footer className="mt-16 pt-12 pb-10 border-t border-slate-200 bg-slate-50 relative overflow-hidden text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => onNavigate('home')} className="inline-block cursor-pointer">
              <Logo size="lg" showText={true} showTagline={true} />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
              <strong className="text-slate-900">Learn and Grow</strong> is a specialized trading education and financial market research academy founded by Lead Instructor Zia Khan. We bridge retail trading and institutional order book dynamics with mathematical discipline and risk-first execution.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Trading • Education • Success</span>
              </span>
            </div>
          </div>

          {/* Column 2: Academy Curriculum */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>Academy Modules</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('beginner')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  Beginner Foundation Videos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('advanced')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  Advanced VIP Masterclass
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('live')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  Live Trading Broadcast Desk
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('signals')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  Spot & Futures Signal Feed
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              <span>Compliance & Security</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  Terms of Service & License
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  Privacy Policy & Data Security
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('risk')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  CFTC Financial Risk Disclosure
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('refund')}
                  className="hover:text-purple-600 transition-colors text-left cursor-pointer"
                >
                  Refund & Course Access Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Financial Risk Notice Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
          <p>
            <strong className="text-slate-900">General Financial Notice:</strong> Financial market trading involves substantial risk of loss and is not suitable for every investor. The content on Learn and Grow is exclusively educational. Past performance is no guarantee of future profits. Always trade with risk capital you can afford to lose.
          </p>
        </div>

        {/* Bottom Copyright & Status */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} Learn and Grow Academy. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600">Trading Desk Active · Binance Real-time Feed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
