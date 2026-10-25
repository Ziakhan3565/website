import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  Trash2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { AVATAR_PRESETS, compressImageFile } from '../../utils/avatarUtils.ts';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Validate image mime or file extension
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(file.name);
    if (!isImage) {
      setError('Please select a valid image file from your device gallery (JPG, PNG, WEBP).');
      return;
    }

    try {
      setLoading(true);
      // Fast canvas compression with automatic fallback
      let dataUrl: string;
      try {
        dataUrl = await compressImageFile(file, 350, 0.85);
      } catch {
        // Fallback to direct FileReader DataURL if canvas compression fails
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file from gallery'));
          reader.readAsDataURL(file);
        });
      }

      setPreviewUrl(dataUrl);
      setSuccess('Photo selected! Click "Save Profile Picture" below to apply.');
    } catch (err: any) {
      setError(err.message || 'Failed to process selected photo from gallery');
    } finally {
      setLoading(false);
      // Reset input value so same photo can be re-selected if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (url: string) => {
    setPreviewUrl(url);
    setError(null);
    setSuccess('Avatar selected! Click "Save Profile Picture" to apply.');
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateProfile({ avatarUrl: '' });
      setPreviewUrl(null);
      setSuccess('Profile picture removed successfully');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to remove picture');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!previewUrl) {
      setError('Please choose a photo from your gallery or select an avatar');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateProfile({ avatarUrl: previewUrl });
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGalleryPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#11121c] border border-[#232538] rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header - ENGLISH ONLY */}
        <div className="bg-gradient-to-r from-[#181a28] via-[#151624] to-[#121320] border-b border-[#232538] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Set Profile Picture
              </h2>
              <p className="text-xs text-neutral-400">
                Choose a photo from your device gallery
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Avatar Live Preview */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative group cursor-pointer" onClick={triggerGalleryPicker} title="Click to choose from gallery">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#7c3aed] via-[#4f46e5] to-[#10a37f] shadow-2xl shadow-purple-500/25">
                <div className="w-full h-full rounded-full bg-[#161726] overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold text-purple-300">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover quick change overlay */}
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Camera className="w-6 h-6 mb-1 text-purple-300" />
                <span className="text-[10px] font-bold">Pick Photo</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white">{user.name || user.email}</p>
              <p className="text-[11px] text-neutral-400 font-mono">{user.email}</p>
            </div>
          </div>

          {/* Hidden file input for device gallery picker */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Gallery Upload CTA Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={triggerGalleryPicker}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#4f46e5] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              <span>Choose Photo from Gallery</span>
            </button>
            <p className="text-[11px] text-center text-neutral-400">
              Select any photo or screenshot from your phone or computer gallery
            </p>
          </div>

          {/* Preset Avatars Library */}
          <div className="space-y-2 pt-2 border-t border-[#232538]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Or Choose Trader Avatar:</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">1-Click Select</span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = previewUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-400 scale-105 shadow-md shadow-purple-500/40 ring-2 ring-purple-500/30'
                        : 'border-[#2a2c42] hover:border-purple-400/60 opacity-80 hover:opacity-100'
                    }`}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-600/35 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions - ENGLISH ONLY */}
        <div className="bg-[#0e0f17] border-t border-[#232538] px-6 py-4 flex items-center justify-between gap-3">
          {user.avatarUrl ? (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#1a1b2a] hover:bg-[#24253a] text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Profile Picture</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
