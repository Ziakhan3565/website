import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CandlestickChart,
  Radio,
  Zap,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  hasLiveClassNow: boolean;
  activeSignalsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  hasLiveClassNow,
  activeSignalsCount,
}) => {
  const { user, isAdmin } = useAuth();

  const items = [
    {
      id: 'home',
      label: 'Home',
      icon: LayoutDashboard,
      active: currentView === 'home',
    },
    {
      id: 'beginner',
      label: 'Beginner',
      icon: GraduationCap,
      active: currentView === 'beginner',
    },
    {
      id: 'advanced',
      label: 'Advance',
      icon: CandlestickChart,
      active: currentView === 'advanced',
    },
    {
      id: 'live',
      label: 'Live',
      icon: Radio,
      active: currentView === 'live',
      badge: hasLiveClassNow ? 'LIVE' : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'signals',
      label: 'Signals',
      icon: Zap,
      active: currentView === 'signals' || currentView === 'spot' || currentView === 'futures',
      badge: activeSignalsCount > 0 ? String(activeSignalsCount) : undefined,
      badgeColor: 'bg-purple-600 text-white font-bold',
    },
    {
      id: isAdmin ? 'admin' : 'profile',
      label: isAdmin ? 'Admin' : 'Profile',
      icon: isAdmin ? ShieldAlert : User,
      active: isAdmin ? currentView === 'admin' : currentView === 'profile',
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-1 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative group cursor-pointer ${
                isActive
                  ? 'text-purple-600 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[8px] font-mono px-1 py-0.2 rounded-full font-bold shadow-sm ${
                      item.badgeColor || 'bg-purple-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-bold text-purple-700' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
