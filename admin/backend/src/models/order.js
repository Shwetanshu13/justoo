// Order Model - Generated from database introspection
import { pgTable, integer, varchar, numeric, timestamp, text } from 'drizzle-orm/pg-core';

export const orders = pgTable("orders", {
    id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "orders_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
    userId: integer().notNull(),
    status: varchar({ length: 50 }).default('placed').notNull(),
    totalAmount: numeric({ precision: 10, scale: 2 }).notNull(),
    itemCount: integer().notNull(),
    notes: text(),
    createdAt: timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: timestamp({ mode: 'string' }).defaultNow(),
});

export const orderItems = pgTable("order_items", {
    id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "order_items_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
    orderId: integer().notNull(),
    itemId: integer().notNull(),
    itemName: varchar({ length: 255 }).notNull(),
    quantity: integer().notNull(),
    unitPrice: numeric({ precision: 10, scale: 2 }).notNull(),
    totalPrice: numeric({ precision: 10, scale: 2 }).notNull(),
    unit: varchar({ length: 50 }).notNull(),
    createdAt: timestamp({ mode: 'string' }).defaultNow(),
});

export default orders;