import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const itemTable = pgTable("items", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    price: integer().notNull(),
    quantity: integer().notNull(),
    discount: integer(),
    unit: varchar({ length: 50 }).notNull(),
});

