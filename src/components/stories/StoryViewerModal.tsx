import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  ShieldCheck,
  Eye,
  Radio,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';
import type { StoryItem } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { storiesService } from '../../services/storiesService.ts';

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
  const [currentStories, setCurrentStories] = useState<StoryItem[]>(stories);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0); // 0 - 100
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef<boolean>(false);
  const STORY_DURATION_MS = 6000; // 6 seconds per story

  // Synchronize internal currentStories with incoming stories prop
  useEffect(() => {
    if (stories && stories.length > 0) {
      setCurrentStories(stories);
    }
  }, [stories]);

  const activeStory = currentStories[currentIndex] || currentStories[0];

  // Sync index if initial changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setIsPaused(false);
      setToastMessage(null);
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
          if (currentIndex < currentStories.length - 1) {
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
  }, [isOpen, isPaused, currentIndex, currentStories.length, activeStory, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
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
  }, [isOpen, currentIndex, currentStories.length]);

  if (!isOpen || !activeStory) return null;

  const handleNext = () => {
    if (currentIndex < currentStories.length - 1) {
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

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStory.linkView && onNavigateToSection) {
      onClose();
      onNavigateToSection(activeStory.linkView);
    }
  };

  // Instant 1-Click Story Deletion: triggers storiesService.deleteStory with the correct ID and updates UI state
  const handleDeleteStoryImmediate = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      if ('preventDefault' in e) {
        e.preventDefault();
      }
    }
    if (!activeStory) return;
    const idToDelete = activeStory.id;

    // 1. Trigger storiesService.deleteStory method with the correct ID
    const updated = storiesService.deleteStory(idToDelete);

    // 2. Immediately update local UI state to remove story from the view
    setCurrentStories(updated);
    setToastMessage('Story deleted successfully');

    // 3. Notify parent callback
    if (onDeleteStory) {
      onDeleteStory(idToDelete);
    }

    // 4. Adjust active story index or close modal if no stories remain
    if (updated.length === 0) {
      onClose();
    } else {
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
      setProgress(0);
    }
  };

  // Long press detection for pause (hold = pause, tap = next)
  const handleTouchOrMouseDown = () => {
    isLongPressRef.current = false;
    pressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      setIsPaused(true);
    }, 220); // 220ms threshold
  };

  const handleTouchOrMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (isLongPressRef.current) {
      setIsPaused(false);
      isLongPressRef.current = false;
    }
  };

  // Instagram / WhatsApp style 1-Click to Shift to Next Story:
  const handleStoryCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If it was a long press / hold release, don't trigger advance
    if (isLongPressRef.current) {
      return;
    }

    const target = e.target as HTMLElement;
    // Don't advance if clicked on buttons or links
    if (target.closest('button') || target.closest('a')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Left 25% jumps to previous story, everywhere else (right 75%) shifts to next story!
    if (clickX < width * 0.25) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const isVideo = activeStory.mediaType === 'video' || (activeStory.videoUrl && activeStory.videoUrl.length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in">
      {/* Background click to dismiss */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Main Story Container (Phone/Card aspect ratio) - Click anywhere shifts to next story! */}
      <div
        onClick={handleStoryCardClick}
        onMouseDown={handleTouchOrMouseDown}
        onMouseUp={handleTouchOrMouseUp}
        onTouchStart={handleTouchOrMouseDown}
        onTouchEnd={handleTouchOrMouseUp}
        className="relative z-10 w-full max-w-md h-[90vh] max-h-[780px] bg-[#0c0d15] rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl flex flex-col justify-between cursor-pointer"
        title="Tap right to advance to next story, tap left for previous"
      >
        {/* Story Background Media (Video or Image) */}
        <div className="absolute inset-0 z-0 bg-black pointer-events-none">
          {isVideo ? (
            <video
              ref={videoRef}
              src={activeStory.videoUrl || activeStory.imageUrl}
              autoPlay
              playsInline
              muted={isMuted}
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={activeStory.imageUrl}
              alt={activeStory.title}
              className="w-full h-full object-cover brightness-[0.88]"
            />
          )}
          {/* Top & Bottom gradient scrims for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black/95 pointer-events-none" />
          <div className="absolute inset-0 border border-amber-500/20 rounded-3xl pointer-events-none" />
        </div>

        {/* TOP CONTROLS LAYER */}
        <div className="relative z-30 p-4 space-y-3 pointer-events-auto">
          {/* Segmented Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {currentStories.map((s, idx) => {
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
              <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-md shrink-0">
                <img
                  src={activeStory.authorAvatar || '/logo.png'}
                  alt={activeStory.authorName}
                  className="w-full h-full object-cover rounded-full bg-black"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide truncate">
                    {activeStory.authorName}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                  <span className="text-[10px] text-neutral-300 font-mono shrink-0">
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

            {/* Top Right Actions: Audio Toggle (for video), 1-Click Delete, Close */}
            <div
              className="flex items-center gap-1.5 shrink-0 relative z-50 pointer-events-auto"
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isVideo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                </button>
              )}

              {/* 1-CLICK INSTANT DELETE (PROPER & RELIABLE ON MOBILE & DESKTOP) */}
              <button
                type="button"
                onClick={handleDeleteStoryImmediate}
                onTouchStart={(e) => e.stopPropagation()}
                className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-mono font-bold backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-600/40 relative z-50 select-none"
                title="Delete this story immediately"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Brief Toast notification */}
        {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg animate-fade-in pointer-events-none">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* BOTTOM CONTENT LAYER (POINTER-EVENTS-NONE SO TAPS ALWAYS ADVANCE STORY) */}
        <div className="relative z-20 p-5 space-y-3 pointer-events-none">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold tracking-wider">
            {activeStory.tag === 'LIVE NOW' ? (
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{activeStory.tag}</span>
            {isVideo && <span className="text-[9px] text-amber-200">· VIDEO CLIP</span>}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-md">
            {activeStory.title}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-black/60 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            {activeStory.caption}
          </p>

          {/* Action Button Link (e.g. Join Live / Signals) - ONLY THIS IS POINTER-EVENTS-AUTO */}
          {activeStory.linkText && (
            <button
              type="button"
              onClick={handleActionClick}
              className="pointer-events-auto w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-[0.98]"
            >
              <span>{activeStory.linkText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Navigation helpers */}
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1">
            <span>Tap screen: next story</span>
            <span>Hold: pause</span>
            <span>{currentIndex + 1}/{stories.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
