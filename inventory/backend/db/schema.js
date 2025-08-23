import { integer, pgTable, varchar, timestamp, pgEnum, decimal, text, unique } from "drizzle-orm/pg-core";

// Define unit enum with fixed values
export const unitEnum = pgEnum('unit', ['kg', 'grams', 'ml', 'litre', 'pieces', 'dozen', 'packet', 'bottle', 'can']);

// Define role enum
export const roleEnum = pgEnum('role', ['admin', 'manager', 'employee']);

// Users table for authentication
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 100 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(), // Will store hashed password
    role: roleEnum().notNull().default('employee'),
    isActive: integer().notNull().default(1), // 1 for active, 0 for inactive
    lastLogin: timestamp(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow(),
});

export const itemTable = pgTable("items", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    price: decimal({ precision: 10, scale: 2 }).notNull(), // Better for currency
    quantity: integer().notNull().default(0),
    minStockLevel: integer().notNull().default(10), // For low stock alerts
    discount: decimal({ precision: 5, scale: 2 }).default('0.00'), // Percentage discount
    unit: unitEnum().notNull(),
    category: varchar({ length: 100 }),
    isActive: integer().notNull().default(1), // 1 for active, 0 for inactive
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow(),
});

