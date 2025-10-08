import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { env } from '../config.js';
import { logger } from '../logger.js';

const backendRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)), '..');

export async function ensureDatabase() {
	if (env.isTest) {
		return;
	}

	try {
		execSync('npx prisma migrate deploy', {
			cwd: backendRoot,
			stdio: env.isDevelopment ? 'inherit' : 'ignore'
		});
		logger.info('Database schema is up to date');
	} catch (error) {
		logger.error({ error }, 'Failed to apply Prisma migrations');
		throw error;
	}
}