import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as any).standalone === true;
    if (isStandalone) return false;

    const isDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
    if (isDismissed) return false;

    if (isIOS) return true;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|blackberry|iemobile|opera mini/i.test(userAgent);
    if (isMobile) return true;

    return false;
  });
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for beforeinstallprompt event on other platforms
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      // Trigger the browser's install prompt
      await deferredPrompt.prompt();

      // Wait for the user's choice
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // If deferredPrompt is not available (e.g. Dev environment or browser support limitations)
      // Tell user how to install via browser menu
      alert("To install, open your browser menu (usually three dots in top-right) and tap 'Install' or 'Add to Home screen'.");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-purple-600 text-white px-3 py-2 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-md lg:hidden relative z-[9999] animate-slide-down">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <p className="font-medium truncate pr-1">
            Install <span className="font-bold">NexusShop</span> app for a better experience!
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 bg-white text-brand-700 font-bold rounded-lg text-xs hover:bg-brand-50 transition-colors shadow-sm active:scale-95 shrink-0"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal rendered via Portal */}
      {showIOSInstructions && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1b23] rounded-3xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-800 shadow-2xl animate-scale-up text-gray-900 dark:text-white">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">Install NexusShop on iOS</h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                To install this app on your iPhone/iPad, follow these steps:
              </p>
              
              <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-5 h-5 rounded-full bg-brand-600/10 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Open Share menu</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Tap the Share icon <span className="inline-block align-middle mx-0.5"><svg className="w-4 h-4 text-brand-600 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l3.316-3.316m0 0l3.316 3.316m-3.316-3.316V18M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span> (bottom on Safari).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-5 h-5 rounded-full bg-brand-600/10 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Add to Home Screen</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Scroll down and select <span className="font-bold text-gray-700 dark:text-gray-300">"Add to Home Screen"</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-5 h-5 rounded-full bg-brand-600/10 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Confirm</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Tap <span className="font-bold text-brand-600">"Add"</span> in the top right corner.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-6 w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-600/20 active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
