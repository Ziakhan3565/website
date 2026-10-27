import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { HomeDashboard } from './components/dashboard/HomeDashboard.tsx';
import { BeginnerAcademy } from './components/academy/BeginnerAcademy.tsx';
import { AdvancedAcademy } from './components/academy/AdvancedAcademy.tsx';
import { LiveClassesView } from './components/live/LiveClassesView.tsx';
import { SpotSignalsView } from './components/signals/SpotSignalsView.tsx';
import { FuturesSignalsView } from './components/signals/FuturesSignalsView.tsx';
import { SignalsSectionView } from './components/signals/SignalsSectionView.tsx';
import { MarketOverviewView } from './components/market/MarketOverviewView.tsx';
import { LearningMaterialsView } from './components/materials/LearningMaterialsView.tsx';
import { AnnouncementsView } from './components/announcements/AnnouncementsView.tsx';
import { ProfileView } from './components/profile/ProfileView.tsx';
import { AdminPanel } from './components/admin/AdminPanel.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { CoursePaymentModal } from './components/payment/CoursePaymentModal.tsx';
import { Footer } from './components/common/Footer.tsx';
import { LegalModals, type LegalModalType } from './components/common/LegalModals.tsx';
import { TopNavModals } from './components/navigation/TopNavModals.tsx';
import { GlobalLiveBar } from './components/common/GlobalLiveBar.tsx';
import { MobileBottomNav } from './components/navigation/MobileBottomNav.tsx';
import { PwaInstallBanner } from './components/common/PwaInstallBanner.tsx';
import { StoryViewerModal } from './components/stories/StoryViewerModal.tsx';
import { CreateStoryModal } from './components/stories/CreateStoryModal.tsx';
import { storiesService } from './services/storiesService.ts';
import { api } from './services/api.ts';
import type {
  Lesson,
  LiveClass,
  SpotSignal,
  FuturesSignal,
  MarketTicker,
  LearningMaterial,
  Announcement,
  SignalStatus,
  CoursePricingConfig,
  StoryItem
} from './types/index.ts';

