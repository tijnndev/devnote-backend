import { createApp } from './app.js';
import { env } from './config.js';
import { ensureDatabase } from './lib/migrate.js';
import { logger } from './logger.js';

await ensureDatabase();

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'DevNote backend listening');
});

type NodeProcessLike = {
  on?: (signal: string, handler: () => void) => void;
  exit?: (code?: number) => void;
};

const nodeProcess = (globalThis as { process?: NodeProcessLike }).process;

function createShutdownHandler(signal: string) {
  return () => {
    logger.info({ signal }, 'Received shutdown signal');
    server.close(() => {
      logger.info('Server closed');
      nodeProcess?.exit?.(0);
    });
  };
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  nodeProcess?.on?.(signal, createShutdownHandler(signal));
}
