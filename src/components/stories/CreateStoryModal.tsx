import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  AlertCircle,
  Radio,
  Play,
  Film
} from 'lucide-react';
import type { StoryItem, StoryTag } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (story: Omit<StoryItem, 'id' | 'createdAt' | 'viewsCount'>) => void;
}

const PRESET_IMAGES = [
  {
    label: 'Bitcoin Chart',
    url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1080&q=80',
  },
  {
    label: 'VIP Terminal Profit',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1080&q=80',
  },
  {
    label: 'Live Desk Studio',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1080&q=80',
  },
  {
    label: 'Order Flow Depth',
    url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1080&q=80',
  },
  {
    label: 'Risk Management',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1080&q=80',
  },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated,
}) => {
  const { user } = useAuth();
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<StoryTag>('DAILY BIAS');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [linkText, setLinkText] = useState('Join Live Trading Desk');
  const [linkView, setLinkView] = useState('live');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    setIsUploading(true);
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setIsUploading(false);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please choose a valid video file (MP4, WebM, MOV).');
      return;
    }

    // Limit video preview size to 35MB for client-side storage
    if (file.size > 35 * 1024 * 1024) {
      setError('Video is larger than 35MB. Please choose a shorter clip or paste a video URL.');
      return;
    }

    setIsUploading(true);
    setVideoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setVideoUrl(result);
      // Also generate fallback thumbnail from preset
      setImageUrl(PRESET_IMAGES[2].url);
      setIsUploading(false);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read video file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a story title.');
      return;
    }
    if (mediaType === 'video' && !videoUrl.trim()) {
      setError('Please upload a video clip or provide a video URL.');
      return;
    }
    if (mediaType === 'image' && !imageUrl.trim()) {
      setError('Please upload an image or choose a preset.');
      return;
    }

    onStoryCreated({
      title: title.trim(),
      tag,
      mediaType,
      imageUrl: mediaType === 'image' ? imageUrl : (imageUrl || PRESET_IMAGES[2].url),
      videoUrl: mediaType === 'video' ? videoUrl.trim() : undefined,
      caption: caption.trim() || `${title.trim()} - Learn & Grow Story Update`,
      authorName: user?.name || 'Zia Khan',
      authorRole: user?.role === 'admin' ? 'Head of Quantitative Strategy' : 'Instructor & Desk Lead',
      authorAvatar: user?.avatarUrl || '/logo.png',
      linkText: linkText.trim() || undefined,
      linkView: linkView || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e0f17] border-2 border-amber-500/50 rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden my-auto space-y-4">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Post Story to Learn & Grow</h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Upload a picture or video clip to show to all students
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 text-left">
          {/* TWO PRIMARY BUTTONS: UPLOAD PICTURE OR UPLOAD VIDEO */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-amber-300 uppercase mb-1.5 tracking-wider">
              Choose Story Media Type:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMediaType('image');
                  setError(null);
                }}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  mediaType === 'image'
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black border-amber-300 shadow-lg shadow-amber-500/25 font-black scale-[1.02]'
                    : 'bg-[#141524] text-neutral-300 border-amber-500/20 hover:border-amber-400/50'
                }`}
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Upload Picture</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  setError(null);
                }}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  mediaType === 'video'
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black border-amber-300 shadow-lg shadow-amber-500/25 font-black scale-[1.02]'
                    : 'bg-[#141524] text-neutral-300 border-amber-500/20 hover:border-amber-400/50'
                }`}
              >
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Upload Video</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1">
              Story Title *
            </label>
            <input
              type="text"
              required
              placeholder={mediaType === 'video' ? 'e.g. Live Desk Clip: Order Flow Absorption' : 'e.g. BTC Daily Bias: $68,400 Liquidity Sweep'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#141523] border border-amber-500/30 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* MEDIA UPLOAD AREA */}
          {mediaType === 'image' ? (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1">
                Picture / Chart Image
              </label>

              {/* Upload button & URL input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1c1d2e] to-[#25283f] hover:brightness-110 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Choose Picture from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  placeholder="Or paste image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#141523] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Image Preview & Presets */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      imageUrl === preset.url ? 'border-amber-400 scale-105 shadow-md' : 'border-neutral-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1">
                Video Story Clip (MP4, WebM, MOV)
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1c1d2e] to-[#25283f] hover:brightness-110 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Select Video File</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  placeholder="Or direct video URL (e.g. .mp4 / streaming link)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#141523] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Video Preview */}
              {videoUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-black aspect-video max-h-40">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                  {videoFileName && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-300 font-mono">
                      {videoFileName}
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#141523] border border-dashed border-amber-500/30 text-center text-xs text-neutral-400">
                  Choose a video from your phone/computer or paste a video URL.
                </div>
              )}
            </div>
          )}

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1">
              Category Tag
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {(['DAILY BIAS', 'VIP GAIN', 'LIVE NOW', 'ORDER FLOW', 'ANNOUNCEMENT', 'ANALYSIS'] as StoryTag[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold transition-all border ${
                    tag === t
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black'
                      : 'bg-[#141523] text-neutral-300 border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1">
              Caption / Market Description
            </label>
            <textarea
              rows={2}
              placeholder="Add key insights, levels, or instructions for students..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#141523] border border-amber-500/30 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Action Button Link (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                Story Button Action (Optional)
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Join Live Trading Desk"
                className="w-full px-3 py-1.5 rounded-xl bg-[#141523] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                Destination View
              </label>
              <select
                value={linkView}
                onChange={(e) => setLinkView(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#141523] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="live">Live Trading Desk (live)</option>
                <option value="signals">Signals Terminal (signals)</option>
                <option value="beginner">Beginner Academy (beginner)</option>
                <option value="advanced">Advanced Academy (advanced)</option>
                <option value="market">Market Overview (market)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-black font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Publish Story Now</span>
          </button>
        </form>
      </div>
    </div>
  );
};
