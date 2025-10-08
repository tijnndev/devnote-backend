import { Router } from 'express';
import { z } from 'zod';

import {
  createNotebook,
  createSection,
  deleteNotebook,
  getNotebook,
  getNotebookTree,
  updateNotebook
} from '../services/noteService.js';

const createNotebookSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(2048).optional().nullable(),
  color: z.string().max(32).optional().nullable()
});

const updateNotebookSchema = createNotebookSchema.partial();

const sectionSchema = z.object({
  title: z.string().min(1),
  position: z.number().int().min(0).optional()
});

export const notebooksRouter = Router();

notebooksRouter.get('/', async (_req, res, next) => {
  try {
    const notebooks = await getNotebookTree();
    res.json({ notebooks });
  } catch (error) {
    next(error);
  }
});

notebooksRouter.post('/', async (req, res, next) => {
  try {
    const payload = createNotebookSchema.parse(req.body);
    const notebook = await createNotebook(payload);
    res.status(201).json({ notebook });
  } catch (error) {
    next(error);
  }
});

notebooksRouter.get('/:notebookId', async (req, res, next) => {
  try {
    const notebook = await getNotebook(req.params.notebookId);

    if (!notebook) {
      res.status(404).json({ error: 'Notebook not found' });
      return;
    }

    res.json({ notebook });
  } catch (error) {
    next(error);
  }
});

notebooksRouter.patch('/:notebookId', async (req, res, next) => {
  try {
    const payload = updateNotebookSchema.parse(req.body);
    const notebook = await updateNotebook(req.params.notebookId, payload);
    res.json({ notebook });
  } catch (error) {
    next(error);
  }
});

notebooksRouter.delete('/:notebookId', async (req, res, next) => {
  try {
    await deleteNotebook(req.params.notebookId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

notebooksRouter.post('/:notebookId/sections', async (req, res, next) => {
  try {
    const payload = sectionSchema.parse(req.body);
    const section = await createSection(req.params.notebookId, payload);
    res.status(201).json({ section });
  } catch (error) {
    next(error);
  }
});

