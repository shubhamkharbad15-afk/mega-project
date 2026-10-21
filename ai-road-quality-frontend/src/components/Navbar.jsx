import React from 'react';
import { 
  ShieldAlert, 
  Smartphone, 
  Building2, 
  HardHat, 
  Cpu, 
  Server, 
  Wifi, 
  WifiOff, 
  Maximize2, 
  Minimize2 
} from 'lucide-react';

export default function Navbar({ 
  activeTerminal, 
  setActiveTerminal, 
  backendStatus, 
  isMobileFrame, 
  setIsMobileFrame 
}) {
  const terminals = [
    { id: 'citizen', label: 'Citizen App', icon: Smartphone, tag: 'Mobile & PWA' },
    { id: 'government', label: 'Government Portal', icon: Building2, tag: 'Governance & PDI' },
    { id: 'worker', label: 'Field Crew', icon: HardHat, tag: 'Contractor Dispatch' },
    { id: 'admin', label: 'ML & System Admin', icon: Cpu, tag: 'YOLOv11 & Telemetry' },
  ];

  return (
    <header className="border-b border-slate-800 bg-asphalt-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Project Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-hazard-500 to-amber-700 flex items-center justify-center shadow-lg shadow-hazard-500/10 border border-hazard-400/40">
              <ShieldAlert className="w-6 h-6 text-asphalt-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">AI Road Quality</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-hazard-500/20 text-hazard-400 border border-hazard-500/30">
                  MEGA PROJECT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Automated Sensing • Multi-Persona Governance • Eco-Repair
              </p>
            </div>
          </div>

          {/* Terminal Tabs */}
          <nav className="flex space-x-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto">
            {terminals.map((t) => {
              const Icon = t.icon;
              const isActive = activeTerminal === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTerminal(t.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-hazard-500 text-asphalt-950 shadow-md font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status & Options */}
          <div className="flex items-center space-x-3">
            {activeTerminal === 'citizen' && (
              <button
                onClick={() => setIsMobileFrame(!isMobileFrame)}
                className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors ${
                  isMobileFrame 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle Phone Frame Simulation"
              >
                {isMobileFrame ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isMobileFrame ? 'Phone View' : 'Full Width'}</span>
              </button>
            )}

            {/* Backend Health Badge */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
              {backendStatus.status === 'healthy' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-400 font-mono text-[11px] hidden sm:inline">Backend API :8000</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-400 font-mono text-[11px] hidden sm:inline">Simulation Node</span>
                </>
              )}
            </div>

            {/* Lead Persona Avatar */}
            <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white border border-cyan-400/30">
                HG
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[11px] font-semibold text-slate-200 leading-tight">Harshwardhan G.</p>
                <p className="text-[10px] text-slate-500 font-mono">Team Core</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
