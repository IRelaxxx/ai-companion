import { sql } from 'drizzle-orm';
import { mysqlTableCreator, timestamp } from 'drizzle-orm/mysql-core';

export const createTable = mysqlTableCreator((name) => `ai_companion_${name}`);

export const MYSQL_TIMESTAMPS = {
  createdAt: timestamp('createdAt')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt').onUpdateNow(),
};