function MainApp() {
  const { user, refreshUser } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'beginner' | 'advanced'>('beginner');
  const [paymentAlert, setPaymentAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);
  const [topNavModal, setTopNavModal] = useState<'channel' | 'service' | 'about' | 'feedback' | null>(null);

  // Stories system state
  const [stories, setStories] = useState<StoryItem[]>(() => storiesService.getStories());
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [createStoryModalOpen, setCreateStoryModalOpen] = useState(false);

  // Check URL callback parameters from hosted checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');
    const course = params.get('course') as 'beginner' | 'advanced' | null;

    if (paymentStatus === 'stripe_success' && sessionId) {
      api.verifyCheckoutSession(sessionId)
        .then((res) => {
          refreshUser();
          setPaymentAlert({
            type: 'success',
            message: res.message || 'Payment verified! Your course access is now unlocked.'
          });
          if (course) setCurrentView(course);
        })
        .catch((err) => {
          setPaymentAlert({
            type: 'error',
            message: err.message || 'Payment verification failed.'
          });
        })
        .finally(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    } else if (paymentStatus === 'stripe_cancelled') {
      setPaymentAlert({
        type: 'info',
        message: 'Stripe checkout was cancelled. No funds were charged.'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Strict access guard & Auto-onboarding tutorial on login/signup:
  // When admin logs in, switch view directly to admin panel.
  // When student signs up or logs in, open the onboarding tutorial walkthrough automatically on home.
  useEffect(() => {
    if (!user) {
      setAuthModalOpen(true);
      if (currentView === 'admin') {
        setCurrentView('home');
      }
    } else if (user.role === 'admin') {
      // Admin logged in -> open Admin Panel directly
      setCurrentView('admin');
    } else {
      // Regular student logged in
      if (currentView === 'admin') {
        setCurrentView('home');
      }
    }
  }, [user]);

  // Reset scroll to top whenever navigation changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

  const handleOpenPayment = (plan: 'beginner' | 'advanced') => {
    setPaymentPlan(plan);
    setPaymentModalOpen(true);
  };

  // Core platform datasets
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [spotSignals, setSpotSignals] = useState<SpotSignal[]>([]);
  const [futuresSignals, setFuturesSignals] = useState<FuturesSignal[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pricing, setPricing] = useState<CoursePricingConfig>({
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

  // Real Binance Market Data State
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [isMarketStale, setIsMarketStale] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [lastMarketUpdate, setLastMarketUpdate] = useState<string | null>(null);

  const fetchAppData = async () => {
    try {
      const [lessRes, liveRes, spotRes, futRes, matRes, annRes, priceRes] = await Promise.all([
        api.getLessons(),
        api.getLiveClasses(),
        api.getSpotSignals(),
        api.getFuturesSignals(),
        api.getMaterials(),
        api.getAnnouncements(),
        api.getPricing(),
      ]);

      setLessons(lessRes.lessons);
      setLiveClasses(liveRes.liveClasses);
      setSpotSignals(spotRes.signals);
      setFuturesSignals(futRes.signals);
      setMaterials(matRes.materials);
      setAnnouncements(annRes.announcements);
      setStories(storiesService.getStories());
      if (priceRes && priceRes.pricing) {
        setPricing(priceRes.pricing);
      }
    } catch (e) {
      console.error('Error fetching platform data', e);
    }
  };

  const fetchMarketData = async () => {
    try {
      const res = await api.getMarketOverview();
      setTickers(res.tickers);
      setIsMarketStale(res.stale);
      setMarketError(res.error);
      setLastMarketUpdate(res.lastUpdate);
    } catch (e: any) {
      setIsMarketStale(true);
      setMarketError(e.message || 'Market connection interrupted');
    }
  };

  useEffect(() => {
    fetchAppData();
    fetchMarketData();

    // Poll live exchange market data every 12 seconds
    const marketInterval = setInterval(fetchMarketData, 12000);
    // Poll live classes every 30 seconds for live stream status
    const liveInterval = setInterval(() => {
      api.getLiveClasses().then(res => setLiveClasses(res.liveClasses)).catch(() => {});
    }, 30000);

    return () => {
      clearInterval(marketInterval);
      clearInterval(liveInterval);
    };
  }, []);

  const beginnerLessons = lessons.filter(l => l.level === 'beginner');
  const advancedLessons = lessons.filter(l => l.level === 'advanced');
  const hasLiveClassNow = liveClasses.some(c => c.status === 'live');
  const activeSignalsCount = spotSignals.filter(s => s.status === 'Active').length + futuresSignals.filter(s => s.status === 'Active').length;

  // Signal status update handlers
  const handleUpdateSpotStatus = async (id: string, status: SignalStatus) => {
    try {
      await api.updateSpotSignal(id, { status });
      fetchAppData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateFuturesStatus = async (id: string, status: SignalStatus) => {
    try {
      await api.updateFuturesSignal(id, { status });
      fetchAppData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublishLesson = async (lesson: Lesson) => {
    try {
      await api.updateLesson(lesson.id, { published: !lesson.published });
      fetchAppData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
    try {
      await api.deleteLesson(id);
      fetchAppData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSpotSignal = async (id: string) => {
    setSpotSignals(prev => prev.filter(s => s.id !== id));
    try {
      await api.deleteSpotSignal(id);
      fetchAppData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFuturesSignal = async (id: string) => {
    setFuturesSignals(prev => prev.filter(s => s.id !== id));
    try {
      await api.deleteFuturesSignal(id);
      fetchAppData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    try {
      await api.deleteMaterial(id);
      fetchAppData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try {
      await api.deleteAnnouncement(id);
      fetchAppData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectStory = (idx: number) => {
    setActiveStoryIdx(idx);
    const story = stories[idx];
    if (story) storiesService.recordView(story.id);
  };

  const handleStoryCreated = (storyData: Omit<StoryItem, 'id' | 'createdAt' | 'viewsCount'>) => {
    storiesService.addStory(storyData);
    setStories(storiesService.getStories());
  };

  const handleDeleteStory = (id: string) => {
    const updated = storiesService.deleteStory(id);
    setStories(updated);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#ececec] flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        hasLiveClassNow={hasLiveClassNow}
        activeSignalsCount={activeSignalsCount}
        hasStories={stories.length > 0}
        onOpenStory={() => handleSelectStory(0)}
      />

      {/* Main Workspace Frame with Rich Ambient Background Mesh */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60 relative bg-gradient-to-b from-[#0d0e14] via-[#090a0f] to-[#06070a]">
        {/* Ambient background gold & obsidian light orbs matching logo */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-gradient-to-br from-amber-500/10 via-yellow-600/6 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[450px] bg-gradient-to-tr from-amber-600/8 via-yellow-500/5 to-transparent rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[500px] bg-gradient-to-tl from-yellow-500/8 via-amber-700/5 to-transparent rounded-full blur-[160px] pointer-events-none" />

        {/* PWA Install Banner & Offline Network Indicator */}
        <PwaInstallBanner />

        {/* Global Live Broadcast Bar (Appears on every page when instructor is live) */}
        <GlobalLiveBar
          activeLiveClass={liveClasses.find(c => c.status === 'live')}
          onNavigateToLive={() => setCurrentView('live')}
        />

        <Header
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenAuth={() => setAuthModalOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          tickers={tickers}
          isMarketStale={isMarketStale}
          hasLiveClassNow={hasLiveClassNow}
          hasStories={stories.length > 0}
          onOpenStory={() => handleSelectStory(0)}
        />

        {/* Viewport Content with Mobile-First Responsive Spacing */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl w-full mx-auto relative z-10 space-y-4 min-w-0 overflow-x-hidden">
          {paymentAlert && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-mono shadow-xl animate-fade-in ${
              paymentAlert.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : paymentAlert.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                : 'bg-[#1b1c2b] border-[#383a54] text-neutral-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {paymentAlert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {paymentAlert.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
                {paymentAlert.type === 'info' && <Info className="w-5 h-5 text-purple-400 shrink-0" />}
                <span>{paymentAlert.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setPaymentAlert(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentView === 'home' && (
            <HomeDashboard
              onNavigate={setCurrentView}
              beginnerLessons={beginnerLessons}
              advancedLessons={advancedLessons}
              liveClasses={liveClasses}
              spotSignals={spotSignals}
              futuresSignals={futuresSignals}
              tickers={tickers}
              completedLessonsCount={user?.completedLessons?.length || 0}
              pricing={pricing}
              onOpenPayment={handleOpenPayment}
            />
          )}

          {currentView === 'beginner' && (
            <BeginnerAcademy
              lessons={beginnerLessons}
              onOpenCreateLesson={() => setCurrentView('admin')}
              onEditLesson={() => setCurrentView('admin')}
              onDeleteLesson={handleDeleteLesson}
              onTogglePublish={handleTogglePublishLesson}
              onOpenPayment={handleOpenPayment}
              pricing={pricing}
              onRefreshData={fetchAppData}
            />
          )}

          {currentView === 'advanced' && (
            <AdvancedAcademy
              lessons={advancedLessons}
              onOpenCreateLesson={() => setCurrentView('admin')}
              onEditLesson={() => setCurrentView('admin')}
              onDeleteLesson={handleDeleteLesson}
              onTogglePublish={handleTogglePublishLesson}
              onOpenPayment={handleOpenPayment}
              pricing={pricing}
              onRefreshData={fetchAppData}
            />
          )}

          {currentView === 'live' && (
            <LiveClassesView
              liveClasses={liveClasses}
              onOpenScheduleClass={() => setCurrentView('admin')}
              onRefreshClasses={fetchAppData}
              onOpenPayment={handleOpenPayment}
            />
          )}

          {(currentView === 'signals' || currentView === 'spot' || currentView === 'futures') && (
            <SignalsSectionView
              spotSignals={spotSignals}
              futuresSignals={futuresSignals}
              defaultSection={currentView === 'futures' ? 'futures' : 'spot'}
              onOpenPayment={handleOpenPayment}
              pricing={pricing}
              onRefreshSignals={fetchAppData}
            />
          )}

          {currentView === 'market' && (
            <MarketOverviewView
              initialTickers={tickers}
              initialStale={isMarketStale}
              initialError={marketError}
              lastUpdate={lastMarketUpdate}
              onRefresh={fetchMarketData}
            />
          )}

          {currentView === 'materials' && (
            <LearningMaterialsView
              materials={materials}
              onOpenCreateMaterial={() => setCurrentView('admin')}
              onDeleteMaterial={handleDeleteMaterial}
            />
          )}

          {currentView === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              onOpenCreateAnnouncement={() => setCurrentView('admin')}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              beginnerLessons={beginnerLessons}
              advancedLessons={advancedLessons}
              liveClasses={liveClasses}
              spotSignals={spotSignals}
              futuresSignals={futuresSignals}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'admin' && (
            user?.role === 'admin' ? (
              <AdminPanel
                beginnerLessons={beginnerLessons}
                advancedLessons={advancedLessons}
                liveClasses={liveClasses}
                spotSignals={spotSignals}
                futuresSignals={futuresSignals}
                materials={materials}
                announcements={announcements}
                onRefreshAll={fetchAppData}
                onNavigateToLive={() => setCurrentView('live')}
              />
            ) : (
              <div className="p-8 text-center bg-[#121824] rounded-2xl border border-slate-800 max-w-lg mx-auto my-12 space-y-3">
                <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
                <p className="text-xs text-slate-400">
                  This section is restricted to course administrators.
                </p>
                <button
                  onClick={() => setCurrentView('home')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono"
                >
                  Return to Home
                </button>
              </div>
            )
          )}
        </main>

        {/* Global Publishing Footer */}
        <Footer
          onNavigate={setCurrentView}
          onOpenLegal={setLegalModal}
          onOpenTopNavModal={setTopNavModal}
          onOpenPayment={handleOpenPayment}
        />

        {/* Mobile-First Sticky Bottom Navigation Bar (Smartphones & Tablets < 1024px) */}
        <MobileBottomNav
          currentView={currentView}
          onNavigate={setCurrentView}
          hasLiveClassNow={hasLiveClassNow}
          activeSignalsCount={activeSignalsCount}
        />
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Global Course Payment & VIP Unlock Modal */}
      <CoursePaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        initialPlan={paymentPlan}
        onSuccess={fetchAppData}
      />

      {/* Publishing Legal & Compliance Modals (Terms, Privacy, Risk, Refund) */}
      <LegalModals
        activeModal={legalModal}
        onClose={() => setLegalModal(null)}
      />

      {/* Platform Modals (Channel, Service Desk, About, Feedback) */}
      <TopNavModals
        activeModal={topNavModal}
        onClose={() => setTopNavModal(null)}
      />

      {/* Story Viewer Fullscreen Modal (Instagram/WhatsApp style) */}
      {activeStoryIdx !== null && (
        <StoryViewerModal
          isOpen={activeStoryIdx !== null}
          initialIndex={activeStoryIdx}
          stories={stories}
          onClose={() => setActiveStoryIdx(null)}
          onDeleteStory={handleDeleteStory}
          onNavigateToSection={(view) => {
            setActiveStoryIdx(null);
            setCurrentView(view);
          }}
        />
      )}

      {/* Story Creator & Upload Modal */}
      <CreateStoryModal
        isOpen={createStoryModalOpen}
        onClose={() => setCreateStoryModalOpen(false)}
        onStoryCreated={handleStoryCreated}
      />
    </div>
  );
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AppErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0c13] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#121320] border border-[#272942] text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 text-xl font-bold font-mono">
              CC
            </div>
            <h2 className="text-lg font-bold text-white">Workspace Recovery</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              An unexpected render issue was safely intercepted. Click below to refresh your terminal workspace.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono shadow-lg shadow-purple-600/30"
            >
              Reload Platform Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
