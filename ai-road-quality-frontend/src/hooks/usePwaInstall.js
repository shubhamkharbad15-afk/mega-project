import { useState, useEffect } from 'react';

/**
 * Hook to detect whether the app is running in PWA standalone mode
 * or has been installed/added to the home screen.
 */
export function usePwaInstall() {
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;

    // 1. Direct browser standalone display mode check (Chrome, Edge, Android)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // 2. iOS Safari standalone check
    const isIosStandalone = window.navigator.standalone === true;

    // 3. Android Trusted Web App (TWA) referrer check
    const isTwa = document.referrer.includes('android-app://');

    // 4. Stored installation flag from previous appinstalled event
    const isStoredInstalled = localStorage.getItem('pwa_installed') === 'true';

    return isStandalone || isIosStandalone || isTwa || (isStandalone && isStoredInstalled);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check current standalone status
    const checkStatus = () => {
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      
      if (standalone) {
        setIsInstalled(true);
        localStorage.setItem('pwa_installed', 'true');
      }
    };

    checkStatus();

    // 2. Listen for display-mode media query change (e.g. user opens standalone window)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        localStorage.setItem('pwa_installed', 'true');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    // 3. Listen for Chromium/Android appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem('pwa_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return isInstalled;
}
