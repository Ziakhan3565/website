export interface ThumbnailPreset {
  id: string;
  title: string;
  category: string;
  url: string;
}

export const THUMBNAIL_PRESETS: ThumbnailPreset[] = [
  {
    id: 'candlestick-basics',
    title: 'Candlestick Anatomy & Foundations',
    category: 'Beginner Foundations',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'crypto-technical',
    title: 'Cryptocurrency Market Analysis',
    category: 'Technical Analysis',
    url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'orderflow-smc',
    title: 'Institutional Order Flow & CVD',
    category: 'Advanced SMC',
    url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'futures-leverage',
    title: 'Futures Leverage & Liquidity Pools',
    category: 'Futures Trading',
    url: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'risk-management',
    title: 'Disciplined Risk Management & Math',
    category: 'Risk Control',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'live-market-mastery',
    title: 'Live Trading Terminal & Strategy',
    category: 'Live Masterclass',
    url: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=800&q=80',
  },
];

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // youtube.com/watch?v=...
  if (clean.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(clean);
      return parsed.searchParams.get('v');
    } catch {
      const match = clean.match(/[?&]v=([^&#]+)/);
      return match ? match[1] : null;
    }
  }

  // youtu.be/...
  if (clean.includes('youtu.be/')) {
    const parts = clean.split('youtu.be/');
    if (parts[1]) {
      return parts[1].split(/[?&#]/)[0];
    }
  }

  // youtube.com/embed/...
  if (clean.includes('youtube.com/embed/')) {
    const parts = clean.split('youtube.com/embed/');
    if (parts[1]) {
      return parts[1].split(/[?&#]/)[0];
    }
  }

  // youtube.com/shorts/...
  if (clean.includes('youtube.com/shorts/')) {
    const parts = clean.split('youtube.com/shorts/');
    if (parts[1]) {
      return parts[1].split(/[?&#]/)[0];
    }
  }

  // youtube.com/live/... (Live Streams & Recorded Live Sessions)
  if (clean.includes('youtube.com/live/')) {
    const parts = clean.split('youtube.com/live/');
    if (parts[1]) {
      return parts[1].split(/[?&#]/)[0];
    }
  }

  return null;
}

export function getAutoThumbnail(videoUrl?: string, customThumb?: string): string {
  if (customThumb && customThumb.trim()) {
    return customThumb.trim();
  }

  const ytId = extractYouTubeId(videoUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  if (videoUrl?.includes('vimeo.com')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
  }

  return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
}

export function getEmbedUrl(url?: string): string {
  if (!url) return '';
  const clean = url.trim();

  const ytId = extractYouTubeId(clean);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
  }

  // Google Drive video links (Supports ultra-long 1-2+ hour lectures smoothly)
  if (clean.includes('drive.google.com/file/d/')) {
    const match = clean.match(/drive\.google\.com\/file\/d\/([^/?&#]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  if (clean.includes('drive.google.com/open?id=')) {
    const match = clean.match(/[?&]id=([^&#]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  if (clean.includes('vimeo.com/') && !clean.includes('player.vimeo.com')) {
    const parts = clean.split('vimeo.com/');
    const id = parts[1]?.split(/[?&#]/)[0];
    if (id) {
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
  }

  return clean;
}

export function isDirectVideo(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('blob:') || clean.startsWith('data:video/')) return true;
  const pathOnly = clean.split('?')[0].split('#')[0];
  return (
    pathOnly.endsWith('.mp4') ||
    pathOnly.endsWith('.webm') ||
    pathOnly.endsWith('.mov') ||
    pathOnly.endsWith('.m4v') ||
    pathOnly.endsWith('.m3u8')
  );
}
