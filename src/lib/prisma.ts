import { PrismaClient } from '@prisma/client';

import { env } from '../config.js';
import { logger } from '../logger.js';

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as PrismaGlobal;

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

if (env.isDevelopment) {
	globalForPrisma.prisma = prisma;
}
