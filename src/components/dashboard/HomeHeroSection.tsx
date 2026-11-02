import React from 'react';
import { Play, TrendingUp, GraduationCap, ArrowRight } from 'lucide-react';

interface HomeHeroSectionProps {
  onStartLearning: () => void;
  onExploreCourses: () => void;
}

export const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({
  onStartLearning,
  onExploreCourses,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8f9ff] via-white to-[#f3f0ff] border border-purple-100/90 p-6 sm:p-10 lg:p-12 shadow-xl">
      {/* Soft atmospheric gradient accents matching user's design */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Headline, Callout Box, Description & Action Buttons */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
          {/* Small Top Tag */}
          <div className="inline-flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-purple-700 font-mono">
              LEARN AND GROW
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
            Learn Today, <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Grow Tomorrow
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
            Your complete platform for trading, investing and financial education.
            Access expert courses, market insights and powerful tools to learn, trade and grow in the financial markets.
          </p>

          {/* Purple Callout Card with Graduation Cap Icon */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-purple-50/90 border border-purple-200 text-purple-950 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-300 flex items-center justify-center shrink-0 text-purple-700">
              <GraduationCap className="w-5 h-5 text-purple-700" />
            </div>
            <p className="text-xs sm:text-sm font-medium leading-snug">
              Build your skills, get real market knowledge and achieve your financial goals with <strong className="text-slate-900 font-bold">Learn and Grow</strong>.
            </p>
          </div>

          {/* Educational Paragraph */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
            We provide high-quality trading courses, live signals, research analysis and educational resources to help you become a better trader, investor and a successful person.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onStartLearning}
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreCourses}
              className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-purple-400 font-semibold text-sm transition-all hover:scale-[1.02] shadow-xs cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Right Column: Branded Graphic Card & Course Floating Card (from user mockup) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          {/* Main Branded White Presentation Card */}
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl ring-1 ring-slate-200/90 flex flex-col items-center justify-center text-center animate-card-3s transition-all duration-300">
            {/* Official Logo (L with Candlesticks and Ascending Arrow) */}
            <div className="w-48 sm:w-56 h-48 sm:h-56 flex items-center justify-center p-2 relative animate-logo-3s">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_9.11.16_PM_3e22bda3.jpeg"
                alt="Learn and Grow Official Emblem"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>

            {/* Official Brand Typography under the logo */}
            <div className="mt-3 space-y-1">
              <h2
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', serif, system-ui" }}
              >
                Learn and Grow
              </h2>
              <p className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                — LEARN • TRADE • INVEST • GROW —
              </p>
            </div>
          </div>

          {/* Floating Course Callout Card underneath (as in user mockup) */}
          <div
            onClick={onExploreCourses}
            className="w-full max-w-md mt-4 p-4 rounded-2xl bg-white border border-purple-200/90 hover:border-purple-400 shadow-md flex items-center justify-between cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-white" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Watch Our Trading Courses
                </p>
                <p className="text-[11px] text-slate-500">
                  Learn from experts, anytime
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  );
};
