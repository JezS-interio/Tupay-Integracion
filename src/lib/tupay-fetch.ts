/**
 * tupayFetch — proxy-aware fetch wrapper for Tupay API calls.
 *
 * When the env var PROXY_URL is set (e.g. http://user:pass@proxy.fixie.io:80),
 * all outbound requests to Tupay go through that proxy so Vercel uses a fixed IP.
 *
 * Without PROXY_URL it falls back to native fetch transparently.
 *
 * Usage: replace every `fetch(tupayUrl, options)` call in Tupay route handlers
 * with `tupayFetch(tupayUrl, options)`.
 *
 * To enable the proxy, add PROXY_URL to your Vercel environment variables.
 */

import { ProxyAgent, fetch as undiciFetch } from 'undici';

/**
 * Module-level cache for TuPay server clock offset (ms).
 * Persists across requests within the same Vercel function instance.
 * Eliminates the need for a failing first request to detect clock skew.
 */
let _clockOffsetMs: number | null = null;

export function getTupayClockOffsetMs(): number | null {
  return _clockOffsetMs;
}

export function setTupayClockOffsetMs(offsetMs: number): void {
  _clockOffsetMs = offsetMs;
}

/**
 * Returns a TuPay-compatible X-Date string, applying known clock offset.
 * If TUPAY_DATE_OFFSET_SECONDS env var is set it takes priority.
 */
export function buildTupayDate(offsetMs: number = 0): string {
  const manualSec = process.env.TUPAY_DATE_OFFSET_SECONDS
    ? parseInt(process.env.TUPAY_DATE_OFFSET_SECONDS, 10)
    : null;
  const ms = manualSec !== null && !isNaN(manualSec)
    ? Date.now() + manualSec * 1000
    : Date.now() + offsetMs;
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Probe TuPay's server time with a cheap HEAD request.
 * Updates the module-level clock offset cache.
 * Call this once per cold start before creating a deposit.
 */
export async function syncTupayServerTime(baseUrl: string): Promise<void> {
  // Skip if already cached or manual override set
  if (_clockOffsetMs !== null || process.env.TUPAY_DATE_OFFSET_SECONDS) return;
  try {
    const before = Date.now();
    const res = await tupayFetch(`${baseUrl}/v3/deposits`, { method: 'HEAD' });
    const rtt = Date.now() - before;
    const serverDateHeader = res.headers.get('date');
    if (serverDateHeader) {
      const serverTime = new Date(serverDateHeader).getTime();
      // Compensate for half the round-trip time
      _clockOffsetMs = serverTime - Date.now() + Math.round(rtt / 2);
      console.log('[TuPay] server time synced, offset ms:', _clockOffsetMs, 'rtt ms:', rtt);
    }
  } catch (e) {
    // Non-fatal — fall back to retry-on-error strategy
    console.warn('[TuPay] server time probe failed:', e);
  }
}

export async function tupayFetch(
  url: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<Response> {
  const proxyUrl = process.env.PROXY_URL;

  if (proxyUrl) {
    // Create a fresh ProxyAgent per request to avoid stale connections
    const dispatcher = new ProxyAgent(proxyUrl);
    const res = await undiciFetch(url, {
      ...(options as object),
      dispatcher,
    } as Parameters<typeof undiciFetch>[1]);
    return res as unknown as Response;
  }

  return fetch(url, options);
}
