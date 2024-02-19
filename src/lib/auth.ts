import GitHub from '@auth/core/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';

import { db } from '@/lib/db';
import { createTable } from '@/lib/db/schema/util';

const authConfig = {
  adapter: DrizzleAdapter(db, createTable),
  providers: [GitHub],
  allowDangerousEmailAccountLinking: true,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
