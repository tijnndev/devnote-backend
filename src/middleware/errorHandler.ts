import type { ErrorRequestHandler } from 'express';

import { logger } from '../logger.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
	if (res.headersSent) {
		return next(error);
	}

	// Log the full error with all properties
	logger.error('Unhandled application error');
	console.error('Full error object:', error);
	console.error('Error message:', error.message);
	console.error('Error stack:', error.stack);
	console.error('Error stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

	const statusCode = typeof error.status === 'number' ? error.status : 500;
	res.status(statusCode).json({
		error: error.message ?? 'Internal Server Error'
	});
};
