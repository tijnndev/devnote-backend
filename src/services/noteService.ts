import type { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma.js';
import { logger } from '../logger.js';
import { serializeBigInt } from '../lib/serialize.js';

type FolderInput = {
  title: string;
  description?: string | null;
  color?: string | null;
  parentId?: string | null;
  position?: number;
};

type UpdateFolderInput = Partial<Omit<FolderInput, 'title'>> & { title?: string };

type PageContentInput = {
  html?: string;
  text?: string;
  json?: unknown;
  canvas?: unknown;
};

type PageInput = {
  title: string;
  slug?: string | null;
  position?: number;
  isPinned?: boolean;
  isArchived?: boolean;
  folderId?: string | null;
  content?: PageContentInput;
};

type UpdatePageInput = Partial<PageInput>;

type PageWithContent = Prisma.pageGetPayload<{
  include: {
    content: true;
  };
}>;

type FolderWithPages = Prisma.folderGetPayload<{
  include: {
    pages: {
      include: {
        content: true;
      };
    };
  };
}>;

type FolderTreeNode = {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  position: number;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  pages: PageWithContent[];
  children: FolderTreeNode[];
};

export type WorkspaceTree = {
  folders: FolderTreeNode[];
  pages: PageWithContent[];
};

const CHANGE_TYPES = {
  folder: 'FOLDER',
  page: 'PAGE',
  pageContent: 'PAGE_CONTENT'
} as const;

const CHANGE_ACTIONS = {
  create: 'CREATE',
  update: 'UPDATE',
  delete: 'DELETE'
} as const;

function normaliseSearchText(text?: string | null) {
  if (!text) {
    return '';
  }

  return text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000);
}

function serialiseJson(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    logger.warn({ error }, 'Failed to stringify rich text payload');
    return null;
  }
}

async function logChange(
  tx: Prisma.TransactionClient,
  entityType: keyof typeof CHANGE_TYPES,
  entityId: string,
  action: keyof typeof CHANGE_ACTIONS,
  payload: unknown
) {
  await tx.changelog.create({
    data: {
      entityType: CHANGE_TYPES[entityType],
      entityId,
      action: CHANGE_ACTIONS[action],
      payload: JSON.stringify(serializeBigInt(payload ?? {}))
    }
  });
}

function sortTree(nodes: FolderTreeNode[]) {
  nodes.sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  for (const node of nodes) {
    node.pages.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    sortTree(node.children);
  }
}

function buildFolderTree(folders: FolderWithPages[]): FolderTreeNode[] {
  const nodes = new Map<string, FolderTreeNode>();

  for (const folder of folders) {
    nodes.set(folder.id, {
      id: folder.id,
      title: folder.title,
      description: folder.description ?? null,
      color: folder.color ?? null,
      position: folder.position,
      parentId: folder.parentId ?? null,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      pages: folder.pages,
      children: []
    });
  }

  const roots: FolderTreeNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  sortTree(roots);
  return roots;
}

async function resolveFolderPosition(tx: Prisma.TransactionClient, parentId: string | null | undefined) {
  const where = parentId ? { parentId } : { parentId: null };
  const count = await tx.folder.count({ where });
  return count;
}

async function resolvePagePosition(tx: Prisma.TransactionClient, folderId: string | null | undefined) {
  const where = folderId ? { folderId } : { folderId: null };
  const count = await tx.page.count({ where });
  return count;
}

async function upsertPageContent(
  tx: Prisma.TransactionClient,
  pageId: string,
  content?: PageContentInput
) {
  if (!content) {
    return null;
  }

  const html = content.html ?? '';
  const text = normaliseSearchText(content.text ?? content.html);
  const json = serialiseJson(content.json);
  const canvasJson = serialiseJson(content.canvas);

  const existing = await tx.pagecontent.findFirst({ where: { pageId } });

  if (existing) {
    const updated = await tx.pagecontent.update({
      where: { id: existing.id },
      data: {
        html,
        text,
        json,
        canvasJson
      }
    });

    await logChange(tx, 'pageContent', updated.id, 'update', updated);
    return updated;
  }

  const created = await tx.pagecontent.create({
    data: {
      pageId,
      html,
      text,
      json,
      canvasJson
    }
  });

  await logChange(tx, 'pageContent', created.id, 'create', created);
  return created;
}

export async function getWorkspaceTree(): Promise<WorkspaceTree> {
  const folders = await prisma.folder.findMany({
    include: {
      pages: {
        include: { content: true },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
      }
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
  });

  const rootPages = await prisma.page.findMany({
    where: { folderId: null },
    include: { content: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
  });

  return {
    folders: buildFolderTree(folders),
    pages: rootPages
  };
}

export async function getFolder(id: string) {
  return prisma.folder.findUnique({
    where: { id },
    include: {
      pages: {
        include: { content: true },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
      }
    }
  });
}

export async function createFolder(input: FolderInput) {
  return prisma.$transaction(async (tx) => {
    const parentId = input.parentId ?? null;
    const position = input.position ?? (await resolveFolderPosition(tx, parentId));

    const folder = await tx.folder.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        color: input.color ?? null,
        parentId,
        position
      }
    });

    await logChange(tx, 'folder', folder.id, 'create', folder);

    return folder;
  });
}

