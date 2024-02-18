import { and, countDistinct, desc, eq, sql } from 'drizzle-orm';

import Categories from '@/components/categories';
import Companions from '@/components/companions';
import SearchInput from '@/components/search-input';
import { db } from '@/lib/db';
import {
  type Category,
  type Companion,
  companions,
  messages,
} from '@/lib/db/schema/app';

type RootPageProps = {
  searchParams: {
    categoryId: string;
    name: string;
  };
};

export default async function Home({ searchParams }: RootPageProps) {
  const companionData = (await db
    .select({
      id: companions.id,
      userId: companions.userId,
      username: companions.username,
      src: companions.src,
      name: companions.name,
      description: companions.description,
      instructions: companions.instructions,
      seed: companions.seed,
      categoryId: companions.categoryId,
      createdAt: companions.createdAt,
      updatedAt: companions.updatedAt,
      messageCount: countDistinct(messages.id),
    })
    .from(companions)
    .leftJoin(messages, eq(messages.companionId, companions.id))
    .where(
      and(
        searchParams.categoryId && searchParams.categoryId !== ''
          ? eq(companions.categoryId, searchParams.categoryId)
          : sql`true`,
        sql`lower(${companions.name}) like ${`%${searchParams.name.toLowerCase()}%`}`,
      ),
    )
    .groupBy(companions.id)
    .orderBy(desc(companions.createdAt))) satisfies (Companion & {
    messageCount: number;
  })[];
  const loadedCategories =
    (await db.query.categories.findMany()) satisfies Category[];

  return (
    <div className="h-full space-y-2 p-4">
      <SearchInput />
      <Categories data={loadedCategories} />
      <Companions data={companionData} />
    </div>
  );
}
