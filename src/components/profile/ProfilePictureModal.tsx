import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { compressImageFile } from '../../utils/avatarUtils.ts';

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
      setError('Please select a valid image file from your gallery (JPG, PNG, WEBP).');
      return;
    }

    try {
      setLoading(true);
      // Fast canvas compression with automatic fallback
      let dataUrl: string;
      try {
        dataUrl = await compressImageFile(file, 400, 0.88);
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
      setSuccess('Photo selected from your gallery! Click "Upload Profile Picture" below to apply.');
    } catch (err: any) {
      setError(err.message || 'Failed to process selected photo from gallery');
    } finally {
      setLoading(false);
      // Reset input value so same photo can be re-selected if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
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
      setError('Please choose a photo from your gallery first');
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white border border-purple-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Upload Profile Picture</span>
                <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-semibold">
                  GALLERY
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Choose any photo from your phone or device gallery
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable if screen is very short */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 relative z-10 bg-white overflow-y-auto flex-1 min-h-0">
          {/* Avatar Live Preview */}
          <div className="flex flex-col items-center justify-center text-center space-y-2.5">
            <div
              className="relative group cursor-pointer"
              onClick={triggerGalleryPicker}
              title="Click to choose a photo from your gallery"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-indigo-500 to-purple-600 shadow-xl shadow-purple-600/20 transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-purple-500">
                      <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-1 opacity-70" />
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-500">No Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover quick change overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-purple-200" />
                <span className="text-[10px] font-bold text-white">Open Gallery</span>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[260px]">{user.name || user.email}</p>
              <p className="text-[10px] sm:text-[11px] text-purple-700 font-mono truncate max-w-[260px]">{user.email}</p>
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

          {/* Gallery Upload Card & Button (Only Gallery Option) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/50 border border-purple-200 text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 border border-purple-200 mx-auto flex items-center justify-center text-purple-700">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Select from Device Gallery</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                Upload your personal profile photo directly from your phone or computer storage.
              </p>
            </div>

            <button
              type="button"
              onClick={triggerGalleryPicker}
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>Choose Photo from Gallery</span>
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3 relative z-10">
          {user.avatarUrl ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !previewUrl}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-white" />
                  <span>Upload Profile Picture</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
