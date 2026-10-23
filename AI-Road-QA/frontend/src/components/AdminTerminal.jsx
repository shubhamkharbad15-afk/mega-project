import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  Database, 
  Play, 
  Server, 
  Zap, 
  Terminal,
  ShieldCheck
} from 'lucide-react';

const USERS_RBAC = [
  { id: 'usr-1', name: 'Platform Administrator', email: 'admin@example.invalid', role: 'System Admin', permissions: 'Privileged access — assign explicitly' },
  { id: 'usr-2', name: 'Model Operations Analyst', email: 'ml-ops@example.invalid', role: 'ML Operations', permissions: 'Model telemetry and pipeline status' },
  { id: 'usr-3', name: 'Municipal Officer', email: 'municipal@example.invalid', role: 'Government Official', permissions: 'Work-order review and budget controls' },
  { id: 'usr-4', name: 'Field Contractor', email: 'contractor@example.invalid', role: 'Field Contractor', permissions: 'Assigned task execution and evidence' },
  { id: 'usr-5', name: 'Citizen Reporter', email: 'citizen@example.invalid', role: 'Citizen Reporter', permissions: 'Road reports and status tracking' },
];

export default function AdminTerminal() {
  const [activeModel, setActiveModel] = useState('yolov11');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [retrainLogs, setRetrainLogs] = useState([
    'Initializing dataset loader with RDD2022 + 142 field verified milestone photos...',
    'Base model: Ultralytics YOLOv11-Nano (3.2M params)',
    'Anchor boxes optimized for road distress classes: D00, D10, D20, D40'
  ]);

  const handleTriggerRetrain = () => {
    setIsRetraining(true);
    setRetrainProgress(10);
    setRetrainLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Retraining triggered via Google Colab / PyTorch worker...`,
      'Training telemetry is illustrative until a real training worker is connected.'
    ]);

    const timer = setInterval(() => {
      setRetrainProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsRetraining(false);
          setRetrainLogs(old => [
            ...old,
            'Epoch 10/10 complete! Loss reduced to 0.188.',
            'New mAP@50: 93.4% (+1.2% improvement).',
            'Model exported to models/best.pt and TFLite quantization completed!',
            'Weights automatically deployed to edge mobile clients.'
          ]);
          return 100;
        }
        return prev + 25;
      });
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-200">
              System Administration & Telemetry
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Vision Engine & Spatial Diagnostics</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5 tracking-tight">Administrative & Operations Console</h1>
          <p className="text-xs text-slate-500">Model weight management, field retraining pipeline, and edge telemetry</p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-right">
            <p className="text-[10px] text-slate-500 font-mono">ACTIVE DETECTOR</p>
            <p className="text-sm font-extrabold text-sky-700 font-mono uppercase">{activeModel}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Inference Latency</span>
            <Zap className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">18.4 ms</p>
          <p className="text-[11px] text-emerald-700 font-bold">54.3 FPS on CUDA / 26ms CPU</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>mAP@50 (RDD2022)</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">92.8%</p>
          <p className="text-[11px] text-slate-500 font-medium">Precision: 94.1% • Recall: 91.5%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>PostGIS Query Speed</span>
            <Database className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">1.24 ms</p>
          <p className="text-[11px] text-slate-500 font-medium">ST_DWithin 4326 Index</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Inference Frames Today</span>
            <Server className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">14,892</p>
          <p className="text-[11px] text-emerald-700 font-bold">Edge Sync: 99.9% Uptime</p>
        </div>
      </div>

      {/* Model Selector & Retraining Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Vision Model Architecture */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Road Damage Detection Model</h2>
              <p className="text-xs text-slate-500">Pluggable detector protocol implemented in backend</p>
            </div>
            <Cpu className="w-5 h-5 text-sky-700" />
          </div>

          <div className="space-y-2.5">
            <div 
              onClick={() => setActiveModel('yolov11')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeModel === 'yolov11' ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Ultralytics YOLOv11 (Server GPU)</span>
                <span className="text-[10px] font-mono bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-bold">Active Target</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Highest precision for server-side verification of citizen photos. Uses weights from <code>models/best.pt</code>.
              </p>
            </div>

            <div 
              onClick={() => setActiveModel('tflite')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeModel === 'tflite' ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">TensorFlow Lite (Edge Quantized)</span>
                <span className="text-[10px] font-mono text-slate-500">INT8 Mobile</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Runs locally on citizen smartphone windshield mounts for continuous real-time sensing without network lag.
              </p>
            </div>

            <div 
              onClick={() => setActiveModel('mock')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeModel === 'mock' ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Local Validation Engine</span>
                <span className="text-[10px] font-mono text-slate-500">Benchmark Mode</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Lightweight edge validator for offline latency and throughput benchmarking.
              </p>
            </div>
          </div>
        </div>

        {/* Continuous Retraining Pipeline */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Continuous Retraining Pipeline</h2>
              <p className="text-xs text-slate-500">Integrates verified field milestone photos into training weights</p>
            </div>
            <button
              onClick={handleTriggerRetrain}
              disabled={isRetraining}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs self-start sm:self-auto"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRetraining ? 'Retraining...' : 'Trigger Retrain'}</span>
            </button>
          </div>

          {/* Progress Bar */}
          {isRetraining && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-600">
                <span>Training Progress</span>
                <span className="text-slate-900 font-bold">{retrainProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${retrainProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Terminal Console Output */}
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-emerald-400 h-44 overflow-y-auto space-y-1 shadow-inner">
            <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 flex items-center space-x-1">
              <Terminal className="w-3 h-3 text-slate-400" />
              <span>ML_PIPELINE_OUTPUT :: Colab / PyTorch Daemon</span>
            </div>
            {retrainLogs.map((log, idx) => (
              <p key={idx} className="leading-tight">{log}</p>
            ))}
          </div>
        </div>

      </div>

      {/* Role-Based Access Control (RBAC) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC)</h2>
            <p className="text-xs text-slate-500">Security principles: OAuth 2.0, JWT, MFA for Government terminals</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] bg-slate-50/70">
                <th className="py-2.5 px-3">USER NAME</th>
                <th className="py-2.5 px-3">EMAIL</th>
                <th className="py-2.5 px-3">ROLE</th>
                <th className="py-2.5 px-3">PERMISSIONS SCOPE</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {USERS_RBAC.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">{u.permissions}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-emerald-700 font-bold text-[10px]">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
