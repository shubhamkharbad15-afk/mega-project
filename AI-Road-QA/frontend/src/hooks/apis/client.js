const API_BASE = '/api/v1';

// ── Token storage ────────────────────────────────────────────────────────────

export function getAuthToken() {
  try {
    const token = localStorage.getItem('road_auth_token');
    return token && !token.startsWith('mock-jwt-token') && token.length >= 20
      ? token
      : null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    token
      ? localStorage.setItem('road_auth_token', token)
      : localStorage.removeItem('road_auth_token');
  } catch { /* storage unavailable */ }
}

// ── Request helpers ──────────────────────────────────────────────────────────

function authHeader() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function jsonHeaders() {
  return { 'Content-Type': 'application/json', ...authHeader() };
}

export function bareHeaders() {
  return { ...authHeader() };
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

/**
 * Fetches `path` under API_BASE, parses JSON, and throws on non-2xx.
 * Pass `base: ''` to hit a root-level path (e.g. /health).
 */
export async function apiFetch(path, options = {}, { base = API_BASE } = {}) {
  const res = await fetch(`${base}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}