import type { Adapter } from '@auth/core/adapters';
import GitHub from '@auth/core/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';

import { db } from '@/lib/db';
import { createTable } from '@/lib/db/schema/util';

export const authConfig = {
  adapter: DrizzleAdapter(db, createTable) as Adapter,
  providers: [GitHub],
  allowDangerousEmailAccountLinking: true,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
