// Items/Inventory Model - Generated from database introspection
import { pgTable, integer, varchar, numeric, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';

export const unit = pgEnum("unit", ['kg', 'grams', 'ml', 'litre', 'pieces', 'dozen', 'packet', 'bottle', 'can']);

export const items = pgTable("items", {
    id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "items_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
    name: varchar({ length: 255 }).notNull(),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    quantity: integer().default(0).notNull(),
    discount: numeric({ precision: 5, scale: 2 }).default('0.00'),
    unit: unit().notNull(),
    description: text(),
    minStockLevel: integer().default(10).notNull(),
    category: varchar({ length: 100 }),
    isActive: integer().default(1).notNull(),
    createdAt: timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: timestamp({ mode: 'string' }).defaultNow(),
});

export default items;
