import React, { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CandlestickChart,
  Radio,
  Zap,
  User,
  ShieldAlert,
  LogOut,
  Camera,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Logo } from './Logo.tsx';
import { ProfilePictureModal } from '../profile/ProfilePictureModal.tsx';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  hasLiveClassNow: boolean;
  activeSignalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen = true,
  onClose,
  hasLiveClassNow,
  activeSignalsCount,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [isDPModalOpen, setIsDPModalOpen] = useState(false);

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
      badgeColor: 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
    },
    {
      id: 'signals',
      label: 'Signals',
      icon: Zap,
      badge: `${activeSignalsCount} Active`,
      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200'
    },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container - Adaptive Mobile Drawer & Desktop Frame */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 h-[100dvh] max-h-screen w-64 sm:w-72 lg:w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-xs ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Zone and Navigation List */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 bg-white shrink-0">
            <div
              onClick={() => {
                handleNavClick('home');
              }}
              className="flex items-center cursor-pointer"
              title="Learn and Grow"
            >
              <Logo size="sm" showText={true} isLive={hasLiveClassNow} />
            </div>

            {/* Mobile / Tablet Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close Navigation Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation List - Smooth internal scroll */}
          <div className="px-3 py-4 space-y-1 overflow-y-auto flex-1 min-h-0">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'signals' && (currentView === 'spot' || currentView === 'futures'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-600/25 font-black'
                      : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Panel Link */}
            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-slate-200">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Admin Panel</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Card at Bottom of Sidebar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 shrink-0 mt-auto sticky bottom-0 z-10">
          {user ? (
            <div className="flex items-center justify-between">
              <div
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 mr-1"
              >
                <div className="relative group shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shrink-0 overflow-hidden shadow-sm">
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
                    className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow border border-white"
                    title="Set Profile Picture from Gallery"
                  >
                    <Camera className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name || user.email}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors shadow-sm"
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
    </>
  );
};
