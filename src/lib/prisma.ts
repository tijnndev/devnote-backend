import { PrismaClient } from '@prisma/client';

import { env } from '../config.js';
import { logger } from '../logger.js';

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as PrismaGlobal;

let prismaInstance: PrismaClient | undefined;

try {
	prismaInstance =
		globalForPrisma.prisma ??
		new PrismaClient({
			log: env.isDevelopment ? ['query', 'warn'] : ['error'],
			datasources: {
				db: {
					url: env.DATABASE_URL
				}
			}
		});

	if (env.isDevelopment) {
		globalForPrisma.prisma = prismaInstance;
	}
} catch (error) {
	logger.error({ error }, 'Failed to initialize Prisma Client');
	throw new Error('Prisma Client initialization failed. Make sure to run "npm run build" or "prisma generate" before starting the server.');
}

export const prisma = prismaInstance;

// Graceful shutdown
async function disconnectPrisma() {
	if (prisma) {
		await prisma.$disconnect();
		logger.info('Prisma Client disconnected');
	}
}

const nodeProcess = (globalThis as { process?: NodeJS.Process }).process;

if (nodeProcess) {
	nodeProcess.on('beforeExit', () => {
		disconnectPrisma().catch((error) => {
			logger.error({ error }, 'Error during Prisma disconnect');
		});
	});
}
