import { apiFetch, jsonHeaders, setAuthToken,bareHeaders } from './client.js';

export async function registerUser(name, email, password, phone = '') {
  return apiFetch('/auth/register', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ name, email, password, phone }),
  });
}

export async function loginUser(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!data.access_token) throw new Error('The server did not return an access token.');
  setAuthToken(data.access_token);
  return data;
}

export async function getCurrentUser() {
  return apiFetch('/auth/me', { headers: bareHeaders() });
}