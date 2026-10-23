export async function checkBackendHealth() {
  try {
    const res = await fetch('/health', { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error('Health check error');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}