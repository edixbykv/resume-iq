import { promises as dns } from "dns";
import { isIP } from "net";

/**
 * SSRF (Server-Side Request Forgery) protection.
 * Blocks requests to private/reserved IP ranges, cloud metadata endpoints,
 * non-HTTP(S) schemes, and unsafe redirects.
 */

// Reserved/private IPv4 ranges that should never be fetched server-side.
const PRIVATE_IPV4_RANGES: Array<[number, number]> = [
  [0x00000000, 0x00ffffff],   // 0.0.0.0/8
  [0x0a000000, 0x0affffff],   // 10.0.0.0/8
  [0x7f000000, 0x7fffffff],   // 127.0.0.0/8 (localhost)
  [0xa9fe0000, 0xa9feffff],   // 169.254.0.0/16 (link-local)
  [0xac100000, 0xac1fffff],   // 172.16.0.0/12
  [0xc0000000, 0xc00000ff],   // 192.0.0.0/24
  [0xc0000200, 0xc00002ff],   // 192.0.2.0/24 (TEST-NET-1)
  [0xc0a80000, 0xc0a8ffff],   // 192.168.0.0/16
  [0xc6120000, 0xc613ffff],   // 198.18.0.0/15 (benchmarking)
  [0xc6336400, 0xc63364ff],   // 198.51.100.0/24 (TEST-NET-2)
  [0xcb007100, 0xcb0071ff],   // 203.0.113.0/24 (TEST-NET-3)
  [0xe0000000, 0xefffffff],   // 224.0.0.0/4 (multicast)
  [0xf0000000, 0xffffffff],   // 240.0.0.0/4 (reserved)
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const int = ipv4ToInt(ip);
  if (int === null) return false;
  return PRIVATE_IPV4_RANGES.some(([start, end]) => int >= start && int <= end);
}

// Common cloud metadata endpoints to block.
const BLOCKED_HOSTNAMES = [
  "169.254.169.254",           // AWS/GCP/Azure metadata
  "metadata.google.internal",  // GCP metadata
  "100.100.100.200",           // Alibaba metadata
  "metadata.tencentyun.com",   // Tencent metadata
];

const BLOCKED_HOSTNAME_PATTERNS = [
  /\.internal$/i,
  /^metadata\./i,
  /^instance-data\./i,
];


export interface SsrfCheckResult {
  safe: boolean;
  reason?: string;
  resolvedIp?: string;
}

/**
 * Validate that a URL is safe to fetch server-side.
 * Performs DNS resolution and checks the resolved IP against private ranges.
 * Also blocks non-HTTP(S) schemes and known metadata endpoints.
 */
export async function checkSsrf(url: string): Promise<SsrfCheckResult> {
  // 1. Validate URL format
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { safe: false, reason: "Invalid URL format." };
  }

  // 2. Only allow HTTP(S) schemes
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { safe: false, reason: `Scheme "${parsed.protocol}" is not allowed. Only HTTP(S) is permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 3. Check blocked hostnames
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { safe: false, reason: "This URL points to a metadata endpoint and is blocked." };
  }
  if (BLOCKED_HOSTNAME_PATTERNS.some((p) => p.test(hostname))) {
    return { safe: false, reason: "This URL pattern is blocked for security." };
  }

  // 4. If it's already an IP address, check private ranges
  if (isIP(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { safe: false, reason: "Requests to private/reserved IP ranges are blocked." };
    }
    return { safe: true };
  }

  // 5. Resolve DNS and check resolved IPs
  try {
    const addresses = await dns.resolve4(hostname);
    for (const addr of addresses) {
      if (isPrivateIPv4(addr)) {
        return {
          safe: false,
          reason: `DNS resolved to a private IP (${addr}), which is blocked.`,
          resolvedIp: addr,
        };
      }
    }
  } catch {
    // DNS resolution failure - could be a non-existent domain.
    // Still allow the request to proceed; fetch will fail naturally.
  }

  return { safe: true };
}

/**
 * Maximum response size for external fetches (5 MB).
 */
export const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

/**
 * Default timeout in ms for external fetches.
 */
export const EXTERNAL_FETCH_TIMEOUT_MS = 10_000;

/**
 * Safe fetch wrapper with SSRF protection, size limits, and timeouts.
 * Use this instead of raw `fetch()` when the URL comes from user input.
 */
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const ssrfResult = await checkSsrf(url);
  if (!ssrfResult.safe) {
    throw new Error(`SSRF blocked: ${ssrfResult.reason}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXTERNAL_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal ?? controller.signal,
      headers: {
        ...options.headers,
        "User-Agent": "Mozilla/5.0 (compatible; KVAI-Resume-Bot/1.0; +https://resume.kvai.in)",
      },
      redirect: "manual", // We handle redirects manually for SSRF safety
    });

    // Handle redirects safely - check each redirect target
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        const redirectResult = await checkSsrf(new URL(location, url).href);
        if (!redirectResult.safe) {
          throw new Error(`SSRF blocked on redirect: ${redirectResult.reason}`);
        }
        // Follow the redirect with a new safe fetch
        const redirectedUrl = new URL(location, url).href;
        clearTimeout(timeout);
        return safeFetch(redirectedUrl, options);
      }
    }

    // Check content length
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
      throw new Error(`Response too large (${contentLength} bytes, max ${MAX_RESPONSE_BYTES})`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}