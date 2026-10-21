import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CitizenTerminal from './components/CitizenTerminal';
import GovernmentTerminal from './components/GovernmentTerminal';
import WorkerTerminal from './components/WorkerTerminal';
import AdminTerminal from './components/AdminTerminal';
import { INITIAL_REPORTS, checkBackendHealth, getNearbyReports } from './api';
import { ShieldAlert, Menu, X } from 'lucide-react';

export default function App() {
  const [activeTerminal, setActiveTerminal] = useState('citizen');
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [backendStatus, setBackendStatus] = useState({ status: 'checking' });
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      const health = await checkBackendHealth();
      setBackendStatus(health);

      const liveReports = await getNearbyReports();
      if (liveReports && liveReports.length > 0) {
        setReports(liveReports);
      }
    }
    loadInitial();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header (Visible only on phones/small screens) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-sm text-slate-900 block">AI Road Quality</span>
            <span className="text-[10px] text-amber-700 font-mono font-bold tracking-wider">MEGA PROJECT</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
          aria-label="Toggle navigation drawer"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Navigation (Desktop sticky / Mobile drawer) */}
      <div className={`${isMobileNavOpen ? 'block' : 'hidden'} md:block fixed md:static inset-y-0 left-0 z-50`}>
        <Sidebar
          activeTerminal={activeTerminal}
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
            <span>SRID: <strong className="text-slate-800">4326 (WGS84)</strong></span>
            <span>•</span>
            <span>MAPPING: <strong className="text-slate-800">PostGIS ST_DWithin</strong></span>
          </div>
        </header>

        {/* Dynamic Terminal View */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-28 sm:pb-8">
          {activeTerminal === 'citizen' && (
            <CitizenTerminal 
              reports={reports} 
              setReports={setReports} 
              isMobileFrame={isMobileFrame} 
            />
          )}

          {activeTerminal === 'government' && (
            <GovernmentTerminal 
              reports={reports} 
              setReports={setReports} 
            />
          )}

          {activeTerminal === 'worker' && (
            <WorkerTerminal 
              reports={reports} 
              setReports={setReports} 
            />
          )}

          {activeTerminal === 'admin' && (
            <AdminTerminal />
          )}
        </main>

        {/* Academic Presentation Footer */}
        <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-5xl mx-auto px-4 space-y-1">
            <p className="font-bold text-slate-700">
              AI Road Quality Management System • Final Year Mega Project
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              Department of Computer Science & Engineering • Academic Year 2026–27 • Guided by Prof. Bhagyashree Udgave
            </p>
            <p className="text-[10px] text-slate-400">
              Team: Harshwardhan Galande, Shubham Kharbad, Aayush Patil, Akash Patil, Akash Deshmane
            </p>
          </div>
        </footer>

      </div>

    </div>
  );
}
