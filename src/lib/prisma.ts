import { PrismaClient } from '@prisma/client';

import { env } from '../config.js';
import { logger } from '../logger.js';

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as PrismaGlobal;

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: env.isDevelopment ? ['query', 'warn', 'error'] : ['error'],
		datasources: {
			db: {
				url: env.DATABASE_URL
			}
		},
		errorFormat: 'pretty'
	});

if (env.isDevelopment) {
	globalForPrisma.prisma = prisma;
}

// Add connection error handling
prisma.$connect().catch((error) => {
	console.error('Failed to connect to database:');
	console.error('Error name:', error.name);
	console.error('Error message:', error.message);
	console.error('Error stack:', error.stack);
	console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
	process.exit(1);
});

