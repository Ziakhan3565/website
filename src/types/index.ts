export type UserRole = 'admin' | 'student';
export type MembershipTier = 'public' | 'free' | 'premium';

export interface CourseEnrollment {
  id: string;
  courseType: 'beginner' | 'advanced';
  enrolledAt: string;
  amount: number;
  currency: string;
  transactionReference: string;
  orderId?: string;
  paymentMethod?: string;
  status: 'active' | 'revoked';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: MembershipTier;
  hasBeginnerAccess?: boolean;
  hasAdvancedAccess?: boolean;
  enrollments?: CourseEnrollment[];
  createdAt: string;
  completedLessons: string[];
  savedSignals: string[];
  attendedClasses: string[];
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type LessonLevel = 'beginner' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  level: LessonLevel;
  category: string;
  order: number;
  description: string;
  content: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'mp4';
  thumbnailUrl?: string;
  durationMinutes: number;
  pdfUrl?: string;
  pdfTitle?: string;
  downloadableNotes?: string;
  chartImages?: string[];
  published: boolean;
  tier: MembershipTier;
  createdAt: string;
  updatedAt: string;
}

export type ClassStatus = 'live' | 'upcoming' | 'completed';
export type StreamingPlatform = 'YouTube Live' | 'Google Meet' | 'TradingView Stream' | 'Zoom' | 'Custom HLS';

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  instructorRole: string;
  instructorAvatar?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: ClassStatus;
  platform: StreamingPlatform;
  streamUrl: string;
  meetingLink: string;
  replayUrl?: string;
  notesDoc?: string;
  attendees: string[];
  createdAt: string;
}

export interface LiveChatMessage {
  id: string;
  classId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  timestamp: string;
  isQuestion: boolean;
  upvotes: number;
  answered?: boolean;
}

export type SignalDirection = 'BUY' | 'SELL';
export type SignalStatus = 'Active' | 'Target 1 Hit' | 'Target 2 Hit' | 'Target 3 Hit' | 'TP1 Hit' | 'TP2 Hit' | 'TP3 Hit' | 'Stop Loss Hit' | 'Closed';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface SpotSignal {
  id: string;
  pair: string;
  direction: SignalDirection;
  entryZone: string;
  tp1: string;
  tp2: string;
  tp3: string;
  stopLoss: string;
  timeframe: string;
  technicalReasoning: string;
  riskLevel: RiskLevel;
  riskRewardRatio: string;
  status: SignalStatus;
  createdAt: string;
  updatedAt: string;
  publishedBy: string;
  pnlPercentage?: number;
  chartSnapshotUrl?: string;
}

export type FuturesDirection = 'LONG' | 'SHORT';
export type MarginType = 'Isolated' | 'Cross';

export interface FuturesSignal {
  id: string;
  pair: string;
  direction: FuturesDirection;
  entryZone: string;
  tp1: string;
  tp2: string;
  tp3: string;
  tp4?: string;
  stopLoss: string;
  leverage: string;
  marginType: MarginType;
  fundingRate: string;
  openInterest: string;
  cvdObservations: string;
  liquidationLevels: string;
  technicalReasoning: string;
  riskLevel: RiskLevel;
  riskRewardRatio: string;
  status: SignalStatus;
  createdAt: string;
  updatedAt: string;
  publishedBy: string;
  pnlPercentage?: number;
}

export interface MarketTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  fundingRate?: number;
  openInterest?: number;
  sparkline?: number[];
  updatedAt: string;
}

export interface MarketAnalysisReport {
  id: string;
  title: string;
  author: string;
  category: 'Macro' | 'On-Chain' | 'Derivatives' | 'Weekly Outlook';
  summary: string;
  content: string;
  keyLevels: string;
  date: string;
  pinned: boolean;
}

export interface LearningMaterial {
  id: string;
  title: string;
  type: 'PDF Guide' | 'Cheat Sheet' | 'Spreadsheet' | 'Strategy Playbook';
  fileSize: string;
  category: string;
  description: string;
  downloadUrl: string;
  tier: MembershipTier;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'Normal' | 'High' | 'Urgent';
  date: string;
  author: string;
}

export interface CoursePricingConfig {
  beginnerPrice: number;
  advancedPrice: number;
  currency: string;
  usdtTrc20Address: string;
  usdtBep20Address: string;
  easypaisaTitle: string;
  easypaisaNumber: string;
  jazzcashTitle: string;
  jazzcashNumber: string;
  bankName: string;
  bankAccountTitle: string;
  bankIban: string;
  upiId: string;
  whatsappSupport: string;
  paymentNotice: string;
  autoApproveInstant: boolean;
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseType: 'beginner' | 'advanced';
  amount: number;
  currency: string;
  paymentMethod: 'crypto' | 'easypaisa' | 'jazzcash' | 'bank' | 'upi' | 'card' | 'instant' | 'stripe';
  gatewayType?: 'stripe' | 'easypaisa' | 'jazzcash' | 'bank' | 'crypto' | 'upi' | 'sandbox';
  stripeSessionId?: string;
  transactionReference: string;
  senderAccount?: string;
  receiptUrl?: string;
  status: TransactionStatus;
  failureReason?: string;
  adminNotes?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  refundId?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface PaymentGatewayInfo {
  provider: string;
  mode: 'test' | 'live';
  isStripeConfigured: boolean;
  publishableKey: string | null;
  supportedMethods: string[];
  currency: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl?: string;
  isSandbox?: boolean;
  orderId: string;
  amount: number;
  currency: string;
}

export interface SocialChannel {
  id: string;
  title: string;
  platform: 'youtube' | 'telegram' | 'instagram' | 'whatsapp' | 'twitter' | 'discord' | 'facebook' | 'other';
  url: string;
  handle?: string;
  description?: string;
  subscribers?: string;
  active: boolean;
}

export interface ExchangeReferral {
  id: string;
  name: string;
  exchangeKey: 'mexc' | 'binance' | 'bybit' | 'okx' | 'bitget' | 'other';
  referralUrl: string;
  referralCode: string;
  bonusTag?: string;
  badge?: string;
  description?: string;
  clicksCount: number;
  active: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}


