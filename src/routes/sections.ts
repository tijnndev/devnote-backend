import { Router } from 'express';
import { z } from 'zod';

// TODO: These functions are not fully implemented yet
import { deleteSection, updateSection } from '../services/noteService.js';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().int().min(0).optional()
});

export const sectionsRouter = Router();

sectionsRouter.patch('/:sectionId', async (req, res, next) => {
  try {
    const payload = updateSchema.parse(req.body);
    const section = await updateSection(req.params.sectionId, payload);
    res.json({ section });
  } catch (error) {
    next(error);
  }
});

sectionsRouter.delete('/:sectionId', async (req, res, next) => {
  try {
    await deleteSection(req.params.sectionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
