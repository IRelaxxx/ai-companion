import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { env } from '@/env.mjs';

export async function rateLimit(identifier: string) {
  const rateLimit = new Ratelimit({
    redis: new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(10, '10s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
  });

  return await rateLimit.limit(identifier);
}
