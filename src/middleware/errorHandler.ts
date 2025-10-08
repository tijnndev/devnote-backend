import type { ErrorRequestHandler } from 'express';

import { logger } from '../logger.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
	if (res.headersSent) {
		return next(error);
	}

	logger.error({ error }, 'Unhandled application error');

	const statusCode = typeof error.status === 'number' ? error.status : 500;
	res.status(statusCode).json({
		error: error.message ?? 'Internal Server Error'
	});
};
