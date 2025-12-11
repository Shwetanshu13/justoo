import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import env from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;
const SALT_ROUNDS = env.SALT_ROUNDS || 10;

export const generateToken = (payload, options = {}) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN, ...options });
};

export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
};
