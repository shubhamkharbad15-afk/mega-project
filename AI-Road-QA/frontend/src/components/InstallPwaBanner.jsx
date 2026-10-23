import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export default function InstallPwaBanner() {
  const isInstalled = usePwaInstall();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMacSafari, setIsMacSafari] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Detect if app is already running in standalone mode (installed app window)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    if (checkStandalone()) {
      return; // Already running as installed standalone app
    }

    // 2. Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
    const isMac = /macintosh|mac os x/.test(ua);

    setIsIos(isIosDevice);
    setIsMacSafari(!isIosDevice && isSafari && isMac);

    // 3. Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed banner in this session
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Expose trigger globally for sidebar and header buttons
    const triggerInstall = () => {
      handleInstallClick();
    };
    window.__triggerPwaInstall = triggerInstall;
    window.addEventListener('open-pwa-install-guide', triggerInstall);

    // Show initial banner on mobile iOS if not dismissed
    if (isIosDevice && !sessionStorage.getItem('pwa_banner_dismissed')) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install-guide', triggerInstall);
      delete window.__triggerPwaInstall;
    };
  }, [deferredPrompt, isIos, isMacSafari]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chromium prompt
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
      setShowBanner(false);
    } else if (isIos) {
      // Show iOS step-by-step visual instruction modal
      setShowIosGuide(true);
    } else if (isMacSafari) {
      alert("To install this app on your Mac:\n1. Click 'File' in the Safari menu bar (or tap Share icon)\n2. Select 'Add to Dock'\n3. The app will launch as an independent desktop window.");
    } else {
      alert("To install on Chrome or Edge:\nClick the Install icon (computer with down arrow) in the right side of your browser address bar.");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // If already running standalone or installed, do not render installation promos
  if (isStandalone || isInstalled) return null;

  return (
    <>
      {/* 1. Success Toast after installation */}
      {installedSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 animate-bounce text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>App installed successfully! Launch it anytime from your home screen or desktop.</span>
        </div>
      )}

      {/* 2. Floating Bottom Action Banner */}
      {showBanner && (
        <aside 
          aria-label="PWA install banner"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-white border border-blue-200/80 rounded-2xl shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                {isIos ? <Smartphone className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-bold text-sm text-slate-900">Install Road Quality App</h4>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-full border border-blue-200">
                    Standalone
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isIos 
                    ? "Add to your iPhone Home Screen for full-screen camera and fast field reporting."
                    : "Install as a desktop or mobile application without browser bars."}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIos ? "How to Install on iPhone" : "Install Application Now"}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </aside>
      )}

      {/* 3. iOS Step-by-Step Installation Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Install on iPhone (Safari)</h3>
                  <p className="text-[11px] text-slate-500 font-mono">3 Simple Steps</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Tap the Share Button</p>
                  <p className="text-slate-500 text-[11px]">Located at the bottom of Safari (the square with an arrow pointing up):</p>
                  <div className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-blue-600 font-medium">
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Share Icon</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Select "Add to Home Screen"</p>
                  <p className="text-slate-500 text-[11px]">Scroll down the share sheet and tap:</p>
                  <div className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-medium">
                    <PlusSquare className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-[11px]">Add to Home Screen</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Tap "Add" in Top Right</p>
                  <p className="text-slate-500 text-[11px]">The app icon will immediately appear on your iPhone screen like a native App Store app.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
