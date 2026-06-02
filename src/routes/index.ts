import { Router } from 'express';

import { foldersRouter } from './folders.js';
import { pagesRouter } from './pages.js';
import { searchRouter } from './search.js';
import { syncRouter } from './sync.js';
import { todosRouter } from './todos.js';
import { workspaceRouter } from './workspace.js';

export function createApiRouter() {
  const router = Router();

  router.use('/workspace', workspaceRouter);
  router.use('/folders', foldersRouter);
  router.use('/', pagesRouter);
  router.use('/search', searchRouter);
  router.use('/todos', todosRouter);
  router.use('/sync', syncRouter);

  return router;
}
