import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  GraduationCap,
  Radio,
  Zap,
  Flame,
  FolderDown,
  Bell,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Play,
  FileText,
  CreditCard,
  DollarSign,
  Smartphone,
  Building,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Filter,
  Share2,
  Globe,
  MessageCircle,
  MessageSquare,
  Award,
  PlayCircle,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Search,
  Copy,
  CheckCheck,
  ShieldCheck,
  Receipt,
  Video,
  Film,
  Sparkles
} from 'lucide-react';
import { Logo } from '../common/Logo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import type {
  Lesson,
  LiveClass,
  SpotSignal,
  FuturesSignal,
  LearningMaterial,
  Announcement,
  User as UserType,
  SignalStatus,
  MembershipTier,
  CoursePricingConfig,
  PaymentTransaction,
  SocialChannel,
  PaymentGatewayInfo
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  getEmbedUrl,
  getAutoThumbnail,
  isDirectVideo,
  THUMBNAIL_PRESETS,
  extractYouTubeId
} from '../../utils/videoUtils.ts';
import { UploadProgressModal, type UploadProgressState } from '../common/UploadProgressModal.tsx';

interface AdminPanelProps {
  beginnerLessons: Lesson[];
  advancedLessons: Lesson[];
  liveClasses: LiveClass[];
  spotSignals: SpotSignal[];
  futuresSignals: FuturesSignal[];
  materials: LearningMaterial[];
  announcements: Announcement[];
  onRefreshAll: () => void;
  onNavigateToLive?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  beginnerLessons,
  advancedLessons,
  liveClasses,
  spotSignals,
  futuresSignals,
  materials,
  announcements,
  onRefreshAll,
  onNavigateToLive,
}) => {
  const { user, isAdmin, switchDemoAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'beginner_lessons' | 'advanced_lessons' | 'spot' | 'futures' | 'pricing' | 'live' | 'channels' | 'materials' | 'announcements' | 'students'
  >('beginner_lessons');

  // Video Player & Editing Lesson State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Lesson | null>(null);

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

  // ESC key listener to dismiss video player easily
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (playingVideo) setPlayingVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingVideo]);

  // Channels State & Forms
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [channelForm, setChannelForm] = useState<Partial<SocialChannel>>({
    title: '',
    platform: 'youtube',
    url: '',
    handle: '',
    description: '',
    subscribers: '',
    active: true,
  });

  // Student accounts list state
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Pricing & Payment Gateway Controller State
  const [pricingConfig, setPricingConfig] = useState<CoursePricingConfig>({
    beginnerPrice: 2,
    advancedPrice: 5,
    currency: 'USD',
    usdtTrc20Address: 'TQ3aXm9yKLZpTRC20LearnAndGrowDesk99',
    usdtBep20Address: '0x71C...b48LearnAndGrowOfficialWallet',
    easypaisaTitle: 'Learn and Grow Official Desk',
    easypaisaNumber: '0300-8492019',
    jazzcashTitle: 'Learn and Grow Official Desk',
    jazzcashNumber: '0301-7291048',
    bankName: 'Meezan Bank Ltd / Standard Chartered',
    bankAccountTitle: 'Learn and Grow Trading Academy',
    bankIban: 'PK36MEZN0001092847291048',
    upiId: 'learnandgrow@okaxis',
    whatsappSupport: '+923008492019',
    paymentNotice: 'Send the exact fee amount set by admin. Enter your transaction reference or receipt to activate your account.',
    autoApproveInstant: true,
  });
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [gatewayInfo, setGatewayInfo] = useState<PaymentGatewayInfo | null>(null);
  const [paymentSubTab, setPaymentSubTab] = useState<'dashboard' | 'history' | 'gateways' | 'pricing' | 'enrollments' | 'refunds'>('dashboard');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txCourseFilter, setTxCourseFilter] = useState<'all' | 'beginner' | 'advanced'>('all');
  const [txFilter, setTxFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'failed' | 'refunded'>('all');
  const [pricingSavedMessage, setPricingSavedMessage] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [updatingTxId, setUpdatingTxId] = useState<string | null>(null);

  // Refund management state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('Customer requested refund');
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  const [refundProcessing, setRefundProcessing] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Receipt image preview modal
  const [viewReceiptModal, setViewReceiptModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Forms state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({
    level: 'beginner',
    category: 'Crypto Foundations',
    order: 1,
    title: '',
    description: '',
    content: '',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: '',
    durationMinutes: 20,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfTitle: '',
    downloadableNotes: '',
    published: true,
    tier: 'free',
  });

  const [showLiveModal, setShowLiveModal] = useState(false);
  const [liveForm, setLiveForm] = useState<Partial<LiveClass>>({
    title: '',
    description: '',
    instructorName: 'Zia Khan',
    instructorRole: 'Head of Quantitative Strategy',
    scheduledAt: new Date().toISOString(),
    durationMinutes: 60,
    status: 'live',
    platform: 'YouTube Live',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_BQQ50A',
    meetingLink: 'https://meet.google.com/zia-live-desk',
    notesDoc: '',
  });

  const [showSpotModal, setShowSpotModal] = useState(false);
  const [spotForm, setSpotForm] = useState<Partial<SpotSignal>>({
    pair: 'BTC/USDT',
    direction: 'BUY',
    entryZone: '64,000 - 64,500',
    tp1: '66,500',
    tp2: '68,200',
    tp3: '71,000',
    stopLoss: '62,800',
    timeframe: '4H',
    technicalReasoning: 'Bullish order block re-test with spot CVD delta absorption.',
    riskLevel: 'Medium',
    riskRewardRatio: '1:3.2',
    status: 'Active',
    publishedBy: 'Zia Khan',
  });

  const [showFuturesModal, setShowFuturesModal] = useState(false);
  const [futuresForm, setFuturesForm] = useState<Partial<FuturesSignal>>({
    pair: 'BTC/USDT',
    direction: 'LONG',
    entryZone: '63,800 - 64,200',
    tp1: '65,500',
    tp2: '67,000',
    tp3: '69,000',
    tp4: '71,500',
    stopLoss: '62,900',
    leverage: '10x',
    marginType: 'Isolated',
    fundingRate: '+0.0075%',
    openInterest: '$5.2B (+3.4%)',
    cvdObservations: 'Bullish CVD divergence on 1H chart.',
    liquidationLevels: 'Short liquidation pool at $65,500.',
    technicalReasoning: 'Liquidity sweep of local lows followed by aggressive reclamation.',
    riskLevel: 'Medium',
    riskRewardRatio: '1:3.5',
    status: 'Active',
    publishedBy: 'Zia Khan',
  });

  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceForm, setAnnounceForm] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    priority: 'Normal',
    author: 'Learn and Grow Desk',
  });

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState<Partial<LearningMaterial>>({
    title: '',
    type: 'PDF Guide',
    fileSize: '5.2 MB',
    category: 'Technical Analysis',
    description: '',
    downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tier: 'free',
  });

  // Load data for Admin
  const loadPricingAndTransactions = async () => {
    setPricingLoading(true);
    try {
      const [pRes, tRes, gRes] = await Promise.all([
        api.getPricing(),
        api.getAdminTransactions(),
        api.getPaymentGatewayInfo(),
      ]);
      if (pRes.pricing) setPricingConfig(pRes.pricing);
      if (tRes.transactions) setTransactions(tRes.transactions);
      if (gRes.gateway) setGatewayInfo(gRes.gateway);
    } catch (e) {
      console.error('Failed to load pricing or transactions', e);
    } finally {
      setPricingLoading(false);
    }
  };

  const loadStudents = async () => {
    setUsersLoading(true);
    try {
      const res = await api.getAdminUsers();
      if (res && res.users) setUsersList(res.users);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadChannels = async () => {
    setChannelsLoading(true);
    try {
      const res = await api.getChannels();
      if (res.channels) setChannels(res.channels);
    } catch (e) {
      console.error('Failed to load channels', e);
    } finally {
      setChannelsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPricingAndTransactions();
      loadStudents();
      loadChannels();
    }
  }, [isAdmin, activeTab]);

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChannelId) {
        await api.updateChannel(editingChannelId, channelForm);
      } else {
        await api.createChannel(channelForm);
      }
      setShowChannelModal(false);
      setEditingChannelId(null);
      await loadChannels();
    } catch (err: any) {
      alert(err.message || 'Failed to save channel');
    }
  };

  const handleDeleteChannel = async (id: string, title: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
    try {
      await api.deleteChannel(id);
      await loadChannels();
    } catch (err: any) {
      console.error('Failed to delete channel', err);
    }
  };

  const handleToggleChannelStatus = async (id: string, currentActive: boolean) => {
    try {
      await api.updateChannel(id, { active: !currentActive });
      await loadChannels();
    } catch (err: any) {
      alert(err.message || 'Failed to update channel status');
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updatePricing(pricingConfig);
      setPricingConfig(res.pricing);
      setPricingSavedMessage('Pricing and payment gateways updated and saved successfully.');
      setTimeout(() => setPricingSavedMessage(null), 3500);
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Failed to save pricing configuration');
    }
  };

  const handleUpdateTxStatus = async (txId: string, status: 'approved' | 'rejected') => {
    setUpdatingTxId(txId);
    try {
      await api.updateTransactionStatus(txId, status);
      await loadPricingAndTransactions();
      await loadStudents();
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Failed to update transaction status');
    } finally {
      setUpdatingTxId(null);
    }
  };

  const handleOpenRefundModal = (tx: PaymentTransaction) => {
    setSelectedTxForRefund(tx);
    setRefundAmount(tx.amount);
    setRefundReason('Customer requested refund');
    setShowRefundModal(true);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForRefund) return;
    setRefundProcessing(true);
    try {
      const res = await api.issueRefund({
        transactionId: selectedTxForRefund.id,
        reason: refundReason,
        amount: typeof refundAmount === 'number' ? refundAmount : undefined
      });
      alert(res.message || 'Refund successfully processed and student access revoked.');
      setShowRefundModal(false);
      setSelectedTxForRefund(null);
      await loadPricingAndTransactions();
      await loadStudents();
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Failed to process refund');
    } finally {
      setRefundProcessing(false);
    }
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/payments/webhook`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2500);
    }).catch(() => {});
  };

  const handleToggleStudentAccess = async (studentId: string, type: 'beginner' | 'advanced', currentVal: boolean) => {
    try {
      await api.updateUserAccess(studentId, {
        [type === 'beginner' ? 'hasBeginnerAccess' : 'hasAdvancedAccess']: !currentVal
      });
      await loadStudents();
      onRefreshAll();
    } catch (err: any) {
      alert(err.message || 'Failed to update student access');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-[#121824] rounded-2xl border border-slate-800 max-w-lg mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The Admin Control Panel is restricted to authorized Learn and Grow personnel for content publishing, signal dispatches, and user management.
        </p>
        <button
          onClick={() => switchDemoAccount('admin')}
          className="mt-5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          Switch to Zia Khan (Admin View)
        </button>
      </div>
    );
  }

  // Automated 0% -> 100% Upload Progress Sequence
  const runWithUploadProgress = async (
    title: string,
    subTitle: string,
    type: 'video' | 'spot' | 'futures' | 'general',
    operation: () => Promise<void>
  ) => {
    setUploadProgress({
      isOpen: true,
      title,
      subTitle,
      type,
      percent: 15,
      stageText: 'Validating input parameters & payload integrity...',
      isComplete: false,
    });

    await new Promise(r => setTimeout(r, 260));
    setUploadProgress(prev => ({
      ...prev,
      percent: 45,
      stageText: type === 'video'
        ? 'Transcoding media stream & optimizing resolution...'
        : type === 'futures'
        ? 'Calculating liquidation bands & leverage risk reward...'
        : 'Indexing spot technical indicators & entry ranges...',
    }));

    await new Promise(r => setTimeout(r, 280));
    setUploadProgress(prev => ({
      ...prev,
      percent: 78,
      stageText: 'Uploading data & broadcasting to student network...',
    }));

    try {
      await operation();
      setUploadProgress(prev => ({
        ...prev,
        percent: 100,
        stageText: 'Upload 100% Complete! Synced across all terminals.',
        isComplete: true,
      }));
      // Keep complete state briefly visible so the user clearly sees 100%
      await new Promise(r => setTimeout(r, 750));
    } catch (e: any) {
      alert(e.message || 'Action failed');
    } finally {
      setUploadProgress(prev => ({ ...prev, isOpen: false, isComplete: false }));
    }
  };

  // Handle submissions with 0% -> 100% progress
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    await runWithUploadProgress(
      editingLessonId ? 'Updating Video Lesson' : 'Uploading Video Lesson',
      lessonForm.title || 'Course Trading Lesson',
      'video',
      async () => {
        if (editingLessonId) {
          await api.updateLesson(editingLessonId, lessonForm);
        } else {
          await api.createLesson(lessonForm);
        }
        setShowLessonModal(false);
        setEditingLessonId(null);
        onRefreshAll();
      }
    );
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLessonForm(prev => ({ ...prev, thumbnailUrl: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const openUploadBeginnerModal = () => {
    setEditingLessonId(null);
    setLessonForm({
      level: 'beginner',
      category: 'Crypto Foundations',
      order: beginnerLessons.length + 1,
      title: '',
      description: '',
      content: '### Core Trading Concepts...',
      videoUrl: '',
      thumbnailUrl: '',
      durationMinutes: 20,
      published: true,
      tier: 'free',
    });
    setShowLessonModal(true);
  };

  const openUploadAdvancedModal = () => {
    setEditingLessonId(null);
    setLessonForm({
      level: 'advanced',
      category: 'Quantitative Mechanics & SMC',
      order: advancedLessons.length + 1,
      title: '',
      description: '',
      content: '### Institutional Orderflow Principles...',
      videoUrl: '',
      thumbnailUrl: '',
      durationMinutes: 30,
      published: true,
      tier: 'premium',
    });
    setShowLessonModal(true);
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({ ...lesson });
    setShowLessonModal(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Zero-copy Object URL enables instant playback of 1-hour and 2-hour long videos
    // without loading gigabytes of base64 data into JavaScript memory or lagging the terminal!
    const objectUrl = URL.createObjectURL(file);
    const approxMinutes = file.size > 500 * 1024 * 1024 ? 90 : file.size > 200 * 1024 * 1024 ? 60 : 30;

    setLessonForm(prev => ({
      ...prev,
      videoUrl: objectUrl,
      durationMinutes: prev.durationMinutes && prev.durationMinutes > 0 ? prev.durationMinutes : approxMinutes
    }));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLessonForm(prev => ({
          ...prev,
          pdfUrl: event.target?.result as string,
          pdfTitle: file.name
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLiveClass(liveForm);
      setShowLiveModal(false);
      onRefreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateSpotSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    await runWithUploadProgress(
      'Publishing Spot Trading Signal',
      `${spotForm.pair || 'BTC/USDT'} · ${spotForm.direction || 'BUY'} Entry Zone`,
      'spot',
      async () => {
        await api.createSpotSignal(spotForm);
        setShowSpotModal(false);
        onRefreshAll();
      }
    );
  };

  const handleCreateFuturesSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    await runWithUploadProgress(
      'Broadcasting Futures VIP Signal',
      `${futuresForm.pair || 'BTC/USDT'} · ${futuresForm.direction || 'LONG'} (${futuresForm.leverage || '10x'})`,
      'futures',
      async () => {
        await api.createFuturesSignal(futuresForm);
        setShowFuturesModal(false);
        onRefreshAll();
      }
    );
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement(announceForm);
      setShowAnnounceModal(false);
      onRefreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMaterial(materialForm);
      setShowMaterialModal(false);
      onRefreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleTier = async (uId: string, currentTier: MembershipTier) => {
    const newTier = currentTier === 'premium' ? 'free' : 'premium';
    try {
      await api.updateUserTier(uId, newTier);
      loadStudents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRole = async (uId: string, currentRole: 'admin' | 'student') => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await api.updateUserRole(uId, newRole);
      loadStudents();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#171424] via-[#151728] to-[#0c0e18] border border-purple-500/30 p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> MASTER DESK CONTROLLER
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe58f] via-[#ffd700] to-[#f59e0b] font-serif">Learn and Grow</span>
              <span className="text-lg font-normal text-neutral-300 font-sans">Admin Panel</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Instant controls to upload course videos (with custom thumbnails & player preview), publish spot & futures signals, host live sessions, and manage student enrollments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-200 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin: <strong>admin@gmail.com</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ HERO QUICK ACTION DESK */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Action Desk (1-Click Uploads)</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            Upload videos with thumbnails or dispatch verified signals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Action 1: Upload Beginner Video */}
          <button
            type="button"
            onClick={openUploadBeginnerModal}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#0e1a17] via-[#10191c] to-[#0c1214] border border-emerald-500/40 hover:border-emerald-400 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-emerald-950/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                + UPLOAD
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Upload Beginner Video
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Upload Beginner Video · Add tutorial video with custom thumbnail
            </p>
          </button>

          {/* Action 2: Upload Advanced Video */}
          <button
            type="button"
            onClick={openUploadAdvancedModal}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#181126] via-[#151221] to-[#0d0b16] border border-purple-500/40 hover:border-purple-400 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-purple-950/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <PlayCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                + UPLOAD
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Upload Advanced Video
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Upload Advanced Video · Quantitative SMC & Orderflow lessons
            </p>
          </button>

          {/* Action 3: Upload Spot Signal */}
          <button
            type="button"
            onClick={() => setShowSpotModal(true)}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#0c1824] via-[#0d1620] to-[#091017] border border-cyan-500/40 hover:border-cyan-400 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-cyan-950/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                + SIGNAL
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              Upload Spot Signal
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Upload Spot Signal · Entry zone, targets & stop-loss
            </p>
          </button>

          {/* Action 4: Upload Futures Signal */}
          <button
            type="button"
            onClick={() => setShowFuturesModal(true)}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-[#24170d] via-[#1f140c] to-[#140c07] border border-amber-500/40 hover:border-amber-400 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-amber-950/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                + SIGNAL
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Upload Futures Signal
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Upload Futures Signal · High-leverage long/short setups
            </p>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#23253b] font-mono text-xs">
        {[
          {
            id: 'beginner_lessons',
            label: 'Beginners Videos',
            icon: GraduationCap,
            count: beginnerLessons.length,
            color: 'emerald'
          },
          {
            id: 'advanced_lessons',
            label: 'Advanced Videos',
            icon: PlayCircle,
            count: advancedLessons.length,
            color: 'purple'
          },
          {
            id: 'spot',
            label: 'Spot Signals',
            icon: Zap,
            count: spotSignals.length,
            color: 'cyan'
          },
          {
            id: 'futures',
            label: 'Futures Signals',
            icon: Flame,
            count: futuresSignals.length,
            color: 'amber'
          },
          {
            id: 'pricing',
            label: 'Payment Management',
            icon: CreditCard,
            count: transactions.filter(t => t.status === 'pending').length > 0
              ? `${transactions.filter(t => t.status === 'pending').length} Pending`
              : `$${transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0)}`,
            color: 'emerald'
          },
          {
            id: 'live',
            label: 'Live Stream Desk',
            icon: Radio,
            count: liveClasses.length,
            color: 'rose'
          },
          {
            id: 'channels',
            label: 'Official Channels',
            icon: Share2,
            count: channels.length,
            color: 'cyan'
          },
          {
            id: 'materials',
            label: 'PDF Materials',
            icon: FolderDown,
            count: materials.length,
            color: 'teal'
          },
          {
            id: 'announcements',
            label: 'Announcements',
            icon: Bell,
            count: announcements.length,
            color: 'amber'
          },
          {
            id: 'students',
            label: 'Students & RBAC',
            icon: Users,
            count: usersList.length || '•',
            color: 'indigo'
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black shadow-md shadow-amber-500/25'
                  : 'bg-[#131422] text-neutral-400 hover:text-amber-300 border border-[#23253b] hover:border-amber-500/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-black/30 text-white' : 'bg-black/50 text-neutral-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 0: Dedicated Payment Management Center */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Top Section Header */}
          <div className="rounded-2xl bg-gradient-to-r from-[#11131f] via-[#151728] to-[#11131f] border border-[#2b2e4a] p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold mb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>PAYMENT & REVENUE MANAGEMENT CENTER</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Payment Gateway, Transactions & Enrollments</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  Monitor verified sales in real-time, configure supported gateways, manage course fees, track student enrollments, and process refunds with automatic access revocation.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
                <button
                  type="button"
                  onClick={loadPricingAndTransactions}
                  className="px-3.5 py-2 rounded-xl bg-[#1c1d30] hover:bg-[#252742] text-xs font-mono font-bold text-neutral-300 border border-[#323554] flex items-center gap-2 transition-all shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${pricingLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            {/* Gateway Mode & Webhook Strip */}
            <div className="mt-5 pt-4 border-t border-[#23263d] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-neutral-400">Gateway Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  gatewayInfo?.isStripeConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {gatewayInfo?.isStripeConfigured ? '● Live Production Gateway' : '● Developer Test Sandbox Active'}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">Anti-Duplicate Engine:</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>

              <div className="flex items-center gap-2 bg-[#0c0d16] px-3 py-1 rounded-lg border border-[#23253b]">
                <span className="text-[10px] text-neutral-400">Webhook:</span>
                <code className="text-[11px] text-purple-300 font-mono">/api/payments/webhook</code>
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                  title="Copy full Webhook URL"
                >
                  {copiedWebhook ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback alert */}
          {pricingSavedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-lg animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pricingSavedMessage}</span>
            </div>
          )}

          {/* Dedicated Sub-Navigation Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#23253b] font-mono text-xs">
            {[
              { id: 'dashboard', label: 'Payments Dashboard', icon: DollarSign, count: `$${transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0)}` },
              { id: 'history', label: 'Transaction History', icon: Clock, count: transactions.length },
              { id: 'gateways', label: 'Payment Gateway Settings', icon: Building, count: gatewayInfo?.isStripeConfigured ? 'Live' : 'Test' },
              { id: 'pricing', label: 'Course Pricing Management', icon: CreditCard, count: `$${pricingConfig.beginnerPrice}/$${pricingConfig.advancedPrice}` },
              { id: 'enrollments', label: 'Order & Enrollment Management', icon: Users, count: usersList.filter(u => u.hasBeginnerAccess || u.hasAdvancedAccess).length },
              { id: 'refunds', label: 'Refund Management', icon: RotateCcw, count: transactions.filter(t => t.status === 'refunded').length },
            ].map((subTab) => {
              const SubIcon = subTab.icon;
              const isCurrent = paymentSubTab === subTab.id;
              return (
                <button
                  key={subTab.id}
                  type="button"
                  onClick={() => setPaymentSubTab(subTab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                      : 'bg-[#121320] text-neutral-400 hover:text-white border border-[#23253b]'
                  }`}
                >
                  <SubIcon className="w-3.5 h-3.5" />
                  <span>{subTab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isCurrent ? 'bg-black/30 text-white' : 'bg-black/50 text-neutral-400'
                  }`}>
                    {subTab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ================= SUB-TAB 1: PAYMENTS DASHBOARD ================= */}
          {paymentSubTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Sales KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                {/* Gross Volume */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#121422] border border-[#24273f] space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase text-[10px] tracking-wider font-bold">Gross Sales Volume</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    ${transactions.filter(t => t.status === 'approved' || t.status === 'refunded').reduce((acc, t) => acc + (t.amount || 0), 0)}
                    <span className="text-xs text-neutral-400 font-sans font-normal ml-1">USD</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-sans">
                    ✓ From {transactions.filter(t => t.status === 'approved' || t.status === 'refunded').length} verified completed checkouts
                  </p>
                </div>

                {/* Net Revenue */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#121422] border border-[#24273f] space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase text-[10px] tracking-wider font-bold">Net Revenue</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">
                    ${transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0)}
                    <span className="text-xs text-neutral-400 font-sans font-normal ml-1">USD</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    After refunds ({transactions.filter(t => t.status === 'approved').length} active enrollments)
                  </p>
                </div>

                {/* Pending Verification */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#121422] border border-[#24273f] space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase text-[10px] tracking-wider font-bold">Pending Review</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">
                    {transactions.filter(t => t.status === 'pending').length}
                  </div>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    Awaiting manual bank/easypaisa receipt check
                  </p>
                </div>

                {/* Failed / Refunded */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#121422] border border-[#24273f] space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span className="uppercase text-[10px] tracking-wider font-bold">Refunded / Failed</span>
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-rose-400">
                    {transactions.filter(t => t.status === 'refunded').length} <span className="text-sm font-normal text-neutral-400">Ref /</span> {transactions.filter(t => t.status === 'failed' || t.status === 'rejected' || t.status === 'cancelled').length} <span className="text-sm font-normal text-neutral-400">Fail</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    ${transactions.filter(t => t.status === 'refunded').reduce((acc, t) => acc + (t.refundAmount || t.amount || 0), 0)} refunded to students
                  </p>
                </div>
              </div>

              {/* Course Sales & Gateway Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Track Performance */}
                <div className="p-5 rounded-2xl bg-[#121422] border border-[#24273f] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#23253b] pb-3">
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>Course Track Revenue Performance</span>
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400">Verified Orders</span>
                  </div>

                  <div className="space-y-3">
                    {/* Beginner Track */}
                    <div className="p-3.5 rounded-xl bg-[#17192a] border border-[#2a2d47] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">Beginner Academy Track</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            Fee: ${pricingConfig.beginnerPrice}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {transactions.filter(t => t.courseType === 'beginner' && t.status === 'approved').length} Active Students
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-emerald-400">
                          ${transactions.filter(t => t.courseType === 'beginner' && t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0)} USD
                        </span>
                      </div>
                    </div>

                    {/* Advanced VIP Track */}
                    <div className="p-3.5 rounded-xl bg-[#17192a] border border-[#2a2d47] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">Advanced VIP Masterclass</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            Fee: ${pricingConfig.advancedPrice}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {transactions.filter(t => t.courseType === 'advanced' && t.status === 'approved').length} Active Students
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-amber-400">
                          ${transactions.filter(t => t.courseType === 'advanced' && t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0)} USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gateway Methods Distribution */}
                <div className="p-5 rounded-2xl bg-[#121422] border border-[#24273f] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#23253b] pb-3">
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Building className="w-4 h-4 text-purple-400" />
                      <span>Payment Gateway Channels</span>
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400">Supported Methods</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#17192a] border border-[#282a44] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-white">Stripe Card Gateway (Visa/MC)</span>
                      </div>
                      <span className="text-neutral-300 font-bold">
                        {transactions.filter(t => t.gatewayType === 'stripe').length} checkouts
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#17192a] border border-[#282a44] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-white">Easypaisa & JazzCash Wallets</span>
                      </div>
                      <span className="text-neutral-300 font-bold">
                        {transactions.filter(t => t.paymentMethod === 'easypaisa' || t.paymentMethod === 'jazzcash').length} transfers
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#17192a] border border-[#282a44] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-white">Pakistani Bank IBAN (Meezan/SCB)</span>
                      </div>
                      <span className="text-neutral-300 font-bold">
                        {transactions.filter(t => t.paymentMethod === 'bank').length} wires
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#17192a] border border-[#282a44] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-white">Crypto USDT Desk (TRC-20 & BEP-20)</span>
                      </div>
                      <span className="text-neutral-300 font-bold">
                        {transactions.filter(t => t.paymentMethod === 'crypto').length} on-chain
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gateway Security & PCI Architecture Card */}
              <div className="p-5 rounded-2xl bg-[#0e101c] border border-[#22243d] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Strict Zero-Card Storage Architecture (PCI DSS Level 1)</h4>
                    <p className="text-neutral-400 font-sans text-xs mt-0.5 max-w-xl">
                      Card numbers and CVVs are directly tokenized through the payment provider’s secure components. No sensitive credentials ever touch your database or application servers.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentSubTab('gateways')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30"
                  >
                    Configure Gateway Keys
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= SUB-TAB 2: TRANSACTION HISTORY ================= */}
          {paymentSubTab === 'history' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="p-4 rounded-2xl bg-[#121422] border border-[#24273f] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    placeholder="Search by student name, email, or TX reference..."
                    className="w-full bg-[#181a2e] border border-[#2b2e4d] rounded-xl pl-9 pr-3 py-2 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Status & Course Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={txCourseFilter}
                    onChange={(e) => setTxCourseFilter(e.target.value as any)}
                    className="bg-[#181a2e] border border-[#2b2e4d] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Courses</option>
                    <option value="beginner">Beginner Track</option>
                    <option value="advanced">Advanced VIP</option>
                  </select>

                  <div className="flex items-center gap-1 bg-[#181a2e] p-1 rounded-xl border border-[#2b2e4d]">
                    {(['all', 'approved', 'pending', 'failed', 'refunded'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTxFilter(st)}
                        className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                          txFilter === st
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#24273f] bg-[#121422]">
                <table className="w-full min-w-[750px] text-left text-xs font-mono">
                  <thead className="bg-[#0e101a] text-neutral-400 text-[10px] uppercase border-b border-[#24273f]">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Gateway & Method</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Status & Verification</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2034] text-neutral-300">
                    {transactions
                      .filter(tx => {
                        if (txFilter !== 'all' && tx.status !== txFilter) return false;
                        if (txCourseFilter !== 'all' && tx.courseType !== txCourseFilter) return false;
                        if (txSearchQuery.trim()) {
                          const q = txSearchQuery.toLowerCase();
                          const matchesName = tx.userName?.toLowerCase().includes(q);
                          const matchesEmail = tx.userEmail?.toLowerCase().includes(q);
                          const matchesRef = tx.transactionReference?.toLowerCase().includes(q);
                          const matchesSender = tx.senderAccount?.toLowerCase().includes(q);
                          return matchesName || matchesEmail || matchesRef || matchesSender;
                        }
                        return true;
                      })
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#181a2e] transition-colors">
                          <td className="py-3 px-4 text-[11px] text-neutral-400 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{tx.userName}</span>
                            <span className="text-[10px] text-neutral-400 block">{tx.userEmail}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.courseType === 'advanced'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {tx.courseType === 'advanced' ? 'Advanced VIP' : 'Beginner'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white">${tx.amount} {tx.currency}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize text-neutral-200 block font-semibold">{tx.paymentMethod}</span>
                            <span className="text-[10px] text-neutral-500 font-sans uppercase">
                              {tx.gatewayType || 'banking'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white font-mono text-xs block">{tx.transactionReference}</span>
                            {tx.senderAccount && (
                              <span className="text-[10px] text-neutral-400 block font-sans">
                                Sender: {tx.senderAccount}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              tx.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : tx.status === 'refunded'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : tx.status === 'failed' || tx.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            }`}>
                              {tx.status === 'approved' && '✓ Approved & Active'}
                              {tx.status === 'refunded' && '↩ Refunded'}
                              {tx.status === 'failed' && '✕ Failed'}
                              {tx.status === 'rejected' && '✕ Rejected'}
                              {tx.status === 'pending' && '● Pending Review'}
                            </span>
                            {tx.refundReason && (
                              <span className="text-[10px] text-purple-300 block mt-0.5">
                                Reason: {tx.refundReason}
                              </span>
                            )}
                            {tx.failureReason && (
                              <span className="text-[10px] text-rose-400 block mt-0.5">
                                {tx.failureReason}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                            {tx.receiptUrl && (
                              <button
                                type="button"
                                onClick={() => setViewReceiptModal({ isOpen: true, url: tx.receiptUrl!, title: `Receipt: ${tx.userName} (${tx.transactionReference})` })}
                                className="px-2.5 py-1 rounded bg-[#1e2034] hover:bg-[#2a2d48] text-purple-300 text-[10px] font-bold border border-purple-500/30 cursor-pointer"
                              >
                                View Receipt
                              </button>
                            )}

                            {tx.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingTxId === tx.id}
                                  onClick={() => handleUpdateTxStatus(tx.id, 'approved')}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                                >
                                  {updatingTxId === tx.id ? '...' : 'Approve'}
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingTxId === tx.id}
                                  onClick={() => handleUpdateTxStatus(tx.id, 'rejected')}
                                  className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[10px] cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {tx.status === 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleOpenRefundModal(tx)}
                                className="px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-[10px] cursor-pointer"
                                title="Issue refund and revoke student course access"
                              >
                                Issue Refund
                              </button>
                            )}

                            {(tx.status === 'rejected' || tx.status === 'failed') && (
                              <button
                                type="button"
                                onClick={() => handleUpdateTxStatus(tx.id, 'approved')}
                                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] cursor-pointer"
                              >
                                Re-Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {transactions.length === 0 && (
                  <div className="py-10 text-center text-xs text-neutral-400 space-y-2">
                    <p>No transactions registered in database yet.</p>
                    <p className="text-[11px] text-neutral-500">
                      When students checkout with cards or submit bank receipts, transactions will log here automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= SUB-TAB 3: PAYMENT GATEWAY SETTINGS ================= */}
          {paymentSubTab === 'gateways' && (
            <div className="space-y-6">
              {/* Stripe Configuration Instructions Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-[#24273f] space-y-4">
                <div className="flex items-center justify-between border-b border-[#23253b] pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">Stripe Hosted Checkout & Secret Keys Configuration</h3>
                      <p className="text-xs text-neutral-400">Server-Side Environment Variables (Never exposed in frontend source)</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    gatewayInfo?.isStripeConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {gatewayInfo?.isStripeConfigured ? 'Stripe Connected & Verified' : 'Test Mode (Sandbox Fallback)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#0d0e18] border border-[#23253b] space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold">1. Secret Key (Backend)</span>
                    <p className="text-white font-bold">STRIPE_SECRET_KEY</p>
                    <span className="text-[10px] text-neutral-500">Stored strictly in server .env (e.g. sk_test_... or sk_live_...)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0d0e18] border border-[#23253b] space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold">2. Publishable Key</span>
                    <p className="text-white font-bold">STRIPE_PUBLISHABLE_KEY</p>
                    <span className="text-[10px] text-neutral-500">e.g. pk_test_... or pk_live_... for frontend tokenization</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0d0e18] border border-[#23253b] space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold">3. Signed Webhook Secret</span>
                    <p className="text-white font-bold">STRIPE_WEBHOOK_SECRET</p>
                    <span className="text-[10px] text-neutral-500">whsec_... for server webhook signature validation</span>
                  </div>
                </div>

                {/* Webhook Endpoint Guide */}
                <div className="p-4 rounded-xl bg-[#0a0b12] border border-[#222438] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300 font-bold">Your Production Webhook URL to register in Stripe Dashboard:</span>
                    <button
                      type="button"
                      onClick={copyWebhookUrl}
                      className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[10px] flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedWebhook ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedWebhook ? 'Copied URL!' : 'Copy Webhook URL'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-purple-300 text-xs break-all">
                    {window.location.origin}/api/payments/webhook
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Listen for events: <code className="text-neutral-200 font-mono">checkout.session.completed</code>, <code className="text-neutral-200 font-mono">payment_intent.succeeded</code>, <code className="text-neutral-200 font-mono">charge.refunded</code>.
                  </p>
                </div>
              </div>

              {/* Local Payment Gateways Configuration Form */}
              <form onSubmit={handleSavePricing} className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-[#24273f] space-y-5">
                <div className="flex items-center justify-between border-b border-[#23253b] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span>Domestic Banking, Mobile Wallets & Crypto Accounts</span>
                    </h3>
                    <p className="text-xs text-neutral-400">Displayed to students on checkout for manual transfers</p>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save All Gateways</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Easypaisa Title */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">Easypaisa Account Title</label>
                    <input
                      type="text"
                      value={pricingConfig.easypaisaTitle}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, easypaisaTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Easypaisa Number */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">Easypaisa Account Number</label>
                    <input
                      type="text"
                      value={pricingConfig.easypaisaNumber}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, easypaisaNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* JazzCash Title */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">JazzCash Account Title</label>
                    <input
                      type="text"
                      value={pricingConfig.jazzcashTitle}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, jazzcashTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* JazzCash Number */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">JazzCash Mobile Number</label>
                    <input
                      type="text"
                      value={pricingConfig.jazzcashNumber}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, jazzcashNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">Bank Name & Title</label>
                    <input
                      type="text"
                      value={pricingConfig.bankName}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Bank IBAN */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">Bank IBAN / Account Number</label>
                    <input
                      type="text"
                      value={pricingConfig.bankIban}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, bankIban: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* USDT TRC20 */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold font-mono">USDT Wallet (TRC-20 Address)</label>
                    <input
                      type="text"
                      value={pricingConfig.usdtTrc20Address}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, usdtTrc20Address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* USDT BEP20 */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold font-mono">USDT Wallet (BEP-20 Address)</label>
                    <input
                      type="text"
                      value={pricingConfig.usdtBep20Address}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, usdtBep20Address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* WhatsApp Support */}
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">WhatsApp Verification Desk</label>
                    <input
                      type="text"
                      value={pricingConfig.whatsappSupport}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, whatsappSupport: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#181a2e] border border-[#2b2e4d] text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Auto-Approve Toggle */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181a2e] border border-[#2b2e4d]">
                    <input
                      type="checkbox"
                      id="autoApproveToggle"
                      checked={!!pricingConfig.autoApproveInstant}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, autoApproveInstant: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <label htmlFor="autoApproveToggle" className="text-xs text-neutral-300 cursor-pointer">
                      <strong className="text-white block">Auto-Approve Instant Checkouts</strong>
                      Automatically unlock course access when reference is submitted
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Gateway Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= SUB-TAB 4: COURSE PRICING MANAGEMENT ================= */}
          {paymentSubTab === 'pricing' && (
            <div className="space-y-6">
              <form onSubmit={handleSavePricing} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Beginner Track Price Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-[#24273f] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                        Beginner Academy Course
                      </span>
                      <span className="text-xs font-mono text-neutral-400">One-Time Fee</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-400" />
                        <span>Beginner Course Price</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        Amount students pay to unlock the entire beginner curriculum, quizzes, and foundational recordings.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-[#181a2e] rounded-xl border border-[#2b2e4d]">
                      <span className="text-xl font-bold text-white font-mono pl-2">$</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={pricingConfig.beginnerPrice}
                        onChange={(e) => setPricingConfig({ ...pricingConfig, beginnerPrice: Number(e.target.value) })}
                        className="w-full bg-transparent text-lg text-white font-mono font-bold focus:outline-none"
                        required
                      />
                      <span className="text-xs font-mono text-neutral-400 pr-2">USD</span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono block mb-1.5 uppercase font-bold">
                        Quick Preset Amounts:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[2, 3, 5, 10, 24, 29].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPricingConfig({ ...pricingConfig, beginnerPrice: p })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                              pricingConfig.beginnerPrice === p
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-[#181a2e] text-neutral-300 hover:text-white border border-[#2b2e4d]'
                            }`}
                          >
                            ${p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Advanced VIP Course Price Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#121422] border border-[#24273f] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                        Advanced VIP Masterclass
                      </span>
                      <span className="text-xs font-mono text-neutral-400">One-Time Fee</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <span>Advanced VIP Masterclass Price</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        Amount students pay to unlock advanced order flow, live streaming desk access, and perpetual signals.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-[#181a2e] rounded-xl border border-[#2b2e4d]">
                      <span className="text-xl font-bold text-white font-mono pl-2">$</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={pricingConfig.advancedPrice}
                        onChange={(e) => setPricingConfig({ ...pricingConfig, advancedPrice: Number(e.target.value) })}
                        className="w-full bg-transparent text-lg text-white font-mono font-bold focus:outline-none"
                        required
                      />
                      <span className="text-xs font-mono text-neutral-400 pr-2">USD</span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono block mb-1.5 uppercase font-bold">
                        Quick Preset Amounts:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[2, 5, 10, 24, 49, 79].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPricingConfig({ ...pricingConfig, advancedPrice: p })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                              pricingConfig.advancedPrice === p
                                ? 'bg-amber-500 text-black font-bold shadow-md'
                                : 'bg-[#181a2e] text-neutral-300 hover:text-white border border-[#2b2e4d]'
                            }`}
                          >
                            ${p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Course Prices</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= SUB-TAB 5: ORDER & ENROLLMENT MANAGEMENT ================= */}
          {paymentSubTab === 'enrollments' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121422] border border-[#24273f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Student Course Access & Enrollment Roster</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    View active course unlocks and toggle student enrollments with one click.
                  </p>
                </div>

                <div className="text-xs text-neutral-400 font-mono">
                  Enrolled Students: <strong className="text-white">{usersList.filter(u => u.hasBeginnerAccess || u.hasAdvancedAccess).length}</strong>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#24273f] bg-[#121422]">
                <table className="w-full min-w-[700px] text-left text-xs font-mono">
                  <thead className="bg-[#0e101a] text-neutral-400 text-[10px] uppercase border-b border-[#24273f]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Role & Tier</th>
                      <th className="py-3 px-4">Beginner Course Access</th>
                      <th className="py-3 px-4">Advanced VIP Access</th>
                      <th className="py-3 px-4">Enrollment Date</th>
                      <th className="py-3 px-4 text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2034] text-neutral-300">
                    {usersList.map((st) => (
                      <tr key={st.id} className="hover:bg-[#181a2e] transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{st.name}</span>
                          <span className="text-[10px] text-neutral-400 block">{st.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            st.role === 'admin' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {st.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStudentAccess(st.id, 'beginner', !!st.hasBeginnerAccess)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              st.hasBeginnerAccess
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-900/30 hover:text-rose-300'
                                : 'bg-slate-800 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-300'
                            }`}
                          >
                            {st.hasBeginnerAccess ? '✓ Unlocked' : '✕ Locked'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStudentAccess(st.id, 'advanced', !!st.hasAdvancedAccess)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              st.hasAdvancedAccess
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-rose-900/30 hover:text-rose-300'
                                : 'bg-slate-800 text-slate-400 hover:bg-amber-500/20 hover:text-amber-300'
                            }`}
                          >
                            {st.hasAdvancedAccess ? '★ VIP Active' : '✕ Locked'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-[10px] text-neutral-400">
                          {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : 'Active Member'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleTier(st.id, st.tier)}
                            className="px-2.5 py-1 rounded bg-[#1e2034] hover:bg-[#2b2e4b] text-neutral-300 text-[10px] cursor-pointer"
                          >
                            {st.tier === 'premium' ? 'Demote to Free' : 'Promote to Premium'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= SUB-TAB 6: REFUND MANAGEMENT ================= */}
          {paymentSubTab === 'refunds' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121422] border border-[#24273f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    <span>Refund Administration Desk</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Refund transactions securely. Issuing a refund automatically revokes student course access.
                  </p>
                </div>

                <div className="text-xs font-mono text-neutral-400">
                  Total Refunds Issued: <strong className="text-rose-400">{transactions.filter(t => t.status === 'refunded').length}</strong>
                </div>
              </div>

              {/* Refunded Ledger Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#24273f] bg-[#121422]">
                <table className="w-full min-w-[700px] text-left text-xs font-mono">
                  <thead className="bg-[#0e101a] text-neutral-400 text-[10px] uppercase border-b border-[#24273f]">
                    <tr>
                      <th className="py-3 px-4">Refund Date</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Refund Amount</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Refund Reference / ID</th>
                      <th className="py-3 px-4 text-right">Access Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2034] text-neutral-300">
                    {transactions
                      .filter(t => t.status === 'refunded')
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#181a2e] transition-colors">
                          <td className="py-3 px-4 text-[11px] text-neutral-400 whitespace-nowrap">
                            {tx.refundedAt ? new Date(tx.refundedAt).toLocaleDateString() : new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{tx.userName}</span>
                            <span className="text-[10px] text-neutral-400 block">{tx.userEmail}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize text-neutral-300">{tx.courseType} Track</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-rose-400">
                            ${tx.refundAmount || tx.amount} {tx.currency}
                          </td>
                          <td className="py-3 px-4 text-neutral-300 text-xs">
                            {tx.refundReason || 'Customer requested refund'}
                          </td>
                          <td className="py-3 px-4 text-purple-300 text-[11px]">
                            {tx.refundId || `REF_${tx.id.substring(0, 8)}`}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Access Revoked
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {transactions.filter(t => t.status === 'refunded').length === 0 && (
                  <div className="py-10 text-center text-xs text-neutral-400 space-y-1">
                    <p>No refunds have been issued yet.</p>
                    <p className="text-[11px] text-neutral-500">
                      When a student requests a refund, go to Transaction History and click "Issue Refund".
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Beginners Video Lessons */}
      {activeTab === 'beginner_lessons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1814] via-[#10191c] to-[#0a1012] p-5 rounded-2xl border border-emerald-500/40 shadow-lg">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold mb-1 border border-emerald-500/30">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>BEGINNER TRACK CONTROLLER</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Beginner Academy Videos</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  {beginnerLessons.length} Videos
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                Upload and manage video lessons for beginners with custom thumbnails, video player preview, and downloadable study notes.
              </p>
            </div>

            <button
              type="button"
              onClick={openUploadBeginnerModal}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all shrink-0 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Beginner Video</span>
            </button>
          </div>

          {beginnerLessons.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-[#11131c] rounded-2xl border border-[#23253b] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">No Beginner Videos Uploaded Yet</h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Click the button below to upload your first beginner video lesson. You can attach a custom thumbnail and preview playback instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={openUploadBeginnerModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono inline-flex items-center gap-2 shadow-md shadow-emerald-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Beginner Video</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {beginnerLessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl bg-[#10121b] border border-[#23253b] hover:border-emerald-500/40 transition-all flex flex-col justify-between overflow-hidden shadow-lg group"
                >
                  <div>
                    {/* Thumbnail Preview with Play Overlay */}
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={getAutoThumbnail(lesson.videoUrl, lesson.thumbnailUrl)}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Play Button Overlay */}
                      <button
                        type="button"
                        onClick={() => setPlayingVideo(lesson)}
                        className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                        title="Click to play and test this video"
                      >
                        <div className="w-11 h-11 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </button>

                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 text-white border border-white/10">
                          LESSON #{idx + 1}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-neutral-300 border border-white/10 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          {lesson.durationMinutes || 20}m
                        </span>
                      </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold truncate">
                          {lesson.category || 'Trading Foundations'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Order #{lesson.order || idx + 1}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-emerald-300 transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 border-t border-[#1d1f30] bg-[#0c0d15] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPlayingVideo(lesson)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-300" />
                      <span>Play Video</span>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditLessonModal(lesson)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Edit Video Lesson"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          try {
                            await api.deleteLesson(lesson.id);
                          } catch (err) {
                            console.error(err);
                          }
                          onRefreshAll();
                        }}
                        onTouchEnd={async (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          try {
                            await api.deleteLesson(lesson.id);
                          } catch (err) {
                            console.error(err);
                          }
                          onRefreshAll();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Advanced VIP Video Lessons */}
      {activeTab === 'advanced_lessons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#170e24] via-[#151221] to-[#0c0a15] p-5 rounded-2xl border border-purple-500/40 shadow-lg">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold mb-1 border border-purple-500/30">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>ADVANCED VIP CONTROLLER</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Advanced Quantitative Videos</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                  {advancedLessons.length} Videos
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                Upload and manage video lessons for the VIP advanced track covering SMC, CVD delta absorption, and orderflow.
              </p>
            </div>

            <button
              type="button"
              onClick={openUploadAdvancedModal}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all shrink-0 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Advanced Video</span>
            </button>
          </div>

          {advancedLessons.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-[#11131c] rounded-2xl border border-[#23253b] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <PlayCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">No Advanced Videos Uploaded Yet</h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Click the button below to upload your first advanced video lesson. Attach custom thumbnails and verify playback anytime.
                </p>
              </div>
              <button
                type="button"
                onClick={openUploadAdvancedModal}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono inline-flex items-center gap-2 shadow-md shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Advanced Video</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advancedLessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl bg-[#10121b] border border-[#23253b] hover:border-purple-500/40 transition-all flex flex-col justify-between overflow-hidden shadow-lg group"
                >
                  <div>
                    {/* Thumbnail Preview with Play Overlay */}
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={getAutoThumbnail(lesson.videoUrl, lesson.thumbnailUrl)}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Play Button Overlay */}
                      <button
                        type="button"
                        onClick={() => setPlayingVideo(lesson)}
                        className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                        title="Click to play and test this video"
                      >
                        <div className="w-11 h-11 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/40">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </button>

                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 text-white border border-white/10">
                          ADVANCED #{idx + 1}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-neutral-300 border border-white/10 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {lesson.durationMinutes || 30}m
                        </span>
                      </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold truncate">
                          {lesson.category || 'Quantitative Mechanics'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Order #{lesson.order || idx + 1}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 border-t border-[#1d1f30] bg-[#0c0d15] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPlayingVideo(lesson)}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-purple-300" />
                      <span>Play Video</span>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditLessonModal(lesson)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Edit Video Lesson"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          try {
                            await api.deleteLesson(lesson.id);
                          } catch (err) {
                            console.error(err);
                          }
                          onRefreshAll();
                        }}
                        onTouchEnd={async (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          try {
                            await api.deleteLesson(lesson.id);
                          } catch (err) {
                            console.error(err);
                          }
                          onRefreshAll();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Live Classes Host Desk */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Host & Live Stream Controller
            </h3>
            <button
              onClick={() => setShowLiveModal(true)}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Radio className="w-4 h-4 animate-pulse" /> Start Live Class
            </button>
          </div>

          <div className="space-y-3">
            {liveClasses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-[#121824] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      c.status === 'live' ? 'bg-rose-600 text-white animate-pulse' :
                      c.status === 'upcoming' ? 'bg-blue-950 text-blue-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                    <span className="text-slate-400 font-mono">Platform: {c.platform}</span>
                    <span className="text-slate-400 font-mono">Attendees: {c.attendees.length}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.title}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{c.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.status !== 'live' && (
                    <button
                      onClick={async () => {
                        await api.updateLiveClass(c.id, { status: 'live' });
                        onRefreshAll();
                      }}
                      className="px-3 py-1.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40 text-xs font-medium hover:bg-rose-900/50"
                    >
                      Make Live
                    </button>
                  )}
                  {c.status === 'live' && (
                    <button
                      onClick={async () => {
                        await api.updateLiveClass(c.id, { status: 'completed' });
                        onRefreshAll();
                      }}
                      className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                    >
                      End Stream
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      try {
                        await api.deleteLiveClass(c.id);
                      } catch (err) {
                        console.error(err);
                      }
                      onRefreshAll();
                    }}
                    onTouchEnd={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      try {
                        await api.deleteLiveClass(c.id);
                      } catch (err) {
                        console.error(err);
                      }
                      onRefreshAll();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                    title="Delete Class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Spot Signals */}
      {activeTab === 'spot' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0c1824] via-[#0d1620] to-[#091017] p-5 rounded-2xl border border-cyan-500/40 shadow-lg">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold mb-1 border border-cyan-500/30">
                <Zap className="w-3.5 h-3.5" />
                <span>SPOT DESK CONTROLLER</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Spot Trading Signals</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                  {spotSignals.length} Active & Tracked
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                Publish verified spot accumulation setups with entry zones, target profits, and disciplined stop losses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSpotModal(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all shrink-0 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Spot Signal</span>
            </button>
          </div>

          {spotSignals.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-[#11131c] rounded-2xl border border-[#23253b] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <Zap className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">No Spot Signals Active</h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Click the button below to upload your first spot trade setup with entry price, targets, and stop-loss.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSpotModal(true)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono inline-flex items-center gap-2 shadow-md shadow-cyan-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Spot Signal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {spotSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-4 rounded-2xl bg-[#10121b] border border-[#23253b] hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-base font-bold text-white">{sig.pair}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sig.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {sig.direction}
                      </span>
                      <span className="text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                        Entry: ${sig.entryZone}
                      </span>
                      <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-bold">
                        TP1: ${sig.tp1}
                      </span>
                      <span className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                        SL: ${sig.stopLoss}
                      </span>
                    </div>
                    <p className="text-neutral-400 font-sans text-xs line-clamp-1">{sig.technicalReasoning}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={sig.status}
                      onChange={async (e) => {
                        await api.updateSpotSignal(sig.id, { status: e.target.value as SignalStatus });
                        onRefreshAll();
                      }}
                      className="bg-[#181928] border border-[#2c2e44] text-xs text-white rounded-xl px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Target 1 Hit">Target 1 Hit</option>
                      <option value="Target 2 Hit">Target 2 Hit</option>
                      <option value="Target 3 Hit">Target 3 Hit</option>
                      <option value="Stop Loss Hit">Stop Loss Hit</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          await api.deleteSpotSignal(sig.id);
                        } catch (err) {
                          console.error(err);
                        }
                        onRefreshAll();
                      }}
                      onTouchEnd={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          await api.deleteSpotSignal(sig.id);
                        } catch (err) {
                          console.error(err);
                        }
                        onRefreshAll();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                      title="Delete Signal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Futures Signals */}
      {activeTab === 'futures' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#24170d] via-[#1f140c] to-[#140c07] p-5 rounded-2xl border border-amber-500/40 shadow-lg">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold mb-1 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5" />
                <span>FUTURES DESK CONTROLLER</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                <span>Perpetual Futures Signals</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                  {futuresSignals.length} Active & Tracked
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                Publish high-leverage perpetual futures contracts with leverage tiers, CVD divergence notes, and liquidation pool targets.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFuturesModal(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:opacity-95 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all shrink-0 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Futures Signal</span>
            </button>
          </div>

          {futuresSignals.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-[#11131c] rounded-2xl border border-[#23253b] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Flame className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">No Futures Signals Active</h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Click the button below to publish your first high-leverage futures signal with entry zone, leverage, and take-profit targets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFuturesModal(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-mono inline-flex items-center gap-2 shadow-md shadow-amber-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Futures Signal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {futuresSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-4 rounded-2xl bg-[#10121b] border border-[#23253b] hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-base font-bold text-white">{sig.pair}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sig.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {sig.direction} {sig.leverage}
                      </span>
                      <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        FR: {sig.fundingRate}
                      </span>
                      <span className="text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                        Entry: ${sig.entryZone}
                      </span>
                      <span className="text-emerald-400 font-bold">TP1: ${sig.tp1}</span>
                      <span className="text-rose-400">SL: ${sig.stopLoss}</span>
                    </div>
                    <p className="text-neutral-400 font-sans text-xs line-clamp-1">{sig.technicalReasoning}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={sig.status}
                      onChange={async (e) => {
                        await api.updateFuturesSignal(sig.id, { status: e.target.value as SignalStatus });
                        onRefreshAll();
                      }}
                      className="bg-[#181928] border border-[#2c2e44] text-xs text-white rounded-xl px-3 py-1.5 font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option value="Active">Active</option>
                      <option value="TP1 Hit">TP1 Hit</option>
                      <option value="TP2 Hit">TP2 Hit</option>
                      <option value="TP3 Hit">TP3 Hit</option>
                      <option value="Stop Loss Hit">Stop Loss Hit</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          await api.deleteFuturesSignal(sig.id);
                        } catch (err) {
                          console.error(err);
                        }
                        onRefreshAll();
                      }}
                      onTouchEnd={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        try {
                          await api.deleteFuturesSignal(sig.id);
                        } catch (err) {
                          console.error(err);
                        }
                        onRefreshAll();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                      title="Delete Signal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Official Channels & Communities Desk */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171717] p-5 rounded-2xl border border-[#2a2a2a]">
            <div>
              <span className="text-xs font-mono uppercase text-sky-400 font-bold flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-sky-400" /> Channels & Social Feeds Desk
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                Official Media & Community Channels
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                Add and manage your YouTube, Telegram, WhatsApp, Instagram, Discord, and Twitter links. These appear instantly in the student "Channel" modal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingChannelId(null);
                setChannelForm({
                  title: '',
                  platform: 'youtube',
                  url: '',
                  handle: '',
                  description: '',
                  subscribers: '',
                  active: true,
                });
                setShowChannelModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-sky-600/30 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Official Channel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.length === 0 ? (
              <div className="col-span-full p-10 text-center rounded-2xl bg-[#141524] border border-[#24263b] text-neutral-400 space-y-2">
                <Share2 className="w-8 h-8 text-neutral-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Official Channels Configured</h4>
                <p className="text-xs text-neutral-400">Click "+ Add Official Channel" above to add your community links.</p>
              </div>
            ) : (
              channels.map((chan) => (
                <div
                  key={chan.id}
                  className="p-4 rounded-xl bg-[#121824] border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate text-sm">{chan.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[#1a1f2e] text-sky-400 border border-sky-800/40">
                        {chan.platform}
                      </span>
                      {chan.subscribers && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {chan.subscribers}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs truncate font-mono">{chan.handle || chan.url}</p>
                    {chan.description && (
                      <p className="text-slate-400 text-xs line-clamp-1">{chan.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleChannelStatus(chan.id, chan.active)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                        chan.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}
                      title="Toggle visibility"
                    >
                      {chan.active ? 'Visible' : 'Hidden'}
                    </button>
                    <a
                      href={chan.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                      title="Open link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChannelId(chan.id);
                        setChannelForm(chan);
                        setShowChannelModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteChannel(chan.id, chan.title);
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteChannel(chan.id, chan.title);
                      }}
                      className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
                      title="Delete Channel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Learning Materials & Downloadable Course Study Files
            </h3>
            <button
              onClick={() => setShowMaterialModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Upload Material
            </button>
          </div>

          <div className="space-y-3">
            {materials.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#121824] border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.title}</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                      {m.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{m.fileSize}</span>
                  </div>
                  <p className="text-slate-400 mt-1">{m.description}</p>
                </div>

                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    try {
                      await api.deleteMaterial(m.id);
                    } catch (err) {
                      console.error(err);
                    }
                    onRefreshAll();
                  }}
                  onTouchEnd={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    try {
                      await api.deleteMaterial(m.id);
                    } catch (err) {
                      console.error(err);
                    }
                    onRefreshAll();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                  title="Delete Material"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Official Platform Dispatches
            </h3>
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> New Announcement
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-[#121824] border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-slate-800 text-slate-300">
                      {a.priority}
                    </span>
                    <span className="font-bold text-white">{a.title}</span>
                  </div>
                  <p className="text-slate-400">{a.content}</p>
                </div>

                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    try {
                      await api.deleteAnnouncement(a.id);
                    } catch (err) {
                      console.error(err);
                    }
                    onRefreshAll();
                  }}
                  onTouchEnd={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    try {
                      await api.deleteAnnouncement(a.id);
                    } catch (err) {
                      console.error(err);
                    }
                    onRefreshAll();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Students & RBAC */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Student Accounts, RBAC Roles & Membership Tiers
          </h3>

          <div className="rounded-xl bg-[#121824] border border-slate-800 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs font-mono">
              <thead className="bg-[#0b0e14] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Access Tier</th>
                  <th className="py-3 px-4">Beginner Access</th>
                  <th className="py-3 px-4">Advanced VIP Access</th>
                  <th className="py-3 px-4 text-right">Actions (Toggle Course Access)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-[#151c2a]">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-slate-500">{u.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.tier === 'premium' ? 'bg-blue-950 text-blue-400 border border-blue-800/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStudentAccess(u.id, 'beginner', !!u.hasBeginnerAccess)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                          u.hasBeginnerAccess
                            ? 'bg-[#10a37f]/20 text-[#10a37f] border border-[#10a37f]/30 hover:bg-rose-900/30 hover:text-rose-300'
                            : 'bg-slate-800 text-slate-400 hover:bg-[#10a37f]/20 hover:text-[#10a37f]'
                        }`}
                      >
                        {u.hasBeginnerAccess ? '✓ Unlocked' : '✕ Locked'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStudentAccess(u.id, 'advanced', !!u.hasAdvancedAccess)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                          u.hasAdvancedAccess
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-rose-900/30 hover:text-rose-300'
                            : 'bg-slate-800 text-slate-400 hover:bg-amber-500/20 hover:text-amber-300'
                        }`}
                      >
                        {u.hasAdvancedAccess ? '★ VIP Active' : '✕ Locked'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleTier(u.id, u.tier)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200"
                      >
                        {u.tier === 'premium' ? 'Demote to Free' : 'Grant Premium'}
                      </button>
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300"
                      >
                        {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Lesson */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveLesson}
            className="w-full max-w-xl bg-[#121422] border border-[#2b2d42] rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#25273b] pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <span>{editingLessonId ? 'Edit Video Lesson' : 'Upload Video Lesson'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowLessonModal(false);
                  setEditingLessonId(null);
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Track Level</label>
                <select
                  value={lessonForm.level}
                  onChange={(e) => setLessonForm({ ...lessonForm, level: e.target.value as any })}
                  className="w-full bg-[#181928] border border-[#2c2e44] rounded-xl p-2.5 text-white font-mono"
                >
                  <option value="beginner">Beginner Track</option>
                  <option value="advanced">Advanced Track</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Access Tier</label>
                <select
                  value={lessonForm.tier}
                  onChange={(e) => setLessonForm({ ...lessonForm, tier: e.target.value as any })}
                  className="w-full bg-[#181928] border border-[#2c2e44] rounded-xl p-2.5 text-white font-mono"
                >
                  <option value="free">Free Preview</option>
                  <option value="premium">Premium Access</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-neutral-300 text-xs block mb-1 font-semibold">Video Title</label>
              <input
                type="text"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="w-full bg-[#181928] border border-[#2c2e44] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g. Lesson 01: Candlestick Anatomy & Liquidity Zones"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Category</label>
                <input
                  type="text"
                  value={lessonForm.category}
                  onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
                  className="w-full bg-[#181928] border border-[#2c2e44] rounded-xl p-2 text-xs text-white"
                  placeholder="e.g. Crypto Foundations or SMC"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-semibold">Duration (Minutes)</label>
                <input
                  type="number"
                  value={lessonForm.durationMinutes}
                  onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })}
                  className="w-full bg-[#181928] border border-[#2c2e44] rounded-xl p-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            {/* Video File / URL */}
            <div className="p-3.5 rounded-2xl bg-[#161726] border border-[#27293d] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-white font-semibold flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Course Video Source</span>
                </label>
                {lessonForm.videoUrl && (
                  <span className="text-[10px] text-emerald-400 font-mono">✓ Video Ready</span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={lessonForm.videoUrl || ''}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="Paste YouTube, Google Drive, Vimeo, or direct MP4 stream URL (Supports 1–2+ Hour Long Lectures)"
                  className="flex-1 bg-[#1c1d2e] border border-[#2c2e44] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
                {extractYouTubeId(lessonForm.videoUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      const ytId = extractYouTubeId(lessonForm.videoUrl);
                      if (ytId) {
                        setLessonForm(prev => ({
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

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">
                  Or Attach Video from Device Gallery (Zero-Lag Direct Streaming):
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="w-full text-[10px] text-neutral-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
                {lessonForm.videoUrl?.startsWith('blob:') && (
                  <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Device video linked with zero RAM lag.
                  </p>
                )}
              </div>
            </div>

            {/* VIDEO THUMBNAIL SECTION */}
            <div className="p-3.5 rounded-2xl bg-[#161726] border border-[#27293d] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-white font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>Video Thumbnail</span>
                </label>
                <span className="text-[10px] font-mono text-purple-300">
                  Custom image, upload, or preset
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Custom Thumbnail Image URL</label>
                  <input
                    type="text"
                    value={lessonForm.thumbnailUrl || ''}
                    onChange={(e) => setLessonForm({ ...lessonForm, thumbnailUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or jpg/png"
                    className="w-full bg-[#1c1d2e] border border-[#2c2e44] rounded-lg p-2 text-xs text-white placeholder-neutral-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Or Upload Image from Device</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="w-full text-[10px] text-neutral-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Preset Thumbnails */}
              <div>
                <span className="text-[10px] text-neutral-400 block mb-1 font-mono">Trading Thumbnail Presets:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {THUMBNAIL_PRESETS.map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => setLessonForm({ ...lessonForm, thumbnailUrl: pr.url })}
                      className={`p-1.5 rounded-lg border text-[10px] text-left truncate transition-colors ${
                        lessonForm.thumbnailUrl === pr.url
                          ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                          : 'bg-[#1a1b2b] border-[#2c2e44] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {pr.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Thumbnail Preview Box */}
              <div className="pt-1 flex items-center gap-4">
                <div className="relative aspect-video w-44 rounded-xl overflow-hidden bg-black border border-[#2e3047] shrink-0">
                  <img
                    src={getAutoThumbnail(lessonForm.videoUrl, lessonForm.thumbnailUrl)}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                    ✓ Live Thumbnail Preview
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    This thumbnail will display on student academy cards with the duration badge.
                  </p>
                  {lessonForm.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setPlayingVideo(lessonForm as Lesson)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono hover:bg-emerald-500/30 font-bold"
                    >
                      <Play className="w-3 h-3 fill-emerald-300" />
                      <span>Test / Preview Video</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-neutral-300 text-xs block mb-1 font-semibold">Brief Description</label>
              <textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                className="w-full bg-[#181928] border border-[#2c2e44] rounded-xl p-2.5 text-xs text-white h-16 resize-none"
                placeholder="What will students learn in this video lesson?"
                required
              />
            </div>

            {/* PDF Notes */}
            <div className="p-3 rounded-xl bg-[#161726] border border-[#27293d] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-white font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-400" /> Course Study Notes & PDF (Optional)
                </label>
                {lessonForm.pdfUrl && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✓ {lessonForm.pdfTitle || 'File Attached'}
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handlePdfUpload}
                className="w-full text-[10px] text-neutral-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-[#2c2e44] file:text-white hover:file:bg-[#3a3c57] cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#25273b]">
              <button
                type="button"
                onClick={() => {
                  setShowLessonModal(false);
                  setEditingLessonId(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#1e2030] text-neutral-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold font-mono shadow-lg shadow-emerald-500/25"
              >
                {editingLessonId ? 'Update Video Lesson' : 'Save & Publish Video'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Start Live Class */}
      {showLiveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateLiveClass}
            className="w-full max-w-lg bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> Host Live Trading Class
              </h3>
              <button type="button" onClick={() => setShowLiveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Class Title</label>
              <input
                type="text"
                value={liveForm.title}
                onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                placeholder="e.g. New York Open Live Scalping & Order Book Flow"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Description</label>
              <textarea
                value={liveForm.description}
                onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white h-16"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Streaming Platform</label>
                <select
                  value={liveForm.platform}
                  onChange={(e) => setLiveForm({ ...liveForm, platform: e.target.value as any })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                >
                  <option value="YouTube Live">YouTube Live</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="TradingView Stream">TradingView Stream</option>
                  <option value="Zoom">Zoom</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Status</label>
                <select
                  value={liveForm.status}
                  onChange={(e) => setLiveForm({ ...liveForm, status: e.target.value as any })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                >
                  <option value="live">Live Now</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed / Archive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Embed Stream URL (e.g. YouTube Live Embed)</label>
              <input
                type="text"
                value={liveForm.streamUrl}
                onChange={(e) => setLiveForm({ ...liveForm, streamUrl: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">External Meeting Link (Google Meet / Zoom)</label>
              <input
                type="text"
                value={liveForm.meetingLink}
                onChange={(e) => setLiveForm({ ...liveForm, meetingLink: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowLiveModal(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Start & Broadcast Live Class
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Publish Spot Signal */}
      {showSpotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateSpotSignal}
            className="w-full max-w-lg bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Publish Spot Signal
              </h3>
              <button type="button" onClick={() => setShowSpotModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Pair</label>
                <input
                  type="text"
                  value={spotForm.pair}
                  onChange={(e) => setSpotForm({ ...spotForm, pair: e.target.value.toUpperCase() })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Direction</label>
                <select
                  value={spotForm.direction}
                  onChange={(e) => setSpotForm({ ...spotForm, direction: e.target.value as any })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Timeframe</label>
                <input
                  type="text"
                  value={spotForm.timeframe}
                  onChange={(e) => setSpotForm({ ...spotForm, timeframe: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  placeholder="e.g. 4H"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Entry Zone</label>
                <input
                  type="text"
                  value={spotForm.entryZone}
                  onChange={(e) => setSpotForm({ ...spotForm, entryZone: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Stop Loss</label>
                <input
                  type="text"
                  value={spotForm.stopLoss}
                  onChange={(e) => setSpotForm({ ...spotForm, stopLoss: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target 1</label>
                <input
                  type="text"
                  value={spotForm.tp1}
                  onChange={(e) => setSpotForm({ ...spotForm, tp1: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target 2</label>
                <input
                  type="text"
                  value={spotForm.tp2}
                  onChange={(e) => setSpotForm({ ...spotForm, tp2: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target 3</label>
                <input
                  type="text"
                  value={spotForm.tp3}
                  onChange={(e) => setSpotForm({ ...spotForm, tp3: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Technical Reasoning & Context</label>
              <textarea
                value={spotForm.technicalReasoning}
                onChange={(e) => setSpotForm({ ...spotForm, technicalReasoning: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white h-16"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSpotModal(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Publish Spot Signal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Publish Futures Signal */}
      {showFuturesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateFuturesSignal}
            className="w-full max-w-lg bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" /> Publish Perpetual Futures Signal
              </h3>
              <button type="button" onClick={() => setShowFuturesModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Pair</label>
                <input
                  type="text"
                  value={futuresForm.pair}
                  onChange={(e) => setFuturesForm({ ...futuresForm, pair: e.target.value.toUpperCase() })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Direction</label>
                <select
                  value={futuresForm.direction}
                  onChange={(e) => setFuturesForm({ ...futuresForm, direction: e.target.value as any })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                >
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Leverage</label>
                <input
                  type="text"
                  value={futuresForm.leverage}
                  onChange={(e) => setFuturesForm({ ...futuresForm, leverage: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  placeholder="e.g. 10x"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Margin Type</label>
                <select
                  value={futuresForm.marginType}
                  onChange={(e) => setFuturesForm({ ...futuresForm, marginType: e.target.value as any })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                >
                  <option value="Isolated">Isolated Margin</option>
                  <option value="Cross">Cross Margin</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Funding Rate</label>
                <input
                  type="text"
                  value={futuresForm.fundingRate}
                  onChange={(e) => setFuturesForm({ ...futuresForm, fundingRate: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  placeholder="+0.0065%"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Entry Zone</label>
                <input
                  type="text"
                  value={futuresForm.entryZone}
                  onChange={(e) => setFuturesForm({ ...futuresForm, entryZone: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Stop Loss</label>
                <input
                  type="text"
                  value={futuresForm.stopLoss}
                  onChange={(e) => setFuturesForm({ ...futuresForm, stopLoss: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">TP 1</label>
                <input
                  type="text"
                  value={futuresForm.tp1}
                  onChange={(e) => setFuturesForm({ ...futuresForm, tp1: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">TP 2</label>
                <input
                  type="text"
                  value={futuresForm.tp2}
                  onChange={(e) => setFuturesForm({ ...futuresForm, tp2: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">TP 3</label>
                <input
                  type="text"
                  value={futuresForm.tp3}
                  onChange={(e) => setFuturesForm({ ...futuresForm, tp3: e.target.value })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">CVD & Order Book Observations</label>
              <input
                type="text"
                value={futuresForm.cvdObservations}
                onChange={(e) => setFuturesForm({ ...futuresForm, cvdObservations: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                placeholder="e.g. Bullish delta divergence on 1H chart; limit absorption at support."
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Liquidation Levels</label>
              <input
                type="text"
                value={futuresForm.liquidationLevels}
                onChange={(e) => setFuturesForm({ ...futuresForm, liquidationLevels: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                placeholder="e.g. Short squeeze cascade target at $66,200 ($120M)."
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Technical Setup Rationale</label>
              <textarea
                value={futuresForm.technicalReasoning}
                onChange={(e) => setFuturesForm({ ...futuresForm, technicalReasoning: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white h-16"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowFuturesModal(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Publish Futures Signal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Announcement */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAnnouncement}
            className="w-full max-w-md bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Post Announcement</h3>
              <button type="button" onClick={() => setShowAnnounceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Priority</label>
              <select
                value={announceForm.priority}
                onChange={(e) => setAnnounceForm({ ...announceForm, priority: e.target.value as any })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Title</label>
              <input
                type="text"
                value={announceForm.title}
                onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Content</label>
              <textarea
                value={announceForm.content}
                onChange={(e) => setAnnounceForm({ ...announceForm, content: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white h-24"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAnnounceModal(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Broadcast Notice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Upload Material */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateMaterial}
            className="w-full max-w-md bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Upload Course Material</h3>
              <button type="button" onClick={() => setShowMaterialModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Type</label>
                <select
                  value={materialForm.type}
                  onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value as any })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                >
                  <option value="PDF Guide">PDF Guide</option>
                  <option value="Cheat Sheet">Cheat Sheet</option>
                  <option value="Spreadsheet">Spreadsheet</option>
                  <option value="Strategy Playbook">Strategy Playbook</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Access Tier</label>
                <select
                  value={materialForm.tier}
                  onChange={(e) => setMaterialForm({ ...materialForm, tier: e.target.value as any })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                >
                  <option value="public">Public</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Title</label>
              <input
                type="text"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Category</label>
              <input
                type="text"
                value={materialForm.category}
                onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                placeholder="e.g. Order Flow or Risk Management"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Description</label>
              <textarea
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white h-20"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowMaterialModal(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Upload File Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add / Edit Official Channel */}
      {showChannelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveChannel}
            className="w-full max-w-md bg-[#121824] border border-slate-800 rounded-2xl p-6 space-y-3.5 my-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  {editingChannelId ? 'Edit Official Channel' : 'Add Official Channel'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChannelModal(false);
                  setEditingChannelId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Platform</label>
                <select
                  value={channelForm.platform}
                  onChange={(e) => setChannelForm({ ...channelForm, platform: e.target.value as any })}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                >
                  <option value="youtube">YouTube</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="discord">Discord</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="other">Other Link</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subscribers / Badge</label>
                <input
                  type="text"
                  value={channelForm.subscribers || ''}
                  onChange={(e) => setChannelForm({ ...channelForm, subscribers: e.target.value })}
                  placeholder="e.g. 150K Members"
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Channel Title</label>
              <input
                type="text"
                value={channelForm.title || ''}
                onChange={(e) => setChannelForm({ ...channelForm, title: e.target.value })}
                placeholder="e.g. Official VIP Signals Telegram"
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Target URL / Invitation Link</label>
              <input
                type="url"
                value={channelForm.url || ''}
                onChange={(e) => setChannelForm({ ...channelForm, url: e.target.value })}
                placeholder="https://t.me/yourchannel or https://youtube.com/@..."
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Handle / Username (Optional)</label>
              <input
                type="text"
                value={channelForm.handle || ''}
                onChange={(e) => setChannelForm({ ...channelForm, handle: e.target.value })}
                placeholder="@coursecrash.official"
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Description (Optional)</label>
              <textarea
                value={channelForm.description || ''}
                onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                placeholder="Brief description for students..."
                className="w-full bg-[#0b0e14] border border-slate-800 rounded p-2 text-xs text-white h-16"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowChannelModal(false);
                  setEditingChannelId(null);
                }}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                {editingChannelId ? 'Update Channel' : 'Add Channel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DEDICATED ADMIN VIDEO PLAYER MODAL - Perfectly sized for Mobile, Tablet & Laptop */}
      {playingVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPlayingVideo(null);
          }}
        >
          <div className="relative w-full max-w-2xl lg:max-w-3xl max-h-[90vh] bg-[#0e101a] border border-[#282a3f] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#202235] flex items-center justify-between bg-[#121422] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  playingVideo.level === 'beginner'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold shrink-0 ${
                      playingVideo.level === 'beginner'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : 'bg-purple-950 text-purple-400 border border-purple-800/40'
                    }`}>
                      {playingVideo.level === 'beginner' ? 'Beginner Lesson' : 'Advanced VIP'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono truncate hidden sm:inline">
                      {playingVideo.category || 'Trading Curriculum'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                    {playingVideo.title}
                  </h3>
                </div>
              </div>

              {/* Close Button - Clear English */}
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
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

            {/* Video Player Display Area - Constrained to 48vh so it fits inside any screen comfortably */}
            <div className="aspect-video max-h-[48vh] sm:max-h-[50vh] w-full bg-black relative flex items-center justify-center shrink-0 overflow-hidden">
              {playingVideo.videoUrl && isDirectVideo(playingVideo.videoUrl) ? (
                <video
                  src={playingVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[48vh] sm:max-h-[50vh] object-contain"
                />
              ) : playingVideo.videoUrl ? (
                <iframe
                  src={getEmbedUrl(playingVideo.videoUrl)}
                  title={playingVideo.title}
                  className="w-full h-full max-h-[48vh] sm:max-h-[50vh] border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8 text-neutral-500 text-xs font-mono space-y-2">
                  <PlayCircle className="w-10 h-10 mx-auto text-neutral-600" />
                  <p>No video URL attached to this lesson.</p>
                </div>
              )}
            </div>

            {/* Video Player Footer & Metadata - Scrollable if description is long */}
            <div className="p-3.5 sm:p-4 space-y-2.5 bg-[#0d0f18] border-t border-[#1d1f2e] overflow-y-auto max-h-[26vh] shrink">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Duration: {playingVideo.durationMinutes || 20}m</span>
                  </span>
                  <span>•</span>
                  <span>Lesson #{playingVideo.order || 1}</span>
                  <span>•</span>
                  <span className="capitalize text-neutral-300">Tier: {playingVideo.tier}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const v = playingVideo;
                      setPlayingVideo(null);
                      openEditLessonModal(v);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlayingVideo(null)}
                    className="px-4 py-1.5 rounded-xl bg-[#1d1f30] hover:bg-[#282a40] text-white text-xs font-mono transition-colors cursor-pointer"
                  >
                    Close Video
                  </button>
                </div>
              </div>

              {playingVideo.description && (
                <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                  {playingVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && selectedTxForRefund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleProcessRefund}
            className="w-full max-w-lg bg-[#121422] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-[#25273b] pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                <span>Process Payment Refund</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedTxForRefund(null);
                }}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Transaction Summary */}
            <div className="p-3.5 rounded-2xl bg-[#17192a] border border-[#272a44] space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Student:</span>
                <span className="font-bold text-white">{selectedTxForRefund.userName} ({selectedTxForRefund.userEmail})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Course:</span>
                <span className="uppercase text-amber-300 font-bold">{selectedTxForRefund.courseType} Track</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Paid Amount:</span>
                <span className="font-bold text-emerald-400">${selectedTxForRefund.amount} {selectedTxForRefund.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Transaction Ref:</span>
                <span className="text-purple-300">{selectedTxForRefund.transactionReference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Payment Gateway:</span>
                <span className="capitalize text-neutral-200">{selectedTxForRefund.gatewayType || selectedTxForRefund.paymentMethod}</span>
              </div>
            </div>

            {/* Refund Reason */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Reason for Refund:
              </label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Student requested cancellation within guarantee window"
                className="w-full bg-[#181928] border border-[#2c2e44] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                required
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Customer requested refund',
                  'Duplicate purchase error',
                  'Accidental duplicate checkout',
                  'Dissatisfied with curriculum'
                ].map((reasonText) => (
                  <button
                    key={reasonText}
                    type="button"
                    onClick={() => setRefundReason(reasonText)}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#1a1c2d] hover:bg-[#25283f] text-neutral-400 hover:text-white border border-[#2c2e44] transition-colors"
                  >
                    {reasonText}
                  </button>
                ))}
              </div>
            </div>

            {/* Refund Amount */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Refund Amount (USD):
              </label>
              <div className="flex items-center gap-2 p-2 bg-[#181928] border border-[#2c2e44] rounded-xl">
                <span className="text-white font-mono font-bold">$</span>
                <input
                  type="number"
                  min="0.5"
                  max={selectedTxForRefund.amount}
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                  required
                />
                <span className="text-neutral-400 text-xs font-mono">{selectedTxForRefund.currency}</span>
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Max refundable: ${selectedTxForRefund.amount} {selectedTxForRefund.currency}
              </span>
            </div>

            {/* Warning Callout */}
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="font-bold block">Course Access Revocation Notice</strong>
                <p className="text-[11px] text-rose-300/90 leading-relaxed">
                  Executing this refund will immediately revoke the student's access to this course in the database and update this order status to refunded.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedTxForRefund(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#1c1d2e] hover:bg-[#26283d] text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refundProcessing}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-mono font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${refundProcessing ? 'animate-spin' : ''}`} />
                <span>{refundProcessing ? 'Processing Refund...' : 'Confirm & Execute Refund'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Receipt Proof Modal */}
      {viewReceiptModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#121422] border border-[#2b2d42] rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-[#25273b] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-mono">{viewReceiptModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewReceiptModal({ isOpen: false, url: '', title: '' })}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-auto max-h-[70vh] overflow-auto rounded-xl bg-black border border-[#24263b] flex items-center justify-center p-2">
              <img
                src={viewReceiptModal.url}
                alt="Payment Receipt"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-neutral-400">Direct image link stored securely in database.</span>
              <button
                type="button"
                onClick={() => setViewReceiptModal({ isOpen: false, url: '', title: '' })}
                className="px-4 py-1.5 rounded-xl bg-[#1e2034] hover:bg-[#282a44] text-white text-xs font-mono cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 0-100% Upload Progress Modal Overlay */}
      <UploadProgressModal state={uploadProgress} />
    </div>
  );
};
