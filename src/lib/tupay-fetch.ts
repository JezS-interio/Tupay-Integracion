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

export async function tupayFetch(
  url: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<Response> {
  const proxyUrl = process.env.PROXY_URL;

  if (proxyUrl) {
    // Create a fresh ProxyAgent per request to avoid stale connections
    const dispatcher = new ProxyAgent(proxyUrl);
    const xDate = (options as Record<string, unknown>).headers
      ? ((options as Record<string, unknown>).headers as Record<string, string>)['X-Date']
      : undefined;
    console.log('[tupayFetch] sending via proxy, X-Date:', xDate, 'now:', new Date().toISOString());
    const res = await undiciFetch(url, {
      ...(options as object),
      dispatcher,
    } as Parameters<typeof undiciFetch>[1]);
    return res as unknown as Response;
  }

  return fetch(url, options);
}
