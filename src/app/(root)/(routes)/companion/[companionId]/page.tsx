import { and, eq, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { userAgent } from 'next/server';

import CompanionForm from './components/companion-form';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { type Category, type Companion, companions } from '@/lib/db/schema/app';

type CompanionIdProps = {
  params: {
    companionId: string;
  };
};

export default async function CompanionIdPage({ params }: CompanionIdProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }
  const companion = (await db.query.companions.findFirst({
    where: and(
      eq(companions.id, params.companionId),
      eq(companions.userId, session.user.id),
    ),
  })) satisfies Companion | undefined;

  if (!companion) {
    redirect('/');
  }

  const categories =
    (await db.query.categories.findMany()) satisfies Category[];

  return <CompanionForm initialData={companion} categories={categories} />;
}
