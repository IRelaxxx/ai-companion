import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/app';

const categoryValues = [
  { name: 'Famous People' },
  { name: 'Movies & TV' },
  { name: 'Musicians' },
  { name: 'Games' },
  { name: 'Animals' },
  { name: 'Philosophy' },
  { name: 'Scientists' },
];

async function main() {
  try {
    const result = await db.insert(categories).values(categoryValues);
    console.log(`Inserted ${result.rowsAffected} Rows`);
  } catch (error) {
    console.error('Error seeding default categories:', error);
  }
}

void main();