export async function updateFolder(id: string, input: UpdateFolderInput) {
  return prisma.$transaction(async (tx) => {
    const data: Record<string, unknown> = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.color !== undefined) data.color = input.color;
    if (input.position !== undefined) data.position = input.position;
    if (input.parentId !== undefined) data.parentId = input.parentId;

    const folder = await tx.folder.update({
      where: { id },
      data
    });

    await logChange(tx, 'folder', id, 'update', folder);

    return folder;
  });
}

export async function deleteFolder(id: string) {
  return prisma.$transaction(async (tx) => {
    const folder = await tx.folder.delete({ where: { id } });

    await logChange(tx, 'folder', id, 'delete', { id });

    return folder;
  });
}

export async function createPage(input: PageInput) {
  return prisma.$transaction(async (tx) => {
    const folderId = input.folderId ?? null;
    const position = input.position ?? (await resolvePagePosition(tx, folderId));

    const page = await tx.page.create({
      data: {
        folderId,
        title: input.title,
        slug: input.slug ?? undefined,
        position,
        isPinned: input.isPinned ?? false,
        isArchived: input.isArchived ?? false,
        searchText: normaliseSearchText(input.content?.text ?? input.content?.html ?? input.title)
      }
    });

    await upsertPageContent(tx, page.id, input.content);
    await logChange(tx, 'page', page.id, 'create', page);

    return tx.page.findUnique({
      where: { id: page.id },
      include: { content: true, folder: true }
    });
  });
}

export async function updatePage(id: string, input: UpdatePageInput) {
  return prisma.$transaction(async (tx) => {
    const data: Record<string, unknown> = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.position !== undefined) data.position = input.position;
    if (input.isPinned !== undefined) data.isPinned = input.isPinned;
    if (input.isArchived !== undefined) data.isArchived = input.isArchived;
    if (input.folderId !== undefined) data.folderId = input.folderId;

    if (input.content) {
      data.searchText = normaliseSearchText(
        input.content.text ?? input.content.html ?? input.title ?? ''
      );
    }

    const page = await tx.page.update({
      where: { id },
      data
    });

    if (input.content) {
      await upsertPageContent(tx, id, input.content);
    }

    await logChange(tx, 'page', id, 'update', page);

    return tx.page.findUnique({
      where: { id },
      include: { content: true, folder: true }
    });
  });
}

export async function deletePage(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.pagecontent.delete({ where: { pageId: id } }).catch(() => undefined);
    const page = await tx.page.delete({ where: { id } });

    await logChange(tx, 'page', id, 'delete', { id });

    return page;
  });
}

export async function getPage(id: string) {
  return prisma.page.findUnique({
    where: { id },
    include: {
      content: true,
      folder: {
        select: {
          id: true,
          title: true,
          parentId: true
        }
      }
    }
  });
}

export async function recordRevision(pageId: string, snapshot: unknown) {
  return prisma.pagerevision.create({
    data: {
      pageId,
      snapshot: serialiseJson(snapshot) ?? '{}'
    }
  });
}

export async function listPageRevisions(pageId: string, limit = 20) {
  return prisma.pagerevision.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export async function searchPages(query: string, limit = 20) {
  const term = `%${query.toLowerCase()}%`;

  const rows = (await prisma.$queryRawUnsafe(
    `SELECT p.id, p.title, substr(p.searchText, instr(lower(p.searchText), ?), 120) as snippet, p.folderId, f.title as folderTitle
     FROM Page p
     LEFT JOIN Folder f ON f.id = p.folderId
     WHERE lower(p.searchText) LIKE ?
     ORDER BY p.updatedAt DESC
     LIMIT ?`,
    query.toLowerCase(),
    term,
    limit
  )) as Array<{
    id: string;
    title: string;
    snippet: string | null;
    folderId: string | null;
    folderTitle: string | null;
  }>;

  return rows.map((row) => ({
    ...row,
    snippet: row.snippet ?? ''
  }));
}

export async function fetchChanges(after?: string, limit = 100) {
  return prisma.changelog.findMany({
    where: after
      ? {
          createdAt: {
            gt: after
          }
        }
      : undefined,
    orderBy: { createdAt: 'asc' },
    take: limit
  });
}

export async function upsertSyncState(clientId: string, cursor: string) {
  return prisma.syncstate.upsert({
    where: { clientId },
    create: {
      clientId,
      cursor
    },
    update: {
      cursor,
      lastSyncedAt: new Date().toISOString()
    }
  });
}

export async function getSyncState(clientId: string) {
  return prisma.syncstate.findUnique({
    where: { clientId }
  });
}

// TODO: Implement notebook/section functionality (currently unused)
// These are stub implementations to satisfy TypeScript - the routes exist but aren't registered
export async function createNotebook(_input: unknown): Promise<unknown> {
  throw new Error('Notebook functionality not implemented');
}

export async function getNotebook(_id: string): Promise<unknown | null> {
  return null;
}

export async function getNotebookTree(): Promise<unknown[]> {
  return [];
}

export async function updateNotebook(_id: string, _input: unknown): Promise<unknown | null> {
  return null;
}

export async function deleteNotebook(_id: string): Promise<void> {
  throw new Error('Notebook functionality not implemented');
}

export async function createSection(_notebookId: string, _input: unknown): Promise<unknown> {
  throw new Error('Section functionality not implemented');
}

export async function updateSection(_id: string, _input: unknown): Promise<unknown | null> {
  return null;
}

export async function deleteSection(_id: string): Promise<void> {
  throw new Error('Section functionality not implemented');
}
