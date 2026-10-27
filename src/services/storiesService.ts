import type { StoryItem } from '../types/index.ts';

const STORAGE_KEY = 'lg_official_stories_v1';

export const INITIAL_STORIES: StoryItem[] = [
  {
    id: 'story-1',
    title: 'BTC Daily Bias: Liquidity Sweep at $68,400',
    tag: 'DAILY BIAS',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1080&q=80',
    caption: 'Bitcoin swept Asian session highs. We are observing heavy spot CVD divergence and limit buy orders stacked between $67,200 and $67,500. Patience for NY open.',
    authorName: 'Zia Khan',
    authorRole: 'Head of Quantitative Strategy',
    authorAvatar: '/logo.png',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    linkText: 'Join Live Trading Desk',
    linkView: 'live',
    viewsCount: 342,
  },
  {
    id: 'story-2',
    title: 'VIP Futures: +340% Profit Locked on SOL Long',
    tag: 'VIP GAIN',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1080&q=80',
    caption: 'Target 3 smashed on Solana 10x futures long setup! 1:4.2 risk-to-reward secured. Stop loss trailed into entry profit for zero risk.',
    authorName: 'Learn & Grow VIP Desk',
    authorRole: 'Official Signals Terminal',
    authorAvatar: '/logo.png',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    linkText: 'View Signals Terminal',
    linkView: 'signals',
    viewsCount: 519,
  },
  {
    id: 'story-3',
    title: 'Live Desk: New York Open Execution Session',
    tag: 'LIVE NOW',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1080&q=80',
    caption: 'Zia Khan is streaming live right now on the main trading desk. Open Q&A and real-time order book heatmaps.',
    authorName: 'Zia Khan',
    authorRole: 'Instructor & Desk Lead',
    authorAvatar: '/logo.png',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15m ago
    linkText: 'Join Live Stream Now',
    linkView: 'live',
    viewsCount: 780,
  },
  {
    id: 'story-4',
    title: 'Order Block & Imbalance: How Whales Accumulate',
    tag: 'ORDER FLOW',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1080&q=80',
    caption: 'Notice how market makers left an unmitigated Fair Value Gap on the 15M timeframe. Retail sold into liquidity while institutions absorbed.',
    authorName: 'Learn & Grow Academy',
    authorRole: 'Curriculum Team',
    authorAvatar: '/logo.png',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5h ago
    linkText: 'Study in Advanced Academy',
    linkView: 'advanced',
    viewsCount: 624,
  },
  {
    id: 'story-5',
    title: 'Golden Rule: Strict 1% Risk Allocation',
    tag: 'ANNOUNCEMENT',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1080&q=80',
    caption: 'Never risk more than 1% of total portfolio on any single trade setup. Capital preservation is the cornerstone of long-term profitability.',
    authorName: 'Zia Khan',
    authorRole: 'Founding Mentor',
    authorAvatar: '/logo.png',
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(), // 8h ago
    linkText: 'Review Beginner Modules',
    linkView: 'beginner',
    viewsCount: 915,
  },
];

export const storiesService = {
  getStories: (): StoryItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORIES));
        return INITIAL_STORIES;
      }
      return JSON.parse(stored);
    } catch (e) {
      return INITIAL_STORIES;
    }
  },

  addStory: (story: Omit<StoryItem, 'id' | 'createdAt' | 'viewsCount'>): StoryItem => {
    const stories = storiesService.getStories();
    const newStory: StoryItem = {
      ...story,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
    };
    const updated = [newStory, ...stories];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save story to localStorage', e);
    }
    return newStory;
  },

  deleteStory: (id: string): StoryItem[] => {
    const stories = storiesService.getStories();
    const updated = stories.filter((s) => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update stories', e);
    }
    return updated;
  },

  recordView: (id: string): void => {
    try {
      const stories = storiesService.getStories();
      const updated = stories.map((s) =>
        s.id === id ? { ...s, viewsCount: (s.viewsCount || 0) + 1 } : s
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  },

  resetDefaultStories: (): StoryItem[] => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORIES));
    } catch (e) {
      // ignore
    }
    return INITIAL_STORIES;
  },
};
