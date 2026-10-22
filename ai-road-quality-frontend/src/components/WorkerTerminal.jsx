import React, { useState } from 'react';
import { 
  HardHat, 
  MapPin, 
  CheckSquare, 
  Square, 
  Camera, 
  Calculator, 
  Navigation, 
  Leaf, 
  CheckCircle2, 
  CheckCircle
} from 'lucide-react';

export default function WorkerTerminal({ reports, setReports }) {
  const activeJobs = reports.filter(r => r.status === 'in_progress' || r.status === 'confirmed');
  const [selectedTicketId, setSelectedTicketId] = useState(activeJobs[0]?.id || reports[0]?.id);
  const [checklist, setChecklist] = useState({
    cones: true,
    milled: true,
    tackCoat: false,
    asphaltCompacted: false,
    coolingCleared: false,
  });

  const [lengthCm, setLengthCm] = useState(120);
  const [widthCm, setWidthCm] = useState(90);
  const [depthCm, setDepthCm] = useState(8);

  const [milestoneBefore, setMilestoneBefore] = useState(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  );
  const [milestoneInProg, setMilestoneInProg] = useState(
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
  );
  const [milestoneAfter, setMilestoneAfter] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const selectedTicket = reports.find(r => r.id === selectedTicketId) || reports[0];

  const volumeM3 = (lengthCm / 100) * (widthCm / 100) * (depthCm / 100);
  const densityKgM3 = 2350;
  const totalWeightKg = Math.round(volumeM3 * densityKgM3);
  const rapWeightKg = Math.round(totalWeightKg * 0.40);
  const co2SavedKg = Math.round(totalWeightKg * 0.18);

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCompleteRepair = () => {
    const finalPhoto = milestoneAfter || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80';
    setMilestoneAfter(finalPhoto);

    const updated = reports.map(r => {
      if (r.id === selectedTicket.id) {
        return {
          ...r,
          status: 'resolved',
          milestones: {
            before: milestoneBefore,
            in_progress: milestoneInProg,
            resolved: finalPhoto
          }
        };
      }
      return r;
    });

    setReports(updated);
    setSuccessToast(`Job #${selectedTicket.id} marked RESOLVED! Citizen & Municipal Portal updated.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Success Banner */}
      {successToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center space-x-3 text-sm shadow-md animate-fade-in font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Terminal Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
              FIELD MAINTENANCE TERMINAL
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-mono">Contractor Dispatch Unit #04</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">Field Work Execution & Milestone Proof</h1>
          <p className="text-xs text-slate-500">Step-by-step repair execution, eco-material ratios, and photo verification</p>
        </div>

        <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <span className="text-xs text-slate-500">Crew Lead:</span>
          <span className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-900 font-mono text-xs rounded-xl font-bold truncate">
            Er. Akash Deshmane (Field Spec.)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Assigned Dispatch Ticket Selector & Calculator */}
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Assigned Job Tickets</h2>
              <span className="text-xs font-mono text-amber-700 font-bold">{activeJobs.length} Active</span>
            </div>

            <div className="space-y-2">
              {reports.map((job, idx) => (
                <button
                  key={job.id ? `job-${job.id}` : `job-idx-${idx}`}
                  onClick={() => setSelectedTicketId(job.id)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all space-y-1 ${
                    selectedTicket.id === job.id
                      ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-xs font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-sky-700 font-bold">ID: {job.id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                      job.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      job.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {(job.status || 'confirmed').replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 truncate">{job.title}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{job.location_name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Eco-Friendly Material Mix Calculator */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-300 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-emerald-700">
              <Leaf className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">AI Eco-Material Calculator</h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Calculate exact volume and low-carbon Warm-Mix / Reclaimed Asphalt (RAP) blend.
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div>
                <label className="text-slate-600 block mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Width (cm)</label>
                <input
                  type="number"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Depth (cm)</label>
                <input
                  type="number"
                  value={depthCm}
                  onChange={(e) => setDepthCm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-700">
                <span>Total Asphalt Batch:</span>
                <span className="font-bold text-slate-900">{totalWeightKg} kg</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Reclaimed RAP (40%):</span>
                <span className="font-bold">{rapWeightKg} kg</span>
              </div>
              <div className="flex justify-between text-sky-700">
                <span>CO2 Emission Avoided:</span>
                <span className="font-bold">{co2SavedKg} kg CO2e</span>
              </div>
              <div className="flex justify-between text-amber-800 text-[11px] pt-1 border-t border-slate-200 font-bold">
                <span>Target Compaction Temp:</span>
                <span>120°C - 130°C (WMA)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right: Execution Guide & Milestone Proof */}
        <div className="lg:col-span-2 space-y-5">

          {/* Ticket Header & GPS */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-amber-800 font-extrabold">WORK ORDER #{selectedTicket.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-600">{selectedTicket.defect_type}</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{selectedTicket.title}</h2>
                <p className="text-xs text-slate-500 font-mono flex items-center space-x-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span className="truncate">{selectedTicket.location_name} (GPS: {selectedTicket.latitude}, {selectedTicket.longitude})</span>
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedTicket.latitude},${selectedTicket.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs w-full sm:w-auto"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in GPS Navigation</span>
              </a>
            </div>
          </div>

          {/* Step-by-Step SOP Checklist */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>Standard Operating Procedure (SOP) Protocol</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div 
                onClick={() => toggleChecklist('cones')}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {checklist.cones ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                <span className={checklist.cones ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}>
                  1. Deploy Class-A traffic safety cones 30 meters upstream and alert flagger.
                </span>
              </div>

              <div 
                onClick={() => toggleChecklist('milled')}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {checklist.milled ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                <span className={checklist.milled ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}>
                  2. Saw-cut rectangular boundaries and cold-mill cavity down to sound base aggregate.
                </span>
              </div>

              <div 
                onClick={() => toggleChecklist('tackCoat')}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {checklist.tackCoat ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                <span className={checklist.tackCoat ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}>
                  3. Clean debris with air blower & spray RS-1 cationic emulsion tack coat uniformly.
                </span>
              </div>

              <div 
                onClick={() => toggleChecklist('asphaltCompacted')}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {checklist.asphaltCompacted ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                <span className={checklist.asphaltCompacted ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}>
                  4. Fill Warm-Mix Asphalt (WMA) in 40mm lifts and compact with vibratory plate (min 4 passes).
                </span>
              </div>

              <div 
                onClick={() => toggleChecklist('coolingCleared')}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {checklist.coolingCleared ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                <span className={checklist.coolingCleared ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}>
                  5. Allow 30 minutes cooling period before lane reopening and safety sweep.
                </span>
              </div>
            </div>
          </div>

          {/* 3-Milestone Proof Verification System */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Three-Stage Milestone Photo Proof</h3>
                <p className="text-xs text-slate-500">Required audit proof for municipal payment release and citizen verification</p>
              </div>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 font-bold self-start sm:self-auto">
                Audit Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Photo 1: Before */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-mono text-slate-700 font-bold block">Stage 1: Before Repair</span>
                <div className="aspect-square rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
                  <img src={milestoneBefore} alt="Before" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center space-x-1 text-emerald-700 text-[10px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Geo-Tagged In-Situ</span>
                </div>
              </div>

              {/* Photo 2: In-Progress */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-mono text-slate-700 font-bold block">Stage 2: Milled & Tack Coat</span>
                <div className="aspect-square rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
                  <img src={milestoneInProg} alt="In Progress" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center space-x-1 text-emerald-700 text-[10px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Subgrade Prepared</span>
                </div>
              </div>

              {/* Photo 3: After / Resolved */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-mono text-slate-700 font-bold block">Stage 3: Completed Patch</span>
                <div className="aspect-square rounded-lg overflow-hidden border border-slate-300 bg-white flex flex-col items-center justify-center relative shadow-inner">
                  {milestoneAfter ? (
                    <img src={milestoneAfter} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <label className="cursor-pointer text-center p-3 text-slate-500 hover:text-slate-800">
                      <Camera className="w-6 h-6 mx-auto mb-1 text-amber-600 animate-pulse" />
                      <span className="text-[10px] block font-mono font-medium">Upload Final Compaction Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setMilestoneAfter(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {milestoneAfter ? (
                    <span className="text-emerald-700 flex items-center space-x-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready to certify</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-medium">Awaiting photo capture</span>
                  )}
                </div>
              </div>
            </div>

            {/* Complete Job Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleCompleteRepair}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Certify Repair & Release Notification to Citizen</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
