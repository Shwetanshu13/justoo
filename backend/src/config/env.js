import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    BACKEND_PORT: z.string().optional(),
    DATABASE_SQL_URL: z.string().min(1, 'DATABASE_SQL_URL is required'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    SALT_ROUNDS: z.string().default('10'),
    COOKIE_SECRET: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
    ADMIN_FRONTEND_URL: z.string().optional(),
    CUSTOMER_FRONTEND_URL: z.string().optional(),
    INVENTORY_FRONTEND_URL: z.string().optional(),
    RIDER_FRONTEND_URL: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});

let parsed;
try {
    parsed = envSchema.parse(process.env);
} catch (err) {
    console.error('\nEnvironment validation error:');
    if (err.errors) {
        err.errors.forEach((e) => console.error(` - ${e.path.join('.')}: ${e.message}`));
    } else {
        console.error(err);
    }
    console.error('\nPlease set the required environment variables (e.g. in your .env file).');
    process.exit(1);
}

const env = {
    ...parsed,
    PORT: Number(parsed.BACKEND_PORT || parsed.PORT || 3000),
    SALT_ROUNDS: Number(parsed.SALT_ROUNDS || '10'),
    CORS_ORIGINS: [
        parsed.FRONTEND_URL,
        parsed.ADMIN_FRONTEND_URL,
        parsed.CUSTOMER_FRONTEND_URL,
        parsed.INVENTORY_FRONTEND_URL,
        parsed.RIDER_FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
    ].filter(Boolean),
};

export default env;
