// Payment Model
import { pgTable, serial, integer, varchar, timestamp, decimal } from 'drizzle-orm/pg-core';

const payment = pgTable('payments', {
    id: serial('id').primaryKey(),
    order_id: integer('order_id'),
    amount: decimal('amount', { precision: 10, scale: 2 }),
    method: varchar('method', { length: 50 }),
    status: varchar('status', { length: 50 }).default('pending'),
    created_at: timestamp('created_at').defaultNow()
});

export default payment;