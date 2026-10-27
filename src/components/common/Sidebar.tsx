import React, { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CandlestickChart,
  Radio,
  Zap,
  User,
  ShieldAlert,
  ArrowUpRight,
  LogOut,
  Camera,
  Share2,
  Headphones,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Logo } from './Logo.tsx';
import { ProfilePictureModal } from '../profile/ProfilePictureModal.tsx';
import { TopNavModals } from '../navigation/TopNavModals.tsx';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  hasLiveClassNow: boolean;
  activeSignalsCount: number;
  hasStories?: boolean;
  onOpenStory?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  hasLiveClassNow,
  activeSignalsCount,
  hasStories = false,
  onOpenStory,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [isDPModalOpen, setIsDPModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'channel' | 'service' | 'about' | 'feedback' | null>(null);

  // Exactly matching the user's hand-drawn architecture sketch:
  // Profile | Home | Beginner | Advance | Live | Signals
  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'beginner', label: 'Beginner', icon: GraduationCap },
    { id: 'advanced', label: 'Advance', icon: CandlestickChart },
    {
      id: 'live',
      label: 'Live',
      icon: Radio,
      badge: hasLiveClassNow ? 'LIVE' : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
    },
    {
      id: 'signals',
      label: 'Signals',
      icon: Zap,
      badge: `${activeSignalsCount} Active`,
      badgeColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
    },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container - Permanently pinned to viewport left, never scrolls up */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 h-[100dvh] max-h-screen w-60 bg-[#0e0f15] border-r border-[#1f2029] flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Zone and Navigation List */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#1f2029] bg-[#0b0c10] shrink-0">
            <div
              onClick={() => {
                if (hasStories && onOpenStory) {
                  onOpenStory();
                  onCloseMobile();
                } else {
                  handleNavClick(hasLiveClassNow ? 'live' : 'home');
                }
              }}
              className="flex items-center cursor-pointer"
              title={hasStories ? 'Click to Watch Learn & Grow Stories' : 'Learn and Grow'}
            >
              <Logo size="sm" showText={true} isLive={hasLiveClassNow} hasStories={hasStories} />
            </div>
          </div>

          {/* Navigation List - Smooth internal scroll */}
          <div className="px-3 py-4 space-y-1.5 overflow-y-auto flex-1 min-h-0">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'signals' && (currentView === 'spot' || currentView === 'futures'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black shadow-lg shadow-amber-500/25 font-black'
                      : 'text-neutral-400 hover:text-amber-300 hover:bg-[#161724]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-black/25 text-black font-black' : item.badgeColor || 'bg-[#1f2029] text-neutral-400'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Panel Link: ONLY visible when authenticated user is genuinely Admin */}
            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-[#1f2029]">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    currentView === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-400 hover:text-amber-300 hover:bg-[#161722]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Admin Panel</span>
                  </div>
                </button>
              </div>
            )}

            {/* Mobile & Tablet Top Nav Menu Items: Channel, Service, About, Feedback */}
            <div className="pt-3 mt-3 border-t border-[#1f2029] md:hidden">
              <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                Desk & Community
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('channel');
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#161722] text-xs font-semibold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Channel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('service');
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#161722] text-xs font-semibold transition-colors"
                >
                  <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Service</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('about');
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#161722] text-xs font-semibold transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>About</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('feedback');
                    onCloseMobile();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#161722] text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Feedback</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Card at Bottom of Sidebar - Permanently docked at bottom corner */}
        <div className="p-3 border-t border-[#1f2029] bg-[#0b0c10] shrink-0 mt-auto sticky bottom-0 z-10">
          {user ? (
            <div className="flex items-center justify-between">
              <div
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 mr-1"
              >
                <div className="relative group shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-xs font-black text-black shrink-0 overflow-hidden shadow-sm">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDPModalOpen(true);
                    }}
                    className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow border border-amber-300 opacity-85 group-hover:opacity-100 transition-opacity"
                    title="Set Profile Picture from Gallery"
                  >
                    <Camera className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user.name || user.email}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-[#1a1b26] transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2 rounded-xl bg-[#171825] hover:bg-[#1f2030] text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Sign In to Account
            </button>
          )}
        </div>
      </aside>

      {/* User Profile Picture (DP) Modal */}
      <ProfilePictureModal
        isOpen={isDPModalOpen}
        onClose={() => setIsDPModalOpen(false)}
      />

      {/* Top Navigation Modals on Mobile & Tablet */}
      <TopNavModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};
