import React from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  SendHorizontal,
  Youtube
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import type { LegalModalType } from './LegalModals.tsx';
import { OFFICIAL_ADMIN_EMAIL } from '../../lib/supabase.ts';

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
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full">
      {/* Top Reassurance Bar */}
      <div className="text-center py-6 px-4 text-xs sm:text-sm text-slate-500 font-medium bg-slate-50/80 border-t border-slate-200">
        We appreciate your trust in{' '}
        <strong className="text-slate-900 font-bold">Learn and Grow</strong> and look forward to assisting you.
      </div>

      {/* Main Purple Gradient Footer Block */}
      <div className="bg-gradient-to-r from-[#4d3bed] via-[#6e35ee] to-[#9833ee] text-white pt-12 sm:pt-16 pb-12 sm:pb-16 relative overflow-hidden">
        {/* Subtle background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          {/* Main 3-Column Grid matching reference design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Column 1: Brand & Disclaimer & Socials (Span 6) */}
            <div className="lg:col-span-6 space-y-5">
              <div onClick={() => onNavigate('home')} className="inline-block cursor-pointer">
                <Logo size="lg" showText={true} showTagline={true} isLight={true} />
              </div>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal max-w-lg">
                DISCLAIMER: We are an Educational Platform/Teachers, We dont ask for investments and we are not financial advisors. The Following groups are the only offical groups of Learn and Grow.
              </p>

              {/* Social Channels - Circular buttons matching reference */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenTopNavModal?.('channel')}
                  title="Official Facebook"
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTopNavModal?.('channel')}
                  title="Official Twitter / X"
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTopNavModal?.('channel')}
                  title="Official Instagram"
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  <Instagram className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTopNavModal?.('channel')}
                  title="Official Telegram Desk"
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  <SendHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTopNavModal?.('channel')}
                  title="Official YouTube"
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  <Youtube className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Column 2: RESOURCES (Span 3) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                RESOURCES
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-white/85 uppercase font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                  >
                    HOME
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('beginner')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                  >
                    BEGINNER ACADEMY
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('advanced')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                  >
                    ADVANCED VIP
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('live')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                  >
                    LIVE DESK
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('signals')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                  >
                    SIGNALS FEED
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenTopNavModal?.('about')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
                  >
                    ABOUT
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: OFFICIAL INFO (Span 3) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                OFFICIAL INFO
              </h4>
              <div className="space-y-2.5 text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                <p>
                  <strong className="font-bold text-white">Email:</strong>{' '}
                  <a
                    href={`mailto:${OFFICIAL_ADMIN_EMAIL}`}
                    className="font-mono text-white/95 hover:text-white underline break-all"
                  >
                    {OFFICIAL_ADMIN_EMAIL}
                  </a>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenLegal('terms')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left text-white/85 block"
                  >
                    Terms & conditions
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenLegal('privacy')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left text-white/85 block"
                  >
                    Privacy Policy
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenLegal('risk')}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left text-white/85 block"
                  >
                    Risk Disclosure
                  </button>
                </div>
                <p className="text-white/80 pt-1">
                  Copyright © {currentYear}
                </p>
              </div>
            </div>
          </div>

          {/* First Divider */}
          <div className="border-t border-white/20 my-8 sm:my-10" />

          {/* Centered Copyright Notice */}
          <div className="text-center text-xs sm:text-sm text-white/90 font-medium">
            Copyright © {currentYear}{' '}
            <strong className="text-white font-bold">Learn and Grow</strong> All Rights Reserved , Learn and Grow Academy LLC
          </div>

          {/* Second Divider */}
          <div className="border-t border-white/20 my-8 sm:my-10" />

          {/* Bottom Legal Disclaimer & Terms of Use */}
          <div className="space-y-2 text-white/85 text-xs sm:text-sm leading-relaxed max-w-5xl">
            <h5 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-white">
              LEGAL DISCLAIMER & TERMS OF USE/CONDITIONS
            </h5>
            <p className="text-[11px] sm:text-xs text-white/75 font-mono">
              <strong className="text-white font-semibold">Last Updated:</strong> 20.03.2025
            </p>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Welcome to Learn and Grow (the &quot;Website&quot;). By accessing or using this Website, you agree to the following disclaimers, terms, and policies. If you do not agree with any part of this disclosure, please discontinue use immediately.{' '}
              <button
                type="button"
                onClick={() => onOpenLegal('terms')}
                className="underline hover:text-white font-semibold cursor-pointer ml-1"
              >
                See More
              </button>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
