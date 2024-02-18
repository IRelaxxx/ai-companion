import { sql } from 'drizzle-orm';

import CompanionForm from './components/companion-form';

import { db } from '@/lib/db';
import { type Category, type Companion, companions } from '@/lib/db/schema/app';

type CompanionIdProps = {
  params: {
    companionId: string;
  };
};

export default async function CompanionIdPage({ params }: CompanionIdProps) {
  const companion = (await db.query.companions.findFirst({
    where: sql`${companions.id} = ${params.companionId}`,
  })) satisfies Companion | undefined;

  const categories =
    (await db.query.categories.findMany()) satisfies Category[];

  return <CompanionForm initialData={companion} categories={categories} />;
}
