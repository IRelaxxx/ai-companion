import { type InferSelectModel, relations } from 'drizzle-orm';
import { char, index, mysqlEnum, text, varchar } from 'drizzle-orm/mysql-core';
import { v4 as uuidv4 } from 'uuid';

import { users } from '@/lib/db/schema/auth';
import { MYSQL_TIMESTAMPS, createTable } from '@/lib/db/schema/util';

export type Companion = InferSelectModel<typeof companions>;
export type Category = InferSelectModel<typeof categories>;
export type Message = InferSelectModel<typeof messages>;

export const categories = createTable('categories', {
  id: char('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 32 }).notNull(),
});

export const companions = createTable(
  'companions',
  {
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
    categoryId: char('categoryId', { length: 36 }).notNull(),
    ...MYSQL_TIMESTAMPS,
  },
  (companion) => ({
    categoryIdIdx: index('companions_categoryId_idx').on(companion.categoryId),
  }),
);

export const companionRelations = relations(companions, ({ one, many }) => ({
  category: one(categories, {
    fields: [companions.categoryId],
    references: [categories.id],
  }),
  messages: many(messages),
}));

// as const because drizzle wants a [string, ...string[]] -> array with a least one element
export const ROLE_VALUES = ['user', 'system'] as const;

export const messages = createTable(
  'messages',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    role: mysqlEnum('role', ROLE_VALUES).notNull(),
    content: text('content').notNull(),

    companionId: char('companionId', { length: 36 }).notNull(),
    userId: varchar('userId', { length: 255 }).notNull(),
    ...MYSQL_TIMESTAMPS,
  },
  (message) => ({
    companionIdIdx: index('messages_companionId_idx').on(message.companionId),
    userIdIdx: index('messages_userId_idx').on(message.userId),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  companionId: one(companions, {
    fields: [messages.companionId],
    references: [companions.id],
  }),
  userId: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));
