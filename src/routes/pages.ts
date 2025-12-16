import { Router } from 'express';
import { z } from 'zod';

import {
  createPage,
  deletePage,
  getPage,
  listPageRevisions,
  recordRevision,
  updatePage
} from '../services/noteService.js';
import { serializeBigInt } from '../lib/serialize';

const contentSchema = z
  .object({
    html: z.string().optional(),
    text: z.string().optional(),
    json: z.unknown().optional(),
    canvas: z.unknown().optional()
  })
  .optional();

const createPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional().nullable(),
  position: z.number().int().min(0).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  folderId: z
    .string()
    .cuid({ message: 'Invalid folder id' })
    .optional()
    .nullable(),
  content: contentSchema
});

const updatePageSchema = createPageSchema.partial();

const revisionSchema = z.object({
  snapshot: z.unknown()
});

export const pagesRouter = Router();

pagesRouter.post('/pages', async (req, res, next) => {
  try {
    const payload = createPageSchema.parse(req.body);
    const page = await createPage(payload);
    res.status(201).json({ page: serializeBigInt(page) });
  } catch (error) {
    next(error);
  }
});

pagesRouter.get('/pages/:pageId', async (req, res, next) => {
  try {
    const page = await getPage(req.params.pageId);

    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    res.json({ page: serializeBigInt(page) });
  } catch (error) {
    next(error);
  }
});

pagesRouter.patch('/pages/:pageId', async (req, res, next) => {
  try {
    const payload = updatePageSchema.parse(req.body);
    const page = await updatePage(req.params.pageId, payload);
    res.json({ page: serializeBigInt(page) });
  } catch (error) {
    next(error);
  }
});

pagesRouter.delete('/pages/:pageId', async (req, res, next) => {
  try {
    await deletePage(req.params.pageId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

pagesRouter.post('/pages/:pageId/revisions', async (req, res, next) => {
  try {
    const payload = revisionSchema.parse(req.body);
    const revision = await recordRevision(req.params.pageId, payload.snapshot);
    res.status(201).json({ revision: serializeBigInt(revision) });
  } catch (error) {
    next(error);
  }
});

pagesRouter.get('/pages/:pageId/revisions', async (req, res, next) => {
  try {
    const limit = Number.parseInt(String(req.query.limit ?? '20'), 10);
    const revisions = await listPageRevisions(req.params.pageId, Number.isNaN(limit) ? 20 : limit);
    res.json({ revisions: serializeBigInt(revisions) });
  } catch (error) {
    next(error);
  }
});
