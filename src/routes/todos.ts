import { Router } from 'express';

import { getTodos } from '../services/noteService.js';
import { serializeBigInt } from '../lib/serialize.js';

export const todosRouter = Router();

todosRouter.get('/', async (_req, res, next) => {
  try {
    const todos = await getTodos();
    res.json({ todos: serializeBigInt(todos) });
  } catch (error) {
    next(error);
  }
});
