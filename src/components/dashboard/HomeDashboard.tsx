import React from 'react';
import type {
  Lesson,
  LiveClass,
  SpotSignal,
  FuturesSignal,
  MarketTicker,
  CoursePricingConfig,
  ExchangeReferral
} from '../../types/index.ts';
import { HomeHeroSection } from './HomeHeroSection.tsx';
import { HomeTradingChart } from './HomeTradingChart.tsx';
import { ExchangeReferralCards } from '../common/ExchangeReferralCards.tsx';
import { HomeCoursesSection } from './HomeCoursesSection.tsx';
import { HomeChannelsSection } from './HomeChannelsSection.tsx';

interface HomeDashboardProps {
  onNavigate: (view: string) => void;
  beginnerLessons?: Lesson[];
  advancedLessons?: Lesson[];
  liveClasses?: LiveClass[];
  spotSignals?: SpotSignal[];
  futuresSignals?: FuturesSignal[];
  tickers?: MarketTicker[];
  completedLessonsCount?: number;
  pricing?: CoursePricingConfig;
  exchanges?: ExchangeReferral[];
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
  onOpenChannelModal?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  beginnerLessons = [],
  advancedLessons = [],
  pricing,
  exchanges = [],
  onOpenPayment = () => {},
  onOpenChannelModal,
}) => {
  const handleStartLearning = () => {
    // Prompt 9: Open payment first for non-enrolled users, or navigate to beginner
    if (onOpenPayment) {
      onOpenPayment('beginner');
    } else {
      onNavigate('beginner');
    }
  };

  const handleExploreCourses = () => {
    const el = document.getElementById('home-courses-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('beginner');
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 max-w-6xl mx-auto">
      {/* 
        1. TOP HERO SECTION: Exact design as created by user in Image 1 ("Learn Today, Grow Tomorrow")
      */}
      <HomeHeroSection
        onStartLearning={handleStartLearning}
        onExploreCourses={handleExploreCourses}
      />

      {/* 
        2. REAL-TIME INTERACTIVE CANDLESTICK TRADING CHART
      */}
      <HomeTradingChart />

      {/* 
        3. OFFICIAL PARTNER EXCHANGES (MEXC, Binance, Bybit) with $10 Bonus
      */}
      {exchanges.length > 0 && (
        <ExchangeReferralCards
          exchanges={exchanges}
          title="Official Partner Exchanges (MEXC • Binance • Bybit)"
          subtitle="Sign up through our verified partner links below to claim your $10 USDT welcome bonus, 0% maker fees, and exclusive trading discounts."
        />
      )}

      {/* 
        4. FINANCIAL MARKETS COURSE SECTION: Beginner ($2) & Advance ($5) with Pay Now flow (Prompt 9 & 10)
      */}
      <HomeCoursesSection
        onNavigate={onNavigate}
        onOpenPayment={onOpenPayment}
        beginnerLessons={beginnerLessons}
        advancedLessons={advancedLessons}
        pricing={pricing}
      />

      {/* 
        5. BOTTOM CHANNELS SECTION: Official Community & Social Channels (Prompt 10)
      */}
      <HomeChannelsSection
        onOpenChannelModal={onOpenChannelModal}
      />
    </div>
  );
};
