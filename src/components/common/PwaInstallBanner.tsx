import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Check if already in standalone display mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Capture install prompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed today
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Online / offline network listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Status Alert */}
      {isOffline && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs font-mono flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-xl mx-auto">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Offline Mode:</strong> Internet connection interrupted. Cached academy content remains accessible.
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-500/40 shrink-0 ml-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* PWA Install Banner */}
      {showBanner && !isInstalled && (
        <div className="fixed bottom-16 lg:bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-fade-in">
          <div className="bg-[#0f1018]/95 backdrop-blur-xl border-2 border-amber-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/pwa-192x192.png"
                alt="Learn & Grow"
                className="w-10 h-10 rounded-xl object-contain bg-black border border-amber-500/30 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  Install Learn & Grow App
                </h4>
                <p className="text-[11px] text-neutral-400 truncate">
                  Add to home screen for 1-click mobile access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black text-xs font-black shadow-md shadow-amber-500/30 hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
