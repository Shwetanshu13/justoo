// Rider Model - Separate table for delivery personnel
import { pgTable, serial, varchar, timestamp, integer, unique, pgEnum } from 'drizzle-orm/pg-core';

export const riderStatus = pgEnum("rider_status", ['active', 'inactive', 'suspended']);

export const riders = pgTable('riders', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    status: riderStatus().default('active').notNull(),
    isActive: integer('is_active').default(1).notNull(),
    lastLogin: timestamp('last_login', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
}, (table) => [
    unique("riders_username_unique").on(table.username),
    unique("riders_email_unique").on(table.email),
]);

export default riders;
