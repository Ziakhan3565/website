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
import { HomeTradingChart } from './HomeTradingChart.tsx';
import { ExchangeReferralCards } from '../common/ExchangeReferralCards.tsx';

interface HomeDashboardProps {
  onNavigate: (view: string) => void;
  beginnerLessons: Lesson[];
  advancedLessons: Lesson[];
  liveClasses: LiveClass[];
  spotSignals: SpotSignal[];
  futuresSignals: FuturesSignal[];
  tickers: MarketTicker[];
  completedLessonsCount: number;
  pricing?: CoursePricingConfig;
  exchanges?: ExchangeReferral[];
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  exchanges = [],
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-6xl mx-auto">
      {/* 
        1. TOP SECTION: REAL-TIME INTERACTIVE CANDLESTICK TRADING CHART
      */}
      <HomeTradingChart />

      {/* 
        2. BOTTOM SECTION: OFFICIAL EXCHANGE REFERRAL LINKS (MEXC, BINANCE, BYBIT)
        (With official logos, $10 welcome bonus description, and bracketed codes)
      */}
      {exchanges.length > 0 && (
        <ExchangeReferralCards
          exchanges={exchanges}
          title="Official Partner Exchanges (MEXC • Binance • Bybit)"
          subtitle="Sign up through our verified partner links below to claim your $10 USDT welcome bonus, 0% maker fees, and exclusive trading discounts."
        />
      )}
    </div>
  );
};
