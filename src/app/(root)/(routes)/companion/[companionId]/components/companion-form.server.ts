'use server';

import { sql } from 'drizzle-orm';

import { type CompanionFormValues, formSchema } from './companion-form.shared';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { type Companion, companions } from '@/lib/db/schema';

type ResponseType =
  | {
      type: 'error';
      error: unknown;
    }
  | {
      type: 'success';
      companion: Companion;
    };

export async function updateCompanion(
  id: string,
  values: CompanionFormValues,
): Promise<ResponseType> {
  try {
    const user = await auth();

    if (!user?.user?.name || !user.user.id) {
      return {
        type: 'error',
        error: 'unauthorized',
      };
    }

    const parseResult = formSchema.safeParse(values);
    if (!parseResult.success) {
      return {
        type: 'error',
        error: parseResult.error.flatten().fieldErrors,
      };
    }

    const { src, name, description, instructions, seed, category } = values;
    const result = await db
      .update(companions)
      .set({
        src,
        name,
        description,
        instructions,
        seed,
        category,
      })
      .where(
        sql`${companions.id} = ${id} AND ${companions.userId} = ${user.user.id}`,
      );

    if (result.rowsAffected === 0) {
      return {
        type: 'error',
        error: 'unauthorized',
      };
    }

    return {
      type: 'success',
      companion: result.rows[0] as Companion,
    };
  } catch (e) {
    console.log('[COMPANION_POST]', e);
    return { type: 'error', error: 'internal server error' };
  }
}

export async function createCompanion(
  values: CompanionFormValues,
): Promise<ResponseType> {
  try {
    const user = await auth();

    if (!user?.user?.name || !user.user.id) {
      return {
        type: 'error',
        error: 'unauthorized',
      };
    }

    const parseResult = formSchema.safeParse(values);
    if (!parseResult.success) {
      return {
        type: 'error',
        error: parseResult.error.flatten().fieldErrors,
      };
    }

    const { src, name, description, instructions, seed, category } = values;
    const result = await db.insert(companions).values({
      src,
      name,
      description,
      instructions,
      seed,
      category,
      userId: user.user.id,
      username: user.user.name,
    });

    return {
      type: 'success',
      companion: result.rows[0] as Companion,
    };
  } catch (e) {
    console.log('[COMPANION_POST]', e);
    return { type: 'error', error: 'internal server error' };
  }
}
