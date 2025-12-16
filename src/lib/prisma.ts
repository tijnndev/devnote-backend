import { PrismaClient } from '@prisma/client';

import { env } from '../config.js';

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as PrismaGlobal;

// Create a single instance of PrismaClient
export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: env.isDevelopment ? ['query', 'warn'] : ['error'],
		datasources: {
			db: {
				url: env.DATABASE_URL
			}
		}
	});

// In development, cache the prisma instance globally to prevent multiple instances
if (env.isDevelopment) {
	globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (typeof process !== 'undefined') {
	process.on('beforeExit', async () => {
		await prisma.$disconnect();
	});
}
