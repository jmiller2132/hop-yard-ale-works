/**
 * Best-effort, in-memory rate limiter (sliding window, per key).
 *
 * Limits are per server instance: on serverless each warm instance keeps its
 * own counters, so this stops drive-by spam and runaway loops but is not a hard
 * guarantee. For stricter limits add a Vercel Firewall rate-limit rule or a
 * shared store (Upstash/Vercel KV) and swap this implementation out.
 */

const buckets = new Map<string, number[]>();
const MAX_KEYS = 5_000;

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Keep memory bounded: drop the oldest keys if the map grows too large.
  if (buckets.size > MAX_KEYS) {
    for (const k of buckets.keys()) {
      buckets.delete(k);
      if (buckets.size <= MAX_KEYS / 2) break;
    }
  }
  return true;
}

/** Client IP from the proxy headers Vercel sets; falls back to "unknown". */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
