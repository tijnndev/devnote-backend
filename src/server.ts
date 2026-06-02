import { createApp } from './app.js';
import { env } from './config.js';
import { ensureDatabase } from './lib/migrate.js';
import { logger } from './logger.js';

type RouteLayer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
  };
  name?: string;
  handle?: {
    stack?: RouteLayer[];
  };
  regexp?: {
    source?: string;
  };
};

function normaliseMountPath(layer: RouteLayer): string {
  const source = layer.regexp?.source;
  if (!source || source === '^\\/?(?=\\/|$)') {
    return '';
  }

  return source
    .replace('^', '')
    .replace('\\/?(?=\\/|$)', '')
    .replace(/\\\//g, '/')
    .replace(/\$$/, '');
}

function collectRoutes(layers: RouteLayer[], prefix = ''): string[] {
  const routes: string[] = [];

  for (const layer of layers) {
    if (layer.route) {
      const methods = Object.entries(layer.route.methods)
        .filter(([, enabled]) => enabled)
        .map(([method]) => method.toUpperCase())
        .join(',');
      routes.push(`${methods} ${prefix}${layer.route.path}`);
      continue;
    }

    if (layer.name === 'router' && layer.handle?.stack) {
      const mountPath = normaliseMountPath(layer);
      routes.push(...collectRoutes(layer.handle.stack, `${prefix}${mountPath}`));
    }
  }

  return routes;
}

function logMountedRoutes(app: unknown) {
  const appLike = app as { _router?: { stack?: RouteLayer[] } };
  const stack = appLike._router?.stack;
  if (!stack) {
    logger.warn('Unable to inspect mounted routes');
    return;
  }

  const routes = collectRoutes(stack).sort();
  logger.info({ count: routes.length }, 'Mounted routes at startup');
  for (const route of routes) {
    logger.info({ route }, 'Route');
  }
}

await ensureDatabase();

const app = createApp();
logMountedRoutes(app);

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
