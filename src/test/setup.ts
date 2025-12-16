import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeEach } from 'vitest';

import { prisma } from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const globalState = globalThis as typeof globalThis & { __DEVNOTE_MIGRATED__?: boolean };

if (!globalState.__DEVNOTE_MIGRATED__) {
  try {
    execSync('npx prisma migrate deploy', {
      cwd: projectRoot,
      stdio: 'ignore'
    });
    globalState.__DEVNOTE_MIGRATED__ = true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to apply Prisma migrations for tests', error);
    throw error;
  }
}

beforeEach(async () => {
  await prisma.pagerevision.deleteMany();
  await prisma.pagecontent.deleteMany();
  await prisma.page.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.syncstate.deleteMany();
  await prisma.changelog.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
