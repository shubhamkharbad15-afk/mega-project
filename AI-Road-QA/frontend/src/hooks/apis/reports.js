import { apiFetch, jsonHeaders, bareHeaders } from './client.js';
import { INITIAL_REPORTS } from '../../data/sampleReports.js';

export async function submitRoadReport(reportData) {
  const data = await apiFetch('/reports/', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({
      title:        reportData.title,
      description:  reportData.description   ?? '',
      severity:     reportData.severity      ?? 'medium',
      latitude:     Number(reportData.latitude),
      longitude:    Number(reportData.longitude),
      evidence:     reportData.evidence      ?? [],
      detection_id: reportData.detection_id  ?? null,
    }),
  });
  return normaliseReport(data);
}

export async function updateReportWorkflow(reportId, update) {
  const data = await apiFetch(
    `/reports/${encodeURIComponent(reportId)}/workflow`,
    { method: 'PATCH', headers: jsonHeaders(), body: JSON.stringify(update) },
  );
  return { ...data, id: String(data.id), source: 'backend' };
}

/** Always resolves — returns `{ reports, source, error }`. */
export async function getNearbyReports(lat = 18.5204, lng = 73.8567, radius = 25000) {
  try {
    const data = await apiFetch(
      `/locations/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`,
      { headers: bareHeaders(), signal: AbortSignal.timeout(5000) },
    );
    if (!Array.isArray(data)) throw new Error('Response was not a list');
    return { reports: data.map(normaliseReport), source: 'backend', error: null };
  } catch (err) {
    return { reports: INITIAL_REPORTS, source: 'sample', error: err.message };
  }
}

// ── Shared normaliser ────────────────────────────────────────────────────────

function normaliseReport(item, index = 0) {
  const lat = Number(item.latitude);
  const lng = Number(item.longitude);
  return {
    ...item,
    id:           String(item.id ?? `report-${index + 1}`),
    title:        item.title       || item.defect_type || 'Road defect report',
    severity:     item.severity    || 'low',
    status:       item.status      || 'confirmed',
    defect_type:  item.defect_type || 'Unclassified defect',
    description:  item.description || '',
    imageUrl:     item.imageUrl    || (Array.isArray(item.evidence) ? item.evidence[0] : null),
    location_name: item.location_name
      || (Number.isFinite(lat) && Number.isFinite(lng)
            ? `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
            : 'Location not supplied'),
    upvotes:          Number(item.upvotes)          || 0,
    budget_allocated: Number(item.budget_allocated) || 0,
    source: 'backend',
  };
}