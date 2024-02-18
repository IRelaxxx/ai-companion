import Categories from '@/components/categories';
import SearchInput from '@/components/search-input';
import { db } from '@/lib/db';
import type { Category } from '@/lib/db/schema/app';

export default async function Home() {
  const loadedCategories =
    (await db.query.categories.findMany()) satisfies Category[];

  return (
    <div className="h-full space-y-2 p-4">
      <SearchInput />
      <Categories data={loadedCategories} />
    </div>
  );
}
