import type { NextFunction, Request, Response } from 'express';

import { env } from '../config.js';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
	if (!env.API_KEY || env.isTest) {
		return next();
	}

	const headerKey = req.get('x-api-key');

	if (headerKey && headerKey === env.API_KEY) {
		return next();
	}

	res.status(401).json({ error: 'Unauthorized' });
}
