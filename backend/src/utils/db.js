import db from '../config/db.js';
import { eq } from 'drizzle-orm';

export const findById = async (table, id) => {
    const result = await db.select().from(table).where(eq(table.id, id));
    return result[0] || null;
};

export const findByUsername = async (table, username) => {
    const result = await db.select().from(table).where(eq(table.username, username));
    return result[0] || null;
};

export const createRecord = async (table, data) => {
    const result = await db.insert(table).values(data).returning();
    return result[0];
};

export const updateRecord = async (table, id, data) => {
    const result = await db.update(table).set(data).where(eq(table.id, id)).returning();
    return result[0];
};

export const deleteRecord = async (table, id) => {
    const result = await db.delete(table).where(eq(table.id, id)).returning();
    return result[0];
};

export const getAllRecords = async (table, limit = 100) => {
    return db.select().from(table).limit(limit);
};
