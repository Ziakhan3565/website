import React from 'react';
import {
  Bell,
  Calendar,
  AlertTriangle,
  Info,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react';
import type { Announcement } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onOpenCreateAnnouncement?: () => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onOpenCreateAnnouncement,
  onDeleteAnnouncement,
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#171717] border border-[#2a2a2a] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#10a37f]/15 border border-[#10a37f]/30 text-[#19c37d] text-xs font-mono mb-2">
              <Bell className="w-3.5 h-3.5" /> OFFICIAL DISPATCHES & NOTICES
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Announcements & Market Briefs
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Stay synchronized with live class schedule adjustments, market volatility warnings, and regulatory notices directly from the Learn and Grow trading team.
            </p>
          </div>

          {isAdmin && onOpenCreateAnnouncement && (
            <button
              onClick={onOpenCreateAnnouncement}
              className="px-4 py-2.5 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(16,163,127,0.3)] transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Post Announcement
            </button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => {
          const isUrgent = ann.priority === 'Urgent';
          const isHigh = ann.priority === 'High';

          return (
            <div
              key={ann.id}
              className={`p-5 rounded-xl border transition-all ${
                isUrgent
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : isHigh
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-[#171717] border-[#2a2a2a]'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    isUrgent
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isHigh
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-[#262626] text-neutral-400'
                  }`}>
                    {ann.priority} Priority
                  </span>
                  <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {ann.date}
                  </span>
                </div>

                {isAdmin && onDeleteAnnouncement && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteAnnouncement(ann.id);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteAnnouncement(ann.id);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                    title="Delete Announcement Permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white">
                {ann.title}
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                {ann.content}
              </p>

              <div className="mt-3 pt-2 border-t border-[#262626] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>Dispatched by: <strong className="text-neutral-300">{ann.author}</strong></span>
                <span className="flex items-center gap-1 text-[#10a37f]">
                  <ShieldCheck className="w-3 h-3" /> Verified Official Notice
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
