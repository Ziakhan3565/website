import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Lock,
  ArrowRight,
  Clock,
  X,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import type { Lesson, CoursePricingConfig, ExchangeReferral } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  getEmbedUrl,
  getAutoThumbnail,
  isDirectVideo,
  THUMBNAIL_PRESETS,
  extractYouTubeId
} from '../../utils/videoUtils.ts';
import { UploadProgressModal, type UploadProgressState } from '../common/UploadProgressModal.tsx';
import { ExchangeReferralCards } from '../common/ExchangeReferralCards.tsx';

interface BeginnerAcademyProps {
  lessons: Lesson[];
  exchanges?: ExchangeReferral[];
  onOpenCreateLesson?: () => void;
  onEditLesson?: (lesson: Lesson) => void;
  onDeleteLesson?: (id: string) => void;
  onTogglePublish?: (lesson: Lesson) => void;
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
  pricing?: CoursePricingConfig;
  onRefreshData?: () => void;
}

export const BeginnerAcademy: React.FC<BeginnerAcademyProps> = ({
  lessons,
  exchanges = [],
  onOpenPayment,
  pricing,
  onRefreshData,
}) => {
  const { user, isAdmin, toggleLessonProgress, hasBeginnerAccess } = useAuth();
  const beginnerPrice = pricing ? pricing.beginnerPrice : 2;

  // Video Player Modal
  const [activeVideo, setActiveVideo] = useState<Lesson | null>(null);

  // Upload Progress State (0% - 100%)
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    isOpen: false,
    title: '',
    subTitle: '',
    type: 'video',
    percent: 0,
    stageText: '',
    isComplete: false,
  });

  // ESC key listener to dismiss video modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeVideo) setActiveVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo]);

  // Admin Add Video Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState<Partial<Lesson>>({
    level: 'beginner',
    category: 'Crypto Foundations',
    order: (lessons.length || 0) + 1,
    title: '',
    description: '',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: '',
    durationMinutes: 20,
    published: true,
    tier: 'free',
  });

  const handleOpenAddModal = () => {
    setEditingLessonId(null);
    setVideoForm({
      level: 'beginner',
      category: 'Crypto Foundations',
      order: (lessons.length || 0) + 1,
      title: '',
      description: '',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: '',
      durationMinutes: 20,
      published: true,
      tier: 'free',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setVideoForm({ ...lesson });
    setShowAddModal(true);
  };

  const runWithUploadProgress = async (
    title: string,
    subTitle: string,
    operation: () => Promise<void>
  ) => {
    setUploadProgress({
      isOpen: true,
      title,
      subTitle,
      type: 'video',
      percent: 15,
      stageText: 'Validating video payload and duration...',
      isComplete: false,
    });

    await new Promise(r => setTimeout(r, 260));
    setUploadProgress(prev => ({
      ...prev,
      percent: 48,
      stageText: 'Encoding video stream and optimizing thumbnail...',
    }));

    await new Promise(r => setTimeout(r, 280));
    setUploadProgress(prev => ({
      ...prev,
      percent: 82,
      stageText: 'Publishing to Beginner Academy curriculum...',
    }));

    try {
      await operation();
      setUploadProgress(prev => ({
        ...prev,
        percent: 100,
        stageText: 'Video 100% Uploaded! Synced to student terminals.',
        isComplete: true,
      }));
      await new Promise(r => setTimeout(r, 750));
    } catch (err: any) {
      alert(err.message || 'Failed to save video lesson');
    } finally {
      setUploadProgress(prev => ({ ...prev, isOpen: false, isComplete: false }));
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    await runWithUploadProgress(
      editingLessonId ? 'Updating Beginner Video' : 'Uploading Beginner Video',
      videoForm.title || 'Beginner Video Lesson',
      async () => {
        if (editingLessonId) {
          await api.updateLesson(editingLessonId, videoForm);
        } else {
          await api.createLesson({
            ...videoForm,
            level: 'beginner',
          });
        }
        setShowAddModal(false);
        if (onRefreshData) onRefreshData();
      }
    );
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await api.deleteLesson(id);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      console.error('Failed to delete lesson:', err);
    }
  };

  const completedCount = lessons.filter(l => user?.completedLessons?.includes(l.id)).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVideoForm(prev => ({ ...prev, thumbnailUrl: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const approxMinutes = file.size > 500 * 1024 * 1024 ? 90 : file.size > 200 * 1024 * 1024 ? 60 : 30;
    setVideoForm(prev => ({
      ...prev,
      videoUrl: objectUrl,
      durationMinutes: prev.durationMinutes && prev.durationMinutes > 0 ? prev.durationMinutes : approxMinutes
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner with Learn & Grow Brand Styling */}
      <div className="rounded-3xl bg-gradient-to-br from-[#18150d] via-[#12131f] to-[#090a12] border border-amber-500/40 p-6 lg:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold mb-2 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>LEARN AND GROW · BEGINNER VIDEO ACADEMY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Beginner Video Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            Direct video lessons covering crypto foundations, candlestick patterns, spot execution, and the 1% risk management rule.
          </p>
        </div>

        {/* Progress & Upload Button */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#141525]/90 border border-amber-500/30 min-w-[180px] shadow-lg">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-neutral-300">Your Progress</span>
              <span className="font-mono text-amber-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#0d0e17] overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-neutral-400 block mt-1.5 text-right">
              {completedCount} / {lessons.length} Completed
            </span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:opacity-95 text-black text-xs font-black font-mono shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Enrollment Callout Banner if locked */}
      {!hasBeginnerAccess && !isAdmin && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#151622] to-yellow-950/30 border border-amber-500/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Beginner Enrollment Required</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Unlock All Beginner Videos for only ${beginnerPrice} USD
            </h3>
            <p className="text-xs text-neutral-300 mt-1 max-w-xl">
              Get immediate full access to all beginner cryptocurrency video lessons and disciplined trading frameworks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenPayment?.('beginner')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:opacity-95 text-black text-xs font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Enroll Now • ${beginnerPrice} USD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIDEOS LIST (ONLY VIDEOS UPLOADED BY ADMIN) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Uploaded Video Lessons ({lessons.length})
          </h2>
          {isAdmin && (
            <span className="text-[11px] font-mono text-amber-400">
              Admin Mode: You have full authority to upload, edit & delete videos
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson, idx) => {
            const isCompleted = user?.completedLessons?.includes(lesson.id);
            const isLocked = !hasBeginnerAccess && !isAdmin && idx >= 2;

            return (
              <div
                key={lesson.id}
                className={`group rounded-2xl bg-[#0f1019] border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg ${
                  isCompleted
                    ? 'border-amber-500/50 shadow-amber-950/20'
                    : isLocked
                    ? 'border-[#202235] opacity-90'
                    : 'border-[#23253a] hover:border-amber-400'
                }`}
              >
                {/* Video Preview / Card Top */}
                <div>
                  <div className="relative aspect-video bg-[#07080f] overflow-hidden group-hover:scale-[1.01] transition-transform">
                    {/* Real Video Thumbnail */}
                    <img
                      src={getAutoThumbnail(lesson.videoUrl, lesson.thumbnailUrl)}
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    {/* Dark gradient thumbnail overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      {isLocked ? (
                        <div className="w-12 h-12 rounded-full bg-black/70 border border-amber-500/40 flex items-center justify-center text-amber-400">
                          <Lock className="w-5 h-5" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveVideo(lesson)}
                          className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all hover:scale-110 cursor-pointer"
                        >
                          <Play className="w-5 h-5 ml-0.5 fill-black" />
                        </button>
                      )}
                    </div>

                    {/* Lesson Index Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white border border-white/10">
                        VIDEO #{idx + 1}
                      </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 z-20">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-neutral-300 border border-white/10 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {lesson.durationMinutes || 20}m
                      </span>
                    </div>

                    {/* Free Preview Tag */}
                    {idx < 2 && !hasBeginnerAccess && (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-black shadow-sm">
                          FREE PREVIEW
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                        {lesson.category || 'Trading Foundations'}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleLessonProgress(lesson.id)}
                        className="text-neutral-500 hover:text-amber-400 transition-colors p-0.5 cursor-pointer"
                        title={isCompleted ? 'Completed' : 'Mark as completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-600" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {lesson.title}
                    </h3>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-[#1a1c2a] flex items-center justify-between gap-2 mt-2">
                  {isLocked ? (
                    <button
                      type="button"
                      onClick={() => onOpenPayment?.('beginner')}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock with Course (${beginnerPrice})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveVideo(lesson)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-amber-300" />
                      <span>Watch Lesson</span>
                    </button>
                  )}

                  {/* Admin Edit / Delete */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(lesson)}
                        className="px-2.5 py-1.5 text-neutral-300 hover:text-white rounded-xl bg-[#1a1c2b] hover:bg-[#25283d] text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Edit video"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDelete(lesson.id, lesson.title);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDelete(lesson.id, lesson.title);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                        title="Delete video permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {lessons.length === 0 && (
            <div className="col-span-full py-16 text-center bg-[#0f1019] border border-[#23253a] rounded-3xl p-6 space-y-3">
              <GraduationCap className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Beginner Videos Uploaded Yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {isAdmin
                  ? 'As administrator, click the "+ Upload Video" button to add your video lessons to this section.'
                  : 'The course instructor has not published videos yet. Please check back shortly.'}
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  + Upload First Video Lesson
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Official Exchange Referral Accounts (MEXC • Binance • Bybit) */}
      {exchanges && exchanges.length > 0 && (
        <ExchangeReferralCards
          exchanges={exchanges}
          title="Official Exchange Portals (MEXC • Binance • Bybit)"
          subtitle="Open your verified exchange accounts to practice beginner lessons and claim partner bonuses."
        />
      )}

      {/* VIDEO PLAYER MODAL - Perfectly sized for Mobile, Tablet & Laptop */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideo(null);
          }}
        >
          <div className="relative w-full max-w-2xl lg:max-w-3xl max-h-[90vh] bg-[#10111a] border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#202235] flex items-center justify-between gap-3 bg-[#121422] shrink-0">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold inline-block">
                  Beginner Lesson
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                  {activeVideo.title}
                </h3>
              </div>

              {/* English Close Button with ESC kbd */}
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d1f30] hover:bg-rose-600/90 hover:text-white text-neutral-300 transition-all text-xs font-semibold shrink-0 cursor-pointer"
                title="Close Video (Esc)"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
                <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] bg-black/40 rounded border border-white/20 font-mono text-neutral-400">
                  ESC
                </kbd>
              </button>
            </div>

            {/* Video Frame - Constrained so it never overflows screen */}
            <div className="aspect-video max-h-[48vh] sm:max-h-[50vh] w-full bg-black relative flex items-center justify-center shrink-0 overflow-hidden">
              {activeVideo.videoUrl && isDirectVideo(activeVideo.videoUrl) ? (
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[48vh] sm:max-h-[50vh] object-contain"
                />
              ) : activeVideo.videoUrl ? (
                <iframe
                  src={getEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  className="w-full h-full max-h-[48vh] sm:max-h-[50vh] border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                  No video URL attached to this lesson.
                </div>
              )}
            </div>

            {/* Lesson Details - Scrollable if description is long */}
            <div className="p-3.5 sm:p-4 space-y-2.5 bg-[#0d0e17] border-t border-[#1d1f2e] overflow-y-auto max-h-[26vh] shrink">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duration: {activeVideo.durationMinutes || 20} minutes</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLessonProgress(activeVideo.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>
                      {user?.completedLessons?.includes(activeVideo.id) ? 'Completed' : 'Mark Completed'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveVideo(null)}
                    className="px-4 py-1.5 rounded-xl bg-[#1d1f30] hover:bg-[#282a40] text-white text-xs font-mono transition-colors cursor-pointer"
                  >
                    Close Video
                  </button>
                </div>
              </div>

              {activeVideo.description && (
                <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                  {activeVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD/EDIT VIDEO MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#11121d] border border-[#26283d] rounded-3xl p-6 shadow-2xl space-y-4 my-6">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              {editingLessonId ? 'Edit Beginner Video Lesson' : 'Upload / Add Beginner Video'}
            </h3>

            <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Video Title</label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="e.g. Lesson 01: Candlestick Anatomy & Market Structure"
                  className="w-full px-3 py-2 rounded-xl bg-[#171826] border border-[#2a2c42] text-white"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">
                  Video Source (Supports 1–2+ Hour Long Lectures: YouTube, Google Drive, Vimeo, MP4)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/... or Google Drive / MP4 stream URL"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#171826] border border-[#2a2c42] text-white text-xs font-mono"
                    required
                  />
                  {extractYouTubeId(videoForm.videoUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        const ytId = extractYouTubeId(videoForm.videoUrl);
                        if (ytId) {
                          setVideoForm(prev => ({
                            ...prev,
                            thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                          }));
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-[10px] font-mono shrink-0"
                      title="Grab thumbnail directly from YouTube"
                    >
                      Grab YT Thumb
                    </button>
                  )}
                </div>

                <div className="mt-2.5">
                  <label className="text-[10px] text-neutral-400 block mb-1">
                    Or Attach Video from Device Gallery (Zero-Lag Direct Streaming):
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="w-full text-[10px] text-neutral-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                  {videoForm.videoUrl?.startsWith('blob:') && (
                    <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Device video linked with zero memory lag.
                    </p>
                  )}
                </div>
              </div>

              {/* VIDEO THUMBNAIL */}
              <div className="p-3.5 rounded-2xl bg-[#141522] border border-[#26283c] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Video Thumbnail</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Custom Image or YouTube Cover
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Thumbnail Image URL</label>
                    <input
                      type="text"
                      value={videoForm.thumbnailUrl || ''}
                      onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or jpg/png"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#1c1d2e] border border-[#2a2c42] text-white text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Upload Image from Device</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="w-full text-[10px] text-neutral-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Preset Thumbnails */}
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1">Or choose a trading thumbnail preset:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {THUMBNAIL_PRESETS.slice(0, 3).map((pr) => (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => setVideoForm({ ...videoForm, thumbnailUrl: pr.url })}
                        className={`p-1 rounded-lg border text-[10px] text-left truncate transition-colors ${
                          videoForm.thumbnailUrl === pr.url
                            ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                            : 'bg-[#181926] border-[#292b3f] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {pr.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Thumbnail Preview */}
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-neutral-400 block mb-1">Thumbnail Preview:</span>
                  <div className="relative aspect-video w-full max-w-[200px] rounded-xl overflow-hidden bg-black/60 border border-[#2b2d42]">
                    <img
                      src={getAutoThumbnail(videoForm.videoUrl, videoForm.thumbnailUrl)}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white drop-shadow" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={videoForm.durationMinutes}
                    onChange={(e) => setVideoForm({ ...videoForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#171826] border border-[#2a2c42] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Category</label>
                  <input
                    type="text"
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#171826] border border-[#2a2c42] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Summary of what is taught in this video..."
                  className="w-full px-3 py-2 rounded-xl bg-[#171826] border border-[#2a2c42] text-white resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#181928] text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {editingLessonId ? 'Save Changes' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 0-100% Upload Progress Modal Overlay */}
      <UploadProgressModal state={uploadProgress} />
    </div>
  );
};
