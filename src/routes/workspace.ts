import { Router } from 'express';

import { getFolder, getWorkspaceTree } from '../services/noteService.js';
import { serializeBigInt } from '../lib/serialize.js';

export const workspaceRouter = Router();

workspaceRouter.get('/tree', async (_req, res, next) => {
	try {
		const tree = await getWorkspaceTree();
		res.json({ tree: serializeBigInt(tree) });
	} catch (error) {
		next(error);
	}
});

workspaceRouter.get('/folders/:folderId', async (req, res, next) => {
	try {
		const folder = await getFolder(req.params.folderId);

		if (!folder) {
			res.status(404).json({ error: 'Folder not found' });
			return;
		}

		res.json({ folder: serializeBigInt(folder) });
	} catch (error) {
		next(error);
	}
});