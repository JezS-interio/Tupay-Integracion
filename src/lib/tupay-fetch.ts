import { ProxyAgent, fetch as undiciFetch } from 'undici';

/**
 * Module-level cache for TuPay server clock offset (ms).
 */
let _clockOffsetMs: number | null = null;

export function getTupayClockOffsetMs(): number | null {
  return _clockOffsetMs;
}

export function setTupayClockOffsetMs(offsetMs: number): void {
  _clockOffsetMs = offsetMs;
}

/**
 * Returns a TuPay-compatible X-Date string.
 */
export function buildTupayDate(offsetMs: number = 0): string {
  return new Date(Date.now() + offsetMs).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// Cache undici ProxyAgent (only used for authenticated proxies like Fixie)
let _proxyAgent: ProxyAgent | null = null;
function getProxyAgent(proxyUrl: string): ProxyAgent {
  if (!_proxyAgent) {
    _proxyAgent = new ProxyAgent({ uri: proxyUrl, keepAliveTimeout: 30_000, keepAliveMaxTimeout: 60_000 });
  }
  return _proxyAgent;
}

/**
 * tupayFetch — forwards requests to TuPay through a fixed-IP proxy.
 *
 * PROXY_URL formats:
 *   http://HOST:PORT           -> HTTP forwarder (AWS EC2), uses /proxy?url=
 *   http://user:pass@HOST:PORT -> undici ProxyAgent (Fixie etc.)
 *
 * Without PROXY_URL falls back to native fetch.
 */
export async function tupayFetch(
  url: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<Response> {
  const proxyUrl = process.env.PROXY_URL;

  if (!proxyUrl) {
    return fetch(url, options);
  }

  // HTTP forwarder (no credentials = AWS EC2 proxy)
  if (!proxyUrl.includes('@')) {
    const forwardUrl = `${proxyUrl.replace(/\/$/, '')}/proxy?url=${encodeURIComponent(url)}`;
    console.log('[TuPay] forwarding via HTTP proxy:', proxyUrl);
    const opts = options as RequestInit;
    return fetch(forwardUrl, {
      method: opts.method,
      headers: opts.headers,
      body: opts.body,
    });
  }

  // Authenticated proxy (Fixie etc.)
  const dispatcher = getProxyAgent(proxyUrl);
  const res = await undiciFetch(url, {
    ...(options as object),
    dispatcher,
  } as Parameters<typeof undiciFetch>[1]);
  return res as unknown as Response;
}
