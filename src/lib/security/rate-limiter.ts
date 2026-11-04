/**
 * In-Memory Sliding-Window Rate Limiter
 * STACK.md & PRD.md Section 13:
 * Protects AI generation, form submissions, and tenant public routes from DDoS and abusive scraping.
 * Follows improve-backend-code guidelines: memory-safe, clean early returns, efficient pruning.
 */

export interface RateLimitConfig {
  maxRequests: number; // Maximum allowed requests
  windowMs: number;    // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs?: number;
}

export class RateLimiter {
  private static store = new Map<string, number[]>();

  /**
   * Check if a client key (e.g. IP or tenant API key) is within allowed rate limits
   */
  public static checkLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Prune expired timestamps for this key
    const existing = this.store.get(key) ?? [];
    const validTimestamps = existing.filter((timestamp) => timestamp > windowStart);

    if (validTimestamps.length >= config.maxRequests) {
      const oldestValid = validTimestamps[0];
      const resetAt = oldestValid + config.windowMs;
      const retryAfterMs = Math.max(0, resetAt - now);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfterMs,
      };
    }

    // Append current timestamp and update store
    validTimestamps.push(now);
    this.store.set(key, validTimestamps);

    return {
      allowed: true,
      remaining: config.maxRequests - validTimestamps.length,
      resetAt: now + config.windowMs,
    };
  }

  /**
   * Prunes all expired keys globally (preventing memory leaks in long-running processes)
   */
  public static purgeExpiredEntries(windowMs = 60000): number {
    const threshold = Date.now() - windowMs;
    let prunedCount = 0;

    this.store.forEach((timestamps, key) => {
      const active = timestamps.filter((t) => t > threshold);
      if (active.length === 0) {
        this.store.delete(key);
        prunedCount++;
      } else {
        this.store.set(key, active);
      }
    });

    return prunedCount;
  }

  /**
   * Reset store (useful for unit tests or manual IP unban)
   */
  public static reset(key?: string): void {
    if (key) {
      this.store.delete(key);
      return;
    }
    this.store.clear();
  }
}
