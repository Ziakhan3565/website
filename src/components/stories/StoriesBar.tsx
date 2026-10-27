import React from 'react';
import { Plus, Radio, Sparkles, TrendingUp, Zap } from 'lucide-react';
import type { StoryItem } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface StoriesBarProps {
  stories: StoryItem[];
  onSelectStory: (index: number) => void;
  onOpenCreateStory: () => void;
  className?: string;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onSelectStory,
  onOpenCreateStory,
  className = '',
}) => {
  const { user, isAdmin } = useAuth();

  return (
    <div
      className={`relative rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#16130b] via-[#10111a] to-[#0a0b12] border border-amber-500/35 shadow-xl overflow-hidden ${className}`}
    >
      {/* Background ambient gold gradient */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar for stories */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Learn & Grow Stories</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
            Daily Bias • VIP Results • Live Desks
          </span>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenCreateStory}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-black text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Post Story</span>
          </button>
        )}
      </div>

      {/* Stories Horizontal Tray */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-none select-none">
        {/* Slot 1: Post / Upload Story Button (Shown for Admin or User) */}
        <div
          onClick={onOpenCreateStory}
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
        >
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 bg-gradient-to-tr from-[#ffd700] via-[#f59e0b] to-[#b45309] shadow-md group-hover:scale-105 transition-all">
            <div className="w-full h-full rounded-full bg-[#11121d] flex flex-col items-center justify-center border border-amber-400/40 relative overflow-hidden">
              <img
                src={user?.avatarUrl || '/logo.png'}
                alt="Your Profile"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-md">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>
            {/* Plus badge on bottom edge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-[#0a0b12] flex items-center justify-center text-black">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-semibold text-neutral-300 group-hover:text-amber-300 text-center max-w-[70px] truncate">
            {isAdmin ? 'Add Story' : 'Your Story'}
          </span>
        </div>

        {/* Story Circles */}
        {stories.map((story, idx) => {
          const isLiveTag = story.tag === 'LIVE NOW';
          return (
            <div
              key={story.id}
              onClick={() => onSelectStory(idx)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 ${
                  isLiveTag
                    ? 'bg-gradient-to-tr from-rose-500 via-amber-400 to-red-600 animate-pulse shadow-lg shadow-rose-500/30'
                    : 'bg-gradient-to-tr from-[#ffd700] via-[#f59e0b] to-[#b45309] shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-black border-2 border-[#0c0d15] relative">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Subtle inner dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Badge Indicator on Story Ring */}
                {isLiveTag ? (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-rose-600 text-[8px] font-mono font-black text-white uppercase tracking-wider shadow-sm flex items-center gap-0.5 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                ) : (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-amber-500 text-[8px] font-mono font-bold text-black uppercase tracking-wider shadow-sm whitespace-nowrap">
                    {story.tag === 'DAILY BIAS' ? 'BIAS' : story.tag === 'VIP GAIN' ? 'GAIN' : 'UPDATE'}
                  </span>
                )}
              </div>

              {/* Author / Title beneath circle */}
              <div className="flex flex-col items-center max-w-[76px] text-center">
                <span className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate w-full">
                  {story.title.split(':')[0] || story.authorName}
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">
                  {story.tag.toLowerCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
