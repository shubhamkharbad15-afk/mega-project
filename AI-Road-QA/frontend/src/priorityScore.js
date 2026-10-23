/**
 * Transparent operational triage score (0–100), NOT a road-condition standard,
 * a calibrated risk probability, or a substitute for municipal inspection.
 * Inputs are limited to fields the current report schema already carries.
 */
export function calculatePriorityScore(report = {}) {
  const severity = String(report.severity || 'low').toLowerCase();
  const severityPoints = severity === 'high' || severity === 'critical' ? 60
    : severity === 'medium' ? 35 : 15;
  const upvotes = Math.max(0, Number(report.upvotes) || 0);
  const communityPoints = Math.min(20, upvotes * 2);
  const status = String(report.status || '').toLowerCase();
  const workflowPoints = status === 'confirmed' ? 15
    : status === 'in_progress' ? 5
    : status === 'resolved' ? 0 : 10;
  const hasLocation = report.latitude !== null && report.latitude !== undefined && report.longitude !== null && report.longitude !== undefined && Number.isFinite(Number(report.latitude)) && Number.isFinite(Number(report.longitude));
  const locationPoints = hasLocation ? 5 : 0;
  const score = Math.min(100, severityPoints + communityPoints + workflowPoints + locationPoints);
  return {
    score,
    factors: [
      { label: 'Reported severity', points: severityPoints, max: 60 },
      { label: 'Community confirmations', points: communityPoints, max: 20 },
      { label: 'Workflow urgency', points: workflowPoints, max: 15 },
      { label: 'Location available', points: locationPoints, max: 5 },
    ],
    label: score >= 75 ? 'Urgent review' : score >= 45 ? 'Review soon' : 'Routine review',
  };
}
