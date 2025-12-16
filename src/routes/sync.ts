import { Router } from 'express';
import { z } from 'zod';

import { fetchChanges, getSyncState, upsertSyncState } from '../services/noteService.js';
import { serializeBigInt } from '../lib/serialize';

const checkpointSchema = z.object({
  clientId: z.string().min(3),
  cursor: z.string().min(1)
});

const changesSchema = z.object({
  after: z.string().optional(),
  limit: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().min(1).max(200))
    .optional()
});

export const syncRouter = Router();

syncRouter.get('/state/:clientId', async (req, res, next) => {
  try {
    const state = await getSyncState(req.params.clientId);

    if (!state) {
      res.status(404).json({ error: 'Client state not found' });
      return;
    }

    res.json({ state });
  } catch (error) {
    next(error);
  }
});

syncRouter.post('/checkpoint', async (req, res, next) => {
  try {
    const payload = checkpointSchema.parse(req.body);
    const state = await upsertSyncState(payload.clientId, payload.cursor);
    res.status(201).json({ state });
  } catch (error) {
    next(error);
  }
});

syncRouter.get('/changes', async (req, res, next) => {
  try {
    const { after, limit } = changesSchema.parse(req.query);
    const changes = await fetchChanges(after, limit ?? 100);
    const nextCursor = changes.at(-1)?.createdAt?.toISOString();

    res.json({ changes: serializeBigInt(changes), cursor: nextCursor });
  } catch (error) {
    next(error);
  }
});
