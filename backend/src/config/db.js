import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import env from './env.js';
import * as schema from '../db/schema.js';

if (!env.DATABASE_SQL_URL) {
    throw new Error('DATABASE_SQL_URL is not defined');
}

const pool = new Pool({
    connectionString: env.DATABASE_SQL_URL,
});

export const db = drizzle(pool, { schema });
export default db;
