// apps/backend/src/lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import { conf } from "../conf/conf";

const pool = new Pool({
    connectionString: conf.dbUrl,
});

export const db = drizzle(pool, { schema });
