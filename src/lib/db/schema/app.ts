import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { char, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { v4 as uuidv4 } from 'uuid';

import { createTable } from '@/lib/db/schema/util';

export type Companion = InferSelectModel<typeof companions>;
export type Category = InferSelectModel<typeof categories>;

export const categories = createTable('categories', {
  id: char('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 32 }).notNull(),
});

// ALTER TABLE ai_companion_companions ADD FULLTEXT INDEX `companions_name_fulltext_idx`(name);
export const companions = createTable('companions', {
  id: char('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: char('userId', { length: 36 }).notNull(),
  username: varchar('userName', { length: 32 }).notNull(),
  src: varchar('src', { length: 65 }).notNull(),
  name: text('name').notNull(),
  description: varchar('description', { length: 256 }).notNull(),
  instructions: text('instructions').notNull(),
  seed: text('seed').notNull(),
  createdAt: timestamp('createdAt')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt').onUpdateNow(),
  category: char('category', { length: 36 }).notNull(),
});

export const companionRelations = relations(companions, ({ one }) => ({
  category: one(categories, {
    fields: [companions.category],
    references: [categories.id],
  }),
}));
