import React, { useState } from 'react';
import {
  Menu,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { MarketTicker } from '../../types/index.ts';
import { Logo } from './Logo.tsx';
import { TopNavModals } from '../navigation/TopNavModals.tsx';
import { ProfilePictureModal } from '../profile/ProfilePictureModal.tsx';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  tickers: MarketTicker[];
  isMarketStale: boolean;
  hasLiveClassNow?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  hasLiveClassNow = false,
  sidebarOpen = true,
  onToggleSidebar,
}) => {
  const { user, isAdmin, isPremium, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDPModalOpen, setIsDPModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'channel' | 'service' | 'about' | 'feedback' | null>(null);

  const handleLogoClick = () => {
    onNavigate('home');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Left: Brand Logo & Desktop Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 transition-all cursor-pointer shadow-xs"
              aria-label="Toggle Navigation Sidebar"
              title="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={handleLogoClick}
              className="cursor-pointer"
              title="Learn and Grow"
            >
              <Logo size="md" showText={true} isLive={hasLiveClassNow} />
            </div>
          </div>

          {/* Right Actions: Login & Sign Up or User Profile Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 sm:px-5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-purple-400 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 sm:px-6 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate hidden sm:block">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs overflow-hidden shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          (user.name || user.email || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name || user.email}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-0.5 text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {isAdmin ? 'ADMINISTRATOR' : isPremium ? 'VIP MEMBER' : 'REGISTERED USER'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsDPModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      Upload Profile Picture (DP)
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                      My Profile
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Admin Control Panel
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Top Navigation Modals for Channel, Service, About, Feedback */}
      <TopNavModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      {/* User Profile Picture (DP) Modal */}
      <ProfilePictureModal
        isOpen={isDPModalOpen}
        onClose={() => setIsDPModalOpen(false)}
      />
    </>
  );
};
