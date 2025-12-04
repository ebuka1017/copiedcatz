import 'server-only';
import { PrismaClient } from '@prisma/client';
import { validateEnv } from './env';

// Validate environment variables on startup
validateEnv();

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
