import React, { useState } from 'react';
import {
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Share2,
  Headphones,
  HelpCircle,
  MessageSquare,
  GraduationCap,
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
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  tickers: MarketTicker[];
  isMarketStale: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { user, isAdmin, isPremium, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDPModalOpen, setIsDPModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'channel' | 'service' | 'about' | 'feedback' | null>(null);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0b0c10]/95 backdrop-blur-md border-b border-[#1f2029] px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1b24] lg:hidden transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div onClick={() => onNavigate('home')} className="cursor-pointer">
              <Logo size="md" showText={true} />
            </div>
          </div>

          {/* Center: Exactly 4 Tabs matching user's blueprint sketch: Channel | Service | About | Feedback */}
          <nav className="hidden md:flex items-center bg-[#15161e] border border-[#232533] rounded-full p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveModal('channel')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1e202d] transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Channel</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('service')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1e202d] transition-all flex items-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              <span>Service</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('about')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1e202d] transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>About</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('feedback')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1e202d] transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Feedback</span>
            </button>
          </nav>

          {/* Right Actions: Login / Register (Mobile App removed per user instruction) */}
          <div className="flex items-center gap-2.5">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-full border border-neutral-600 hover:border-white text-white hover:bg-white/5 text-xs font-bold transition-all uppercase tracking-wide"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all uppercase tracking-wide"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#15161e] border border-[#232533] hover:border-purple-500/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden sm:block">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#15161e] border border-[#232533] rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-[#232533] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          (user.name || user.email || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{user.name || user.email}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                        <span className="inline-block mt-0.5 text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {isAdmin ? 'ADMINISTRATOR' : isPremium ? 'VIP MEMBER' : 'REGISTERED USER'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsDPModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-purple-300 hover:text-white hover:bg-[#1f202d] flex items-center gap-2"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-400" />
                      Set Profile Picture (DP)
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-[#1f202d] flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                      My Profile
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-[#1f202d] flex items-center gap-2 font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        Admin Control Panel
                      </button>
                    )}

                    <div className="border-t border-[#232533] my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-[#1f202d] flex items-center gap-2"
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
