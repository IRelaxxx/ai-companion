import { Adapter } from '@auth/core/adapters';
import GitHub from '@auth/core/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';

import { db } from '@/lib/db';
import { createTable } from '@/lib/db/schema';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, createTable) as Adapter,
  providers: [GitHub],
});
