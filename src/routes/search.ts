import { Router } from 'express';
import { z } from 'zod';

import { searchPages } from '../services/noteService.js';
import { serializeBigInt } from '../lib/serialize';

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional()
});

export const searchRouter = Router();

searchRouter.get('/', async (req, res, next) => {
  try {
    const { query, limit } = searchSchema.parse(req.query);
    const results = await searchPages(query, limit ?? 20);
    res.json({ results: serializeBigInt(results) });
  } catch (error) {
    next(error);
  }
});
