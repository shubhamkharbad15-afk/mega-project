import React, { useMemo, useState } from 'react';
import { calculatePriorityScore } from '../priorityScore';
import { updateReportWorkflow } from '../api';
import { 
  Building2, 
  BarChart3, 
  CheckCircle, 
  AlertOctagon, 
  IndianRupee, 
  TrendingUp, 
  Filter, 
  Download, 
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

const WARDS_DATA = [
  { name: 'Ward 4 - Central (Deccan/FC)', pdi: 72, potholes: 14, cracks: 8, status: 'Needs Attention', budgetSpent: '₹14.2 L', totalBudget: '₹25.0 L' },
  { name: 'Ward 7 - Kothrud North', pdi: 86, potholes: 5, cracks: 4, status: 'Good Condition', budgetSpent: '₹8.4 L', totalBudget: '₹20.0 L' },
  { name: 'Ward 12 - NH-48 West Corridor', pdi: 64, potholes: 22, cracks: 18, status: 'Critical Action', budgetSpent: '₹28.5 L', totalBudget: '₹35.0 L' },
  { name: 'Ward 19 - Hinjewadi IT Express', pdi: 79, potholes: 11, cracks: 7, status: 'Fair Condition', budgetSpent: '₹19.1 L', totalBudget: '₹30.0 L' },
];

const CONTRACTORS = [
  { name: 'Apex Infra Projects Ltd.', activeJobs: 4, completed: 88, mttr: '3.2 hrs', ecoRating: '94%', compliance: 'Grade A' },
  { name: 'Metro Roadworks Corp.', activeJobs: 2, completed: 62, mttr: '5.1 hrs', ecoRating: '82%', compliance: 'Grade B+' },
  { name: 'GreenPave Highway Solutions', activeJobs: 1, completed: 41, mttr: '2.8 hrs', ecoRating: '98%', compliance: 'Grade A+' }
];

export default function GovernmentTerminal({ reports, setReports }) {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [approvalToast, setApprovalToast] = useState(null);
  const [workflowBusyId, setWorkflowBusyId] = useState(null);
  const [workflowError, setWorkflowError] = useState(null);

  const handleApproveWorkOrder = async (reportId) => {
    const report = reports.find(r => String(r.id) === String(reportId));
    if (!report) return;
    setWorkflowBusyId(reportId);
    setWorkflowError(null);
    try {
      const updatedReport = await updateReportWorkflow(reportId, {
        status: 'in_progress',
        assigned_contractor: report.assigned_contractor || report.contractor || 'Apex Infra Projects Ltd.',
        budget_allocated: Number(report.budget_allocated) || 7500,
      });
      setReports(current => current.map(r => String(r.id) === String(reportId)
        ? { ...r, ...updatedReport, contractor: updatedReport.assigned_contractor || report.contractor, location_name: r.location_name }
        : r));
      setApprovalToast(`Work order #${reportId} was saved by the backend and dispatched.`);
      setTimeout(() => setApprovalToast(null), 4000);
    } catch (error) {
      setWorkflowError(`${error.message}. No local-only status change was made. Sign in with a municipal/admin account and ensure this is a backend report.`);
    } finally {
      setWorkflowBusyId(null);
    }
  };

  const filteredReports = useMemo(() => reports.filter(r => {
    const severityMatches = filterSeverity === 'all' || String(r.severity).toLowerCase() === filterSeverity;
    const statusMatches = filterStatus === 'all' || String(r.status).toLowerCase() === filterStatus;
    const needle = searchText.trim().toLowerCase();
    const searchMatches = !needle || [r.title, r.description, r.defect_type, r.location_name, r.id, r.contractor]
      .some(value => String(value || '').toLowerCase().includes(needle));
    return severityMatches && statusMatches && searchMatches;
  }).sort((a, b) => calculatePriorityScore(b).score - calculatePriorityScore(a).score), [reports, filterSeverity, filterStatus, searchText]);

  const exportAuditCsv = () => {
    const columns = ['id', 'title', 'defect_type', 'severity', 'priority_score', 'priority_label', 'status', 'location_name', 'latitude', 'longitude', 'budget_allocated', 'contractor', 'created_at'];
    const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [columns.join(','), ...filteredReports.map(report => {
      const priority = calculatePriorityScore(report);
      return columns.map(key => key === 'priority_score' ? priority.score : key === 'priority_label' ? priority.label : quote(report[key])).join(',');
    })];
    const blob = new Blob(['\ufeff' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `road-qa-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Toast Alert */}
      {approvalToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{approvalToast}</span>
        </div>
      )}

      {workflowError && (
        <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 flex items-start justify-between gap-3">
          <span>{workflowError}</span>
          <button type="button" onClick={() => setWorkflowError(null)} className="font-bold" aria-label="Dismiss workflow error">×</button>
        </div>
      )}

      {/* Municipal Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
              Municipal Command Portal
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Operational triage • not a certified ASTM condition rating</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5 tracking-tight">Infrastructure Governance & Work Order Portal</h1>
          <p className="text-xs text-slate-500">Automated triage of citizen road defect reports with contractor accountability</p>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <button 
            onClick={exportAuditCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded-xl border border-slate-300 font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export SDI Audit</span>
          </button>
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-right">
            <p className="text-[11px] text-slate-500 font-medium">Sample city rating</p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-700 leading-tight">77.4 / 100</p>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Road Incidents</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Workflow data shown below</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Critical Severity (D40)</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {reports.filter(r => r.severity === 'high').length}
          </p>
          <p className="text-[11px] text-red-700 font-medium">Requires triage &lt; 24 hrs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sample maintenance budget</span>
            <IndianRupee className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹70.2 L</p>
          <p className="text-[11px] text-slate-500 font-mono">Fund: ₹110.0 L Fiscal</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sample eco-material adoption</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">89.4%</p>
          <p className="text-[11px] text-emerald-800 font-medium">Warm-Mix & RAP Usage</p>
        </div>
      </div>

      {/* Ward-level Pavement Distress Index */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ward condition snapshot (illustrative data)</h2>
            <p className="text-xs text-slate-500">Static sample values in this prototype; replace with verified ward inspection data before operational use</p>
          </div>
          <span className="text-xs font-mono text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 font-bold self-start sm:self-auto">
            Prototype indicators · not certified ASTM scoring
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WARDS_DATA.map((ward, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-800">{ward.name}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold ${
                  ward.pdi >= 80 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  ward.pdi >= 70 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  PDI {ward.pdi}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    ward.pdi >= 80 ? 'bg-emerald-600' : ward.pdi >= 70 ? 'bg-amber-500' : 'bg-red-600'
                  }`}
                  style={{ width: `${ward.pdi}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-600 pt-1">
                <span>Potholes: <strong>{ward.potholes}</strong></span>
                <span>Cracks: <strong>{ward.cracks}</strong></span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200 font-mono">
                <span>Spent:</span>
                <span className="text-slate-900 font-bold">{ward.budgetSpent} / {ward.totalBudget}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work-Order Approval Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Work-Order Approval & Dispatch Queue</h2>
            <p className="text-xs text-slate-500">Search, prioritize, and review citizen incident reports before dispatching repair work</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input aria-label="Search reports" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search title, location, ID…" className="bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-lg px-3 py-2 w-48" />
            <select aria-label="Filter by workflow status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 border border-slate-300 text-xs text-slate-800 font-medium rounded-lg px-2.5 py-1.5">
              <option value="all">All Statuses</option><option value="confirmed">Needs approval</option><option value="reviewed">Reviewed</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-800 font-medium rounded-lg px-2.5 py-1.5 shadow-xs"
            >
              <option value="all">All Severities</option>
              <option value="high">Critical (High Severity)</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[660px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] bg-slate-50/70">
                <th className="py-2.5 px-3">INCIDENT DETAILS</th>
                <th className="py-2.5 px-3">DEFECT TYPE</th>
                <th className="py-2.5 px-3">LOCATION</th>
                <th className="py-2.5 px-3">PRIORITY</th>
                <th className="py-2.5 px-3">EST. BUDGET</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((rep, idx) => (
                <tr key={rep.id ? `gov-${rep.id}` : `gov-idx-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <img src={rep.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{rep.title}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{rep.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-sky-800 font-bold">{rep.defect_type}</span>
                    <span className={`block text-[10px] font-extrabold uppercase ${
                      rep.severity === 'high' ? 'text-red-700' : 'text-amber-700'
                    }`}>
                      {rep.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {rep.location_name}
                  </td>
                  <td className="py-3 px-3">
                    <div title={calculatePriorityScore(rep).factors.map(f => `${f.label}: ${f.points}/${f.max}`).join(' · ')} className="font-mono font-extrabold text-slate-900 cursor-help">{calculatePriorityScore(rep).score}/100</div>
                    <div className="text-[10px] text-slate-500">{calculatePriorityScore(rep).label}</div>
                    <div className="mt-1 h-1.5 w-20 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-amber-500" style={{ width: `${calculatePriorityScore(rep).score}%` }} /></div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    ₹{rep.budget_allocated ? Number(rep.budget_allocated).toLocaleString() : '6,800'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                      rep.status === 'resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      rep.status === 'in_progress' ? 'bg-sky-50 text-sky-800 border-sky-300' :
                      'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {rep.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {rep.status === 'confirmed' ? (
                      <button
                        onClick={() => handleApproveWorkOrder(rep.id)}
                        disabled={workflowBusyId === rep.id}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-all flex items-center space-x-1 ml-auto"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono font-medium">
                        Assigned: {rep.contractor?.split(' ')[0] || 'In Repair'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-500">No reports match these filters. Try clearing the search or status filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contractor Performance Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Contractor Audit & Quality Compliance</h2>
            <p className="text-xs text-slate-500">Illustrative contractor cards for UI demonstration; not live contractor telemetry</p>
          </div>
          <Users className="w-5 h-5 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONTRACTORS.map((c, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-300 font-bold">
                  {c.compliance}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-200">
                <div>
                  <div className="text-slate-500 text-[10px]">ACTIVE</div>
                  <div className="text-slate-900 font-bold">{c.activeJobs}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">AVG MTTR</div>
                  <div className="text-sky-700 font-bold">{c.mttr}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">ECO ADOPTION</div>
                  <div className="text-emerald-700 font-bold">{c.ecoRating}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
