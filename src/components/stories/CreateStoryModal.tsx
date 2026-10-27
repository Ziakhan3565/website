import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Radio,
  TrendingUp,
  Flame,
  ArrowRight
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
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<StoryTag>('DAILY BIAS');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [caption, setCaption] = useState('');
  const [linkText, setLinkText] = useState('Join Live Trading Desk');
  const [linkView, setLinkView] = useState('live');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a story title.');
      return;
    }
    if (!caption.trim()) {
      setError('Please provide a caption or market analysis.');
      return;
    }

    onStoryCreated({
      title: title.trim(),
      tag,
      imageUrl,
      caption: caption.trim(),
      authorName: user?.name || 'Zia Khan',
      authorRole: user?.role === 'admin' ? 'Head of Quantitative Strategy' : 'Verified Trader',
      authorAvatar: user?.avatarUrl || '/logo.png',
      linkText: linkText.trim() || undefined,
      linkView: linkView || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e0f17] border-2 border-amber-500/50 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden my-auto space-y-5">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Post Story to Learn & Grow</h2>
              <p className="text-xs text-neutral-400">
                Share daily market bias, VIP profit proof, or live stream alert
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
          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1">
              Story Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BTC Daily Bias: $68,400 Liquidity Sweep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#141523] border border-amber-500/30 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
              Category Tag
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['DAILY BIAS', 'VIP GAIN', 'LIVE NOW', 'ORDER FLOW', 'ANNOUNCEMENT', 'ANALYSIS'] as StoryTag[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-mono font-bold transition-all border ${
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

          {/* Image Chooser or Custom Upload */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1.5">
              Story Graphic / Chart
            </label>

            {/* Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    imageUrl === preset.url ? 'border-amber-400 scale-105 shadow-md' : 'border-neutral-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/80 text-[8px] text-white font-mono text-center truncate py-0.5">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom file input or URL */}
            <div className="mt-2 flex items-center gap-3">
              <label className="px-3.5 py-2 rounded-xl bg-[#1b1c2e] hover:bg-[#25273e] border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <input
                type="url"
                placeholder="Or paste image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#141523] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-1">
              Market Caption & Breakdown *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain the order flow, session context, or risk-to-reward parameters..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#141523] border border-amber-500/30 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Action Button Link (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">
                Button Label (Optional)
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Join Live Trading Desk"
                className="w-full px-3 py-2 rounded-xl bg-[#141523] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">
                Destination View
              </label>
              <select
                value={linkView}
                onChange={(e) => setLinkView(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141523] border border-white/10 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
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
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-110 text-black font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Publish Story to Learn & Grow</span>
          </button>
        </form>
      </div>
    </div>
  );
};
