import { connect } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless';

import { env } from '@/env.mjs';
import * as appSchema from '@/lib/db/schema/app';
import * as authSchema from '@/lib/db/schema/auth';

// create the connection
const connection = connect({
  url: env.DATABASE_URL,
});

export const db = drizzle(connection, {
  schema: { ...appSchema, ...authSchema },
});
