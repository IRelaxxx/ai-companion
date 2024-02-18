import { mysqlTableCreator } from "drizzle-orm/mysql-core";

export const createTable = mysqlTableCreator((name) => `ai_companion_${name}`);
