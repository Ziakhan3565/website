/**
 * Avatar & DP (Display Picture) Utilities
 * Handles gallery file selection, client-side canvas compression, and preset avatars
 */

export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
  badge: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'trader_male_pro',
    name: 'Institutional Trader',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    badge: 'Pro Trader',
  },
  {
    id: 'trader_quant_fem',
    name: 'Quantitative Analyst',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    badge: 'Analyst',
  },
  {
    id: 'trader_exec_lead',
    name: 'Senior Lead Strategist',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    badge: 'Executive',
  },
  {
    id: 'trader_crypto_alpha',
    name: 'Alpha Quant Specialist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    badge: 'Crypto Alpha',
  },
  {
    id: 'trader_cyber_future',
    name: 'Cybernetic Orderflow',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    badge: 'Orderflow',
  },
  {
    id: 'trader_global_investor',
    name: 'Global Derivatives Desk',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    badge: 'Macro Desk',
  },
];

/**
 * Compresses an image file from user gallery/disk via HTML5 Canvas
 * Returns a lightweight base64 DataURL suitable for avatars
 */
export function compressImageFile(file: File, maxSize = 300, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file is image
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file must be an image (PNG, JPG, JPEG, WEBP, GIF)'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data url if canvas is unavailable
          return resolve(e.target?.result as string);
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg data url
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(dataUrl);
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Empty file content'));
      }
    };

    reader.readAsDataURL(file);
  });
}
