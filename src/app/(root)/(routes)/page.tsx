import { type InferSelectModel, sql } from 'drizzle-orm';

import Categories from '@/components/categories';
import SearchInput from '@/components/search-input';
import { db } from '@/lib/db';
import { categoriesTable } from '@/lib/db/schema';

type Category = InferSelectModel<typeof categoriesTable>;

export default async function Home() {
  const categories = await db.execute(
    sql<Category>`select * from ${categoriesTable}`,
  );

  return (
    <div className="h-full p-4 space-y-2">
      <SearchInput />
      <Categories data={categories.rows} />
    </div>
  );
}
