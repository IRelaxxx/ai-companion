'use server';

import { and, eq } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { companions } from '@/lib/db/schema/app';

type ResponseType =
  | {
      type: 'error';
      error: unknown;
    }
  | {
      type: 'success';
    };

export async function CompanionDeleteAction(id: string): Promise<ResponseType> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        type: 'error',
        error: 'unauthorized',
      };
    }

    const result = await db
      .delete(companions)
      .where(
        and(eq(companions.id, id), eq(companions.userId, session.user.id)),
      );
    if (result.rowsAffected === 0) {
      return {
        type: 'error',
        error: 'unauthorized',
      };
    } else {
      return {
        type: 'success',
      };
    }
  } catch (e) {
    console.error('[COMPANION_DELETE]', e);
    return { type: 'error', error: 'internal server error' };
  }
}
