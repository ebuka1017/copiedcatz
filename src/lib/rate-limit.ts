import { LRUCache } from 'lru-cache';

type Options = {
    uniqueTokenPerInterval?: number;
    interval?: number;
};

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export function rateLimit(options?: Options) {
    const tokenCache = new LRUCache({
        max: options?.uniqueTokenPerInterval || 500,
        ttl: options?.interval || 60000,
    });

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const tokenCount = (tokenCache.get(token) as number[]) || [0];
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount);
                }
                tokenCount[0] += 1;

                const currentUsage = tokenCount[0];
                const isRateLimited = currentUsage >= limit;
                if (isRateLimited) {
                    reject();
                } else {
                    resolve();
                }
            }),
        checkWithResult: (limit: number, token: string): RateLimitResult => {
            const tokenCount = (tokenCache.get(token) as number[]) || [0];
            if (tokenCount[0] === 0) {
                tokenCache.set(token, tokenCount);
            }
            tokenCount[0] += 1;

            const currentUsage = tokenCount[0];
            const isRateLimited = currentUsage >= limit;

            return {
                success: !isRateLimited,
                limit,
                remaining: Math.max(0, limit - currentUsage),
                reset: Date.now() + (options?.interval || 60000),
            };
        },
    };
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
    };
}

/**
 * Pre-configured rate limiters for different endpoint types
 */
export const rateLimiters = {
    // Standard API endpoints: 100 requests per minute
    standard: rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 }),
    // Auth endpoints: 10 requests per minute (prevent brute force)
    auth: rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 }),
    // AI/Generation endpoints: 20 requests per minute (expensive operations)
    generation: rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 }),
    // File upload endpoints: 30 requests per minute
    upload: rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 }),
};

export const RATE_LIMITS = {
    standard: 100,
    auth: 10,
    generation: 20,
    upload: 30,
} as const;

/**
 * Get identifier from request (user ID if authenticated, IP otherwise)
 */
export function getIdentifier(req: Request, userId?: string | null): string {
    if (userId) {
        return `user:${userId}`;
    }

    // Try to get real IP from headers (for proxied requests)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

    return `ip:${ip}`;
}
