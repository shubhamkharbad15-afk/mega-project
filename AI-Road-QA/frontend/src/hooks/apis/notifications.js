import { apiFetch, bareHeaders } from './client.js';

const FALLBACK_NOTIFICATIONS = {
  items:   [],
  source:  'unavailable',
  is_demo: true,
  warning: 'Notifications could not be loaded from the backend.',
};

export async function getNotifications() {
  try {
    return await apiFetch('/notifications/', { headers: bareHeaders() });
  } catch {
    return FALLBACK_NOTIFICATIONS;
  }
}