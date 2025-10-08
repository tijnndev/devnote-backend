import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z
	.object({
		NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
		PORT: z.coerce.number().int().min(0).max(65535).default(4000),
		DATABASE_URL: z.string().min(1).default('file:./devnote.db'),
		API_KEY: z
			.string()
			.trim()
			.transform((value) => (value.length === 0 ? undefined : value))
			.refine((value) => !value || value.length >= 16, {
				message: 'API_KEY must be at least 16 characters'
			})
			.optional(),
		SYNC_WEBHOOK_URL: z.string().url().optional()
	});

const rawEnv =
	(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
	// eslint-disable-next-line no-console
	console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
	throw new Error('Failed to parse environment variables');
}

const { NODE_ENV, ...rest } = parsed.data;

export const env = {
	NODE_ENV,
	...rest,
	isProduction: NODE_ENV === 'production',
	isTest: NODE_ENV === 'test',
	isDevelopment: NODE_ENV === 'development'
};
