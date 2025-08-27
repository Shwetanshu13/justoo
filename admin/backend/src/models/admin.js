// Admin Model (Drizzle ORM) - Complete Admin System
import { pgTable, serial, varchar, timestamp, integer, unique, pgEnum } from 'drizzle-orm/pg-core';

export const adminRole = pgEnum("admin_role", ['superadmin', 'admin', 'inventory_admin']);

const admin = pgTable('admins', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: adminRole().default('admin').notNull(),
    isActive: integer('is_active').default(1).notNull(),
    lastLogin: timestamp('last_login', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
}, (table) => [
    unique("admins_username_unique").on(table.username),
    unique("admins_email_unique").on(table.email),
]);

export default admin;
