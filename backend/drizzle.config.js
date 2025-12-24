import { defineConfig } from "drizzle-kit";
import env from "./src/config/env.js";

const connectionString = process.env.DATABASE_URL || env.DATABASE_SQL_URL;

if (!connectionString) {
    throw new Error(
        "Set DATABASE_URL (preferred) or DATABASE_SQL_URL in your environment so Drizzle Kit can connect."
    );
}

export default defineConfig({
    schema: "./src/db/schema.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionString,
    },
    tablesFilter: [
        "!spatial_ref_sys",
        "!geography_columns",
        "!geometry_columns",
    ],
    verbose: true,
    strict: true,
});
