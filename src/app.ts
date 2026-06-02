import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config.js';
import { logger } from './logger.js';
import { apiKeyMiddleware } from './middleware/apiKey.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createApiRouter } from './routes/index.js';

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(env.ALLOWED_ORIGINS);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests (curl, Postman, server-to-server)
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        logger.warn({ origin }, 'Blocked by CORS allowlist');
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(apiKeyMiddleware);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', createApiRouter());

  app.use(errorHandler);

  return app;
}
