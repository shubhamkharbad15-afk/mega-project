import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CitizenTerminal from './components/CitizenTerminal';
import GovernmentTerminal from './components/GovernmentTerminal';
import WorkerTerminal from './components/WorkerTerminal';
import AdminTerminal from './components/AdminTerminal';
import ErrorBoundary from './components/ErrorBoundary';
import InstallPwaBanner from './components/InstallPwaBanner';
import AuthDialog from './components/AuthDialog';
import { usePwaInstall } from './hooks/usePwaInstall';
import { INITIAL_REPORTS, checkBackendHealth, getNearbyReportsResult, getAuthToken, getCurrentUser, setAuthToken } from './api';
import { ShieldAlert, Menu, X, Download, Moon, Sun, RefreshCw, LogIn, LogOut, UserRound } from 'lucide-react';

export default function App() {
  const [activeTerminal, setActiveTerminal] = useState('citizen');
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [backendStatus, setBackendStatus] = useState({ status: 'checking' });
  const [reportSource, setReportSource] = useState('sample');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('ai-road-qa-theme') || 'light'; } catch { return 'light'; }
  });
  const isPwaInstalled = usePwaInstall();

  useEffect(() => {
    if (getAuthToken()) getCurrentUser().then(setCurrentUser).catch(() => { setAuthToken(null); setCurrentUser(null); });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('ai-road-qa-theme', theme); } catch { /* storage may be disabled */ }
  }, [theme]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [health, result] = await Promise.all([checkBackendHealth(), getNearbyReportsResult()]);
      setBackendStatus(health);
      setReports(result.reports);
      setReportSource(result.source);
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Keep the shared incident queue reasonably fresh while the dashboard is open.
    const refreshTimer = window.setInterval(() => refreshData(), 30000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  return (
    <div data-theme={theme} className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans app-shell">
      
      {/* Mobile Top Header (Visible only on phones/small screens) */}
      <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-xs border border-slate-800">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-sm text-slate-900 block tracking-tight">RoadQuality</span>
            <span className="text-[10px] text-slate-500 font-medium">Municipal Works Platform</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isPwaInstalled && (
            <button
              onClick={() => {
                if (window.__triggerPwaInstall) {
                  window.__triggerPwaInstall();
                } else {
                  window.dispatchEvent(new CustomEvent('open-pwa-install-guide'));
                }
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold active:scale-95 transition-all"
              title="Install Application"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Install</span>
            </button>
          )}
          <button type="button" onClick={() => currentUser ? (setAuthToken(null), setCurrentUser(null), setActiveTerminal('citizen')) : setAuthDialogOpen(true)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700" aria-label={currentUser ? 'Sign out' : 'Sign in'}>
            {currentUser ? <LogOut className="h-4 w-4"/> : <LogIn className="h-4 w-4"/>}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            aria-label="Toggle navigation drawer"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Left Sidebar Navigation (Desktop sticky / Mobile drawer) */}
      <div className={`${isMobileNavOpen ? 'block' : 'hidden'} md:block fixed md:static inset-y-0 left-0 z-50`}>
        <Sidebar
          activeTerminal={activeTerminal}
          currentUser={currentUser}
          setActiveTerminal={(term) => {
            setActiveTerminal(term);
            setIsMobileNavOpen(false);
          }}
          onClose={() => setIsMobileNavOpen(false)}
          backendStatus={backendStatus}
          setBackendStatus={setBackendStatus}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
        />
      </div>

      {/* Backdrop for Mobile Nav */}
      {isMobileNavOpen && (
        <div 
          onClick={() => setIsMobileNavOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs"
        />
      )}

      {/* Main Content Viewport to the right */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Operational Bar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-3.5 items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              ACTIVE WORKSPACE :
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-mono">
              {activeTerminal === 'citizen' ? 'CITIZEN SENSING & REPORTING' :
               activeTerminal === 'government' ? 'MUNICIPAL PAVEMENT DISTRESS INDEX & WORK ORDERS' :
               activeTerminal === 'worker' ? 'CONTRACTOR DISPATCH & MILESTONE VERIFICATION' :
               'YOLOV11 MLOPS TELEMETRY & SYSTEM SECURITY'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-slate-500">
            {currentUser ? <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 font-sans text-slate-700"><UserRound className="h-4 w-4"/><span>{currentUser.name} · {currentUser.role}</span><button type="button" onClick={() => { setAuthToken(null); setCurrentUser(null); setActiveTerminal('citizen'); }} className="ml-1 font-semibold hover:text-red-700">Sign out</button></div> : <button type="button" onClick={() => setAuthDialogOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 font-sans font-semibold text-white hover:bg-slate-800"><LogIn className="h-4 w-4"/> Sign in</button>}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="theme-toggle inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-sans font-semibold text-slate-700 hover:bg-slate-100 transition-colors" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <span>SRID: <strong className="text-slate-800">4326 (WGS84)</strong></span>
            <span>•</span>
            <span>MAPPING: <strong className="text-slate-800">PostGIS ST_DWithin</strong></span>
          </div>
        </header>

        {/* Honest connection/data provenance banner */}
        <div className={`mx-3 mt-3 sm:mx-6 lg:mx-8 flex flex-col gap-1 rounded-xl border px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between ${reportSource === 'backend' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`} role="status" aria-live="polite">
          <span className="font-semibold">{reportSource === 'backend' ? 'Connected data: reports loaded from the backend API' : 'Sample mode: backend reports are unavailable; displayed records are illustrative'}</span>
          <div className="flex items-center gap-2"><span className="opacity-80">API: {backendStatus.status || 'checking'}{lastRefresh ? ` · refreshed ${lastRefresh.toLocaleTimeString()}` : ''}</span><button type="button" onClick={refreshData} disabled={isRefreshing} className="inline-flex items-center gap-1 rounded-lg border border-current/20 px-2 py-1 font-semibold disabled:opacity-50"><RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />{isRefreshing ? 'Refreshing' : 'Refresh'}</button></div>
        </div>

        {/* Portal access is enforced at the application boundary as well as in navigation.
            UI checks improve isolation, but the API must independently authorize every request. */}
        {(() => {
          const role = String(currentUser?.role || '').toLowerCase();
          const roleGroups = {
            citizen: ['citizen', 'user', 'public'],
            government: ['municipal', 'government', 'government_officer'],
            worker: ['field_contractor', 'contractor', 'worker'],
            admin: ['admin', 'developer', 'system_admin'],
          };
          const isAuthorized = Boolean(currentUser && (roleGroups[activeTerminal] || []).includes(role));
          const portalNames = { citizen: 'Citizen / Road Reporter', government: 'Municipal Government', worker: 'Field Contractor', admin: 'Developer / System Administrator' };
          return (
            <main className="p-3 sm:p-6 lg:p-8 pb-3 sm:pb-6">
              {!isAuthorized ? (
                <section className="mx-auto my-8 max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10" aria-labelledby="portal-access-title">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white"><ShieldAlert className="h-6 w-6" /></div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Protected workspace</p>
                  <h1 id="portal-access-title" className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Authorized access required</h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">The <strong>{portalNames[activeTerminal]}</strong> workspace is restricted. Sign in with an account whose role has been assigned by an authorized administrator. Choosing a portal never grants access.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setAuthDialogOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"><LogIn className="h-4 w-4" /> Sign in / Create account</button>
                    {currentUser && <button type="button" onClick={() => { setAuthToken(null); setCurrentUser(null); setActiveTerminal('citizen'); }} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Sign out</button>}
                  </div>
                  <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Public signup creates citizen accounts only. Government, contractor, and system-admin roles must be provisioned securely on the backend. Production deployments must enforce role checks server-side on every protected endpoint.</p>
                </section>
              ) : (
                <ErrorBoundary>
                  {activeTerminal === 'citizen' && <CitizenTerminal reports={reports} setReports={setReports} isMobileFrame={isMobileFrame} />}
                  {activeTerminal === 'government' && <GovernmentTerminal reports={reports} setReports={setReports} />}
                  {activeTerminal === 'worker' && <WorkerTerminal reports={reports} setReports={setReports} />}
                  {activeTerminal === 'admin' && <AdminTerminal />}
                </ErrorBoundary>
              )}
            </main>
          );
        })()}

        {/* Academic Presentation Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 sm:py-5 text-center text-xs text-slate-500 mt-2 sm:mt-6">
          <div className="max-w-5xl mx-auto px-4 space-y-1">
            <p className="font-bold text-slate-700">
              AI Road Quality Management System • Final Year Mega Project
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              Road Infrastructure Intelligence • Academic Year 2026–27
            </p>
            <p className="text-[10px] text-slate-400">
              Team: Road Infrastructure Innovation Group
            </p>
          </div>
        </footer>

      </div>

      {/* Progressive Web App Install Banner (Safari iOS & Chrome desktop/mobile) */}
      <InstallPwaBanner />
      {authDialogOpen && <AuthDialog onClose={() => setAuthDialogOpen(false)} onAuthenticated={(user) => { setCurrentUser(user); if (user.role === 'municipal') setActiveTerminal('government'); else if (user.role === 'field_contractor') setActiveTerminal('worker'); else if (user.role === 'admin') setActiveTerminal('admin'); else setActiveTerminal('citizen'); }} />}

    </div>
  );
}
