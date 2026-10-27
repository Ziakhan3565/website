import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Eye,
  Radio,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { StoryItem } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface StoryViewerModalProps {
  isOpen: boolean;
  initialIndex: number;
  stories: StoryItem[];
  onClose: () => void;
  onDeleteStory?: (id: string) => void;
  onNavigateToSection?: (view: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  initialIndex,
  stories,
  onClose,
  onDeleteStory,
  onNavigateToSection,
}) => {
  const { isAdmin } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0); // 0 - 100
  const [isPaused, setIsPaused] = useState(false);
  const STORY_DURATION_MS = 5000; // 5 seconds per story

  const activeStory = stories[currentIndex] || stories[0];

  // Sync index if initial changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialIndex]);

  // Timer loop for story progress
  useEffect(() => {
    if (!isOpen || isPaused || !activeStory) return;

    const intervalTime = 50; // 50ms tick
    const increment = (intervalTime / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          // Advance to next story or close if last
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((curr) => curr + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentIndex, stories.length, activeStory, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, stories.length]);

  if (!isOpen || !activeStory) return null;

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((curr) => curr + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((curr) => curr - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  };

  const handleActionClick = () => {
    if (activeStory.linkView && onNavigateToSection) {
      onClose();
      onNavigateToSection(activeStory.linkView);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Delete this story from Learn & Grow?')) {
      if (onDeleteStory) {
        onDeleteStory(activeStory.id);
        if (stories.length <= 1) {
          onClose();
        } else {
          handleNext();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Story Container (Phone/Card aspect ratio) */}
      <div
        className="relative z-10 w-full max-w-md h-[90vh] max-h-[780px] bg-[#0c0d15] rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeStory.imageUrl}
            alt={activeStory.title}
            className="w-full h-full object-cover brightness-[0.85]"
          />
          {/* Top & Bottom gradient scrims for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black/95" />
          {/* Subtle gold ambient glow on borders */}
          <div className="absolute inset-0 border border-amber-500/20 rounded-3xl pointer-events-none" />
        </div>

        {/* TOP CONTROLS LAYER */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => {
              let fillPercent = 0;
              if (idx < currentIndex) fillPercent = 100;
              else if (idx === currentIndex) fillPercent = progress;
              else fillPercent = 0;

              return (
                <div
                  key={s.id}
                  className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-[width] duration-75 ease-linear"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-md">
                <img
                  src={activeStory.authorAvatar || '/logo.png'}
                  alt={activeStory.authorName}
                  className="w-full h-full object-cover rounded-full bg-black"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {activeStory.authorName}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span className="text-[10px] text-neutral-300 font-mono">
                    {new Date(activeStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-amber-300/90 font-bold uppercase">
                    {activeStory.tag}
                  </span>
                  {activeStory.viewsCount && (
                    <span className="text-[9px] font-mono text-neutral-400 flex items-center gap-0.5">
                      <Eye className="w-2.5 h-2.5" />
                      {activeStory.viewsCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Right Actions: Pause/Play, Delete (Admin), Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused((p) => !p);
                }}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {isAdmin && onDeleteStory && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-1.5 rounded-full bg-rose-600/60 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer"
                  title="Delete this Story"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* INVISIBLE TAP ZONES (Left 30% for Prev, Right 70% for Next) */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          />
        </div>

        {/* BOTTOM CONTENT LAYER */}
        <div className="relative z-20 p-5 space-y-3 pointer-events-auto">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold tracking-wider">
            {activeStory.tag === 'LIVE NOW' ? (
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{activeStory.tag}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-md">
            {activeStory.title}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-black/60 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            {activeStory.caption}
          </p>

          {/* Action Button Link (e.g. Join Live / Signals) */}
          {activeStory.linkText && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{activeStory.linkText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Navigation helpers */}
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1">
            <span>Tap left: previous</span>
            <span>Hold to pause</span>
            <span>Tap right: next</span>
          </div>
        </div>
      </div>
    </div>
  );
};
