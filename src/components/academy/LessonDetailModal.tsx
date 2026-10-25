import React from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  Clock,
  PlayCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import type { Lesson } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface LessonDetailModalProps {
  lesson: Lesson;
  onClose: () => void;
  onNavigateLesson?: (dir: 'next' | 'prev') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  onClose,
  onNavigateLesson,
  hasPrev = false,
  hasNext = false,
}) => {
  const { user, toggleLessonProgress } = useAuth();
  const isCompleted = user?.completedLessons.includes(lesson.id);

  // Helper to determine if video is direct file/blob or embed
  const isDirectVideo = (url: string) => {
    return url.startsWith('data:video') || url.startsWith('blob:') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
  };

  // Helper to get safe video embed url
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#171717] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#141414]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-[#10a37f]/15 text-[#19c37d] border border-[#10a37f]/30 font-semibold">
              {lesson.level === 'beginner' ? 'Beginner Crash Course' : 'Advanced Crash Course'}
            </span>
            <span className="text-xs text-neutral-400 hidden sm:inline">
              Category: <strong className="text-neutral-200">{lesson.category}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLessonProgress(lesson.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isCompleted
                  ? 'bg-[#10a37f]/20 text-[#19c37d] border border-[#10a37f]/40'
                  : 'bg-[#212121] text-neutral-300 hover:bg-[#2a2a2a] border border-[#2e2e2e]'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10a37f]" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-neutral-400" />
                  Mark Complete
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#212121] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {lesson.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" /> {lesson.durationMinutes} min video duration
              </span>
              <span>·</span>
              <span>Module #{lesson.order}</span>
              <span>·</span>
              <span className="uppercase text-neutral-300">{lesson.tier} Access</span>
            </div>
            <p className="mt-3 text-sm text-neutral-300 leading-relaxed border-l-2 border-[#10a37f]/60 pl-3 italic">
              {lesson.description}
            </p>
          </div>

          {/* Embedded or Direct Uploaded Video Player */}
          {lesson.videoUrl && (
            <div className="rounded-xl overflow-hidden border border-[#2a2a2a] bg-black aspect-video relative shadow-lg">
              {isDirectVideo(lesson.videoUrl) ? (
                <video
                  src={lesson.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={getEmbedUrl(lesson.videoUrl)}
                  title={lesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          )}

          {/* Text Lesson Content */}
          <div className="bg-[#212121] rounded-xl p-5 sm:p-6 border border-[#2e2e2e]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#10a37f]" /> Curriculum Study Text
            </h3>
            <div className="prose prose-invert prose-sm max-w-none space-y-4 text-neutral-200 leading-relaxed font-sans">
              {lesson.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-base font-bold text-white mt-4 border-b border-[#2e2e2e] pb-1">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('#### ')) {
                  return (
                    <h4 key={idx} className="text-sm font-semibold text-[#19c37d] mt-3">
                      {paragraph.replace('#### ', '')}
                    </h4>
                  );
                }
                return <p key={idx} className="text-sm text-neutral-300">{paragraph}</p>;
              })}
            </div>
          </div>

          {/* Downloadable Notes & PDF Attachments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.downloadableNotes && (
              <div className="p-4 rounded-xl bg-[#212121] border border-[#2e2e2e]">
                <h4 className="text-xs font-mono uppercase text-neutral-400 font-semibold mb-1">
                  Desk Key Takeaways
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {lesson.downloadableNotes}
                </p>
              </div>
            )}

            {lesson.pdfUrl && (
              <div className="p-4 rounded-xl bg-[#212121] border border-[#2e2e2e] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {lesson.pdfTitle || 'Download Lesson Course PDF'}
                    </h5>
                    <p className="text-[10px] text-neutral-400 font-mono">Verified Institutional PDF Notes</p>
                  </div>
                </div>

                <a
                  href={lesson.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-3.5 border-t border-[#262626] bg-[#141414] flex items-center justify-between">
          <button
            onClick={() => onNavigateLesson && onNavigateLesson('prev')}
            disabled={!hasPrev}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              hasPrev ? 'bg-[#212121] text-neutral-200 hover:bg-[#2a2a2a] border border-[#2e2e2e]' : 'opacity-40 cursor-not-allowed text-neutral-500'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous Lesson
          </button>

          <div className="text-xs font-mono text-neutral-400">
            {isCompleted ? (
              <span className="text-[#10a37f] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed by You
              </span>
            ) : (
              <span>Not Completed</span>
            )}
          </div>

          <button
            onClick={() => onNavigateLesson && onNavigateLesson('next')}
            disabled={!hasNext}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              hasNext ? 'bg-[#10a37f] text-white hover:bg-[#19c37d] shadow-[0_0_15px_rgba(16,163,127,0.3)]' : 'opacity-40 cursor-not-allowed text-neutral-500'
            }`}
          >
            Next Lesson <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
