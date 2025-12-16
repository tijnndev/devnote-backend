import { Router } from 'express';
import { z } from 'zod';

import { createFolder, deleteFolder, updateFolder } from '../services/noteService.js';
import { serializeBigInt } from '../lib/serialize.js';

const baseSchema = z.object({
	title: z.string().min(1),
	description: z.string().max(2048).optional().nullable(),
	color: z.string().max(32).optional().nullable(),
	parentId: z
		.string()
		.cuid({ message: 'Invalid folder id' })
		.optional()
		.nullable(),
	position: z.number().int().min(0).optional()
});

const createFolderSchema = baseSchema;
const updateFolderSchema = baseSchema.partial();

export const foldersRouter = Router();

foldersRouter.post('/', async (req, res, next) => {
	try {
		const payload = createFolderSchema.parse(req.body);
		const folder = await createFolder(payload);
		res.status(201).json({ folder: serializeBigInt(folder) });
	} catch (error) {
		next(error);
	}
});

foldersRouter.patch('/:folderId', async (req, res, next) => {
	try {
		const payload = updateFolderSchema.parse(req.body);
		const folder = await updateFolder(req.params.folderId, payload);
		res.json({ folder: serializeBigInt(folder) });
	} catch (error) {
		next(error);
	}
});

foldersRouter.delete('/:folderId', async (req, res, next) => {
	try {
		await deleteFolder(req.params.folderId);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
});