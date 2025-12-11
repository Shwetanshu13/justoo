import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { justooRiders } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import env from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;

export const riderAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access token required' });
        }

        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        const user = await db.select().from(justooRiders).where(eq(justooRiders.id, decoded.userId));
        if (user.length === 0 || user[0].isActive !== 1) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error in rider auth middleware:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
