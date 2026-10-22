import React from 'react';
import { 
  ShieldAlert, 
  Smartphone, 
  Building2, 
  HardHat, 
  Cpu, 
  Server, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Download,
  X
} from 'lucide-react';
import { checkBackendHealth } from '../api';
import { usePwaInstall } from '../hooks/usePwaInstall';

export default function Sidebar({ 
  activeTerminal, 
  setActiveTerminal, 
  onClose,
  backendStatus, 
  setBackendStatus,
  isMobileFrame, 
  setIsMobileFrame 
}) {
  const isPwaInstalled = usePwaInstall();
  const terminals = [
    { 
      id: 'citizen', 
      label: 'Citizen Sensing', 
      sub: 'Mobile App & Auto-Snapshots', 
      icon: Smartphone 
    },
    { 
      id: 'government', 
      label: 'Municipal Portal', 
      sub: 'PDI Index & Work Orders', 
      icon: Building2 
    },
    { 
      id: 'worker', 
      label: 'Field Contractor', 
      sub: 'SOP & 3-Stage Milestones', 
      icon: HardHat 
    },
    { 
      id: 'admin', 
      label: 'MLOps & Admin', 
      sub: 'YOLOv11 & Telemetry', 
      icon: Cpu 
    },
  ];

  const handleRefreshHealth = async () => {
    const health = await checkBackendHealth();
    setBackendStatus(health);
  };

  return (
    <aside className="w-72 sm:w-80 md:w-72 max-w-[85vw] h-full min-h-screen bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-30 shadow-xl md:shadow-sm">
      
      {/* Brand & Project Identity */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-bold border border-slate-800 shadow-sm flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-slate-900">RoadQuality</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Municipal Works Platform
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Municipal pavement condition sensing, spatial triage, and contractor dispatch.
        </p>
      </div>

      {/* Terminal Switcher Navigation (Moved to Left Sidebar) */}
      <div className="p-4 flex-1 space-y-6 overflow-y-auto">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono px-3">
            Stakeholder Terminals
          </span>
          <nav className="mt-2 space-y-1.5">
            {terminals.map((t) => {
              const Icon = t.icon;
              const isActive = activeTerminal === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTerminal(t.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20 ring-1 ring-amber-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                  <div className="truncate">
                    <div className="text-xs leading-snug">{t.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-slate-900/80 font-mono font-medium' : 'text-slate-400'}`}>
                      {t.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Citizen Phone View Toggle */}
        {activeTerminal === 'citizen' && (
          <div className="px-3 pt-2">
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isMobileFrame 
                  ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                {isMobileFrame ? <Minimize2 className="w-3.5 h-3.5 text-sky-600" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>{isMobileFrame ? 'Phone Viewport Active' : 'Switch to Phone View'}</span>
              </span>
              <span className="text-[10px] font-mono text-sky-600">Toggle</span>
            </button>
          </div>
        )}

        {/* PWA App Installation Button (Hidden once installed/standalone) */}
        {!isPwaInstalled && (
          <button
            onClick={() => {
              if (window.__triggerPwaInstall) {
                window.__triggerPwaInstall();
              } else {
                window.dispatchEvent(new CustomEvent('open-pwa-install-guide'));
              }
            }}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Install Web App</span>
          </button>
        )}

        {/* Live FastAPI Backend Telemetry Card */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-slate-700 flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>FastAPI Backend</span>
            </span>
            <button
              onClick={handleRefreshHealth}
              className="text-slate-400 hover:text-slate-700 p-1 rounded"
              title="Refresh connection status"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            {backendStatus.status === 'healthy' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-emerald-700 text-[11px] font-bold">ONLINE (:8000)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-mono text-amber-700 text-[11px] font-bold">OFFLINE / RECONNECTING</span>
              </>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/80">
            <div>ML: <span className="text-slate-800 font-semibold">{backendStatus.ml_provider || 'YOLOv11 Vision Core'}</span></div>
            <div>POSTGIS: <span className="text-emerald-700 font-semibold">Enabled (SRID 4326)</span></div>
          </div>

          <a 
            href="http://127.0.0.1:8000/docs" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center space-x-1 text-[10px] text-sky-700 hover:underline pt-1 font-semibold"
          >
            <span>Open Swagger API Docs</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* User / Persona Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
          HG
        </div>
        <div className="truncate">
          <p className="text-xs font-bold text-slate-800 leading-tight">Harshwardhan G.</p>
          <p className="text-[10px] text-slate-500 font-mono">Lead Frontend Engineer</p>
        </div>
      </div>

    </aside>
  );
}
