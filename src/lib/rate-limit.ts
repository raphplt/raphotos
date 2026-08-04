import "server-only";

/**
 * Limiteur de débit en mémoire.
 *
 * Suffisant ici : le trafic d'un portfolio est modeste et la contrainte
 * d'unicité en base reste le vrai garde-fou contre les doublons. Sur du
 * serverless, chaque instance a son propre compteur — c'est un filtre
 * anti-abus, pas une garantie stricte.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	retryAfterSeconds: number;
}

export function rateLimit(
	key: string,
	limit: number,
	windowSeconds: number,
): RateLimitResult {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || now > bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
		return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
	}

	// Purge opportuniste pour éviter que la map ne croisse indéfiniment.
	if (buckets.size > 5000) {
		for (const [k, v] of buckets) {
			if (now > v.resetAt) buckets.delete(k);
		}
	}

	if (bucket.count >= limit) {
		return {
			allowed: false,
			remaining: 0,
			retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
		};
	}

	bucket.count += 1;
	return {
		allowed: true,
		remaining: limit - bucket.count,
		retryAfterSeconds: 0,
	};
}
