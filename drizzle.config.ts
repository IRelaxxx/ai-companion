import type { Config } from 'drizzle-kit';

import { env } from '@/env.mjs';

export default {
  schema: ['./src/lib/db/schema/app.ts', './src/lib/db/schema/auth.ts'],
  out: './drizzle',
  driver: 'mysql2',
  tablesFilter: ['ai_companion_*'],
  dbCredentials: {
    uri: env.DATABASE_URL,
  },
} satisfies Config;
