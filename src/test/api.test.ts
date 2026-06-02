import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

function buildApp() {
  return createApp();
}

describe('DevNote API', () => {
  it('creates a folder tree and finds a page via search', async () => {
    const app = buildApp();

    const rootFolderResponse = await request(app)
      .post('/api/folders')
      .send({ title: 'Work', description: 'Work-related notes' })
      .expect(201);

    const rootFolderId: string = rootFolderResponse.body.folder.id;

    const childFolderResponse = await request(app)
      .post('/api/folders')
      .send({ title: 'Ideas', parentId: rootFolderId })
      .expect(201);

    const childFolderId: string = childFolderResponse.body.folder.id;

    const pageResponse = await request(app)
      .post('/api/pages')
      .send({
        title: 'Initial Concepts',
        folderId: childFolderId,
        content: {
          text: 'Sketching the first version of DevNote with offline sync and rich text editing.'
        }
      })
      .expect(201);

    const pageId: string = pageResponse.body.page.id;

    const rootPageResponse = await request(app)
      .post('/api/pages')
      .send({
        title: 'Roadmap',
        content: { text: 'High-level milestones for DevNote.' }
      })
      .expect(201);

    expect(rootPageResponse.body.page.folderId).toBeNull();

    const treeResponse = await request(app).get('/api/workspace/tree').expect(200);
    expect(Array.isArray(treeResponse.body.tree.folders)).toBe(true);
    expect(treeResponse.body.tree.folders).toHaveLength(1);
    expect(treeResponse.body.tree.folders[0].children).toHaveLength(1);
    expect(treeResponse.body.tree.folders[0].children[0].pages).toHaveLength(1);
    expect(treeResponse.body.tree.pages).toHaveLength(1);

    const searchResponse = await request(app).get('/api/search').query({ query: 'offline' }).expect(200);

    expect(searchResponse.body.results).toHaveLength(1);
    expect(searchResponse.body.results[0].id).toBe(pageId);
    expect(searchResponse.body.results[0].folderId).toBe(childFolderId);
  });

  it('updates page content, moves folders, and records revisions', async () => {
    const app = buildApp();

    const parentFolder = await prisma.folder.create({
      data: {
        title: 'Personal'
      }
    });

    const nestedFolder = await prisma.folder.create({
      data: {
        title: 'Daily Logs',
        parentId: parentFolder.id
      }
    });

    const createPageRes = await request(app)
      .post('/api/pages')
      .send({ title: 'Day 1', folderId: nestedFolder.id, content: { text: 'Initial log' } })
      .expect(201);

    const pageId: string = createPageRes.body.page.id;

    await request(app)
      .patch(`/api/pages/${pageId}`)
      .send({
        title: 'Day 1 - Updated',
        content: { text: 'Updated log entry with more detail.' },
        isPinned: true,
        folderId: parentFolder.id
      })
      .expect(200);

    await request(app)
      .post(`/api/pages/${pageId}/revisions`)
      .send({ snapshot: { title: 'Day 1', content: 'Updated log entry with more detail.' } })
      .expect(201);

    const revisionRes = await request(app).get(`/api/pages/${pageId}/revisions`).expect(200);
    expect(revisionRes.body.revisions).toHaveLength(1);

    const updatedPage = await request(app).get(`/api/pages/${pageId}`).expect(200);
    expect(updatedPage.body.page.folder.id).toBe(parentFolder.id);
  });

  it('returns sync changes and stores checkpoints', async () => {
    const app = buildApp();

    const folder = await request(app).post('/api/folders').send({ title: 'Sync Test' }).expect(201);
    const folderId: string = folder.body.folder.id;

    await request(app)
      .post('/api/pages')
      .send({ title: 'Welcome', folderId, content: { text: 'Hello sync clients.' } })
      .expect(201);

    const changesRes = await request(app).get('/api/sync/changes').expect(200);
    expect(changesRes.body.changes.length).toBeGreaterThan(0);
    const cursor: string = changesRes.body.cursor;

    await request(app).post('/api/sync/checkpoint').send({ clientId: 'web-client', cursor }).expect(201);

    const stateRes = await request(app).get('/api/sync/state/web-client').expect(200);
    expect(stateRes.body.state.cursor).toBe(cursor);
  });

  it('returns task-list todos grouped by page', async () => {
    const app = buildApp();

    const pageRes = await request(app)
      .post('/api/pages')
      .send({
        title: 'Todo Page',
        content: {
          text: 'Buy milk Ship release',
          json: {
            type: 'doc',
            content: [
              {
                type: 'taskList',
                content: [
                  {
                    type: 'taskItem',
                    attrs: { checked: false },
                    content: [{ type: 'text', text: 'Buy milk' }]
                  },
                  {
                    type: 'taskItem',
                    attrs: { checked: true },
                    content: [{ type: 'text', text: 'Ship release' }]
                  }
                ]
              }
            ]
          }
        }
      })
      .expect(201);

    const todosRes = await request(app).get('/api/todos').expect(200);
    expect(Array.isArray(todosRes.body.todos)).toBe(true);

    const pageTodos = todosRes.body.todos.find((item: { pageId: string }) => item.pageId === pageRes.body.page.id);
    expect(pageTodos).toBeDefined();
    expect(pageTodos.todos).toHaveLength(2);
    expect(pageTodos.todos[0].text).toBe('Buy milk');
    expect(pageTodos.todos[0].checked).toBe(false);
  });
});
