import { apiFetch, bareHeaders } from './client.js';

const FALLBACK_ANALYTICS = {
  total_reports:   null,
  high_severity:   null,
  medium_severity: null,
  low_severity:    null,
  source:          'unavailable',
  is_demo:         true,
  warning:         'Live analytics are unavailable because the backend request failed.',
};

export async function getAnalyticsSummary() {
  try {
    return await apiFetch('/analytics/summary', { headers: bareHeaders() });
  } catch {
    return FALLBACK_ANALYTICS;
  }
}