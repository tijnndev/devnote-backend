/*
  Warnings:

  - You are about to alter the column `isArchived` on the `Page` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isPinned` on the `Page` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Folder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Folder" ("color", "createdAt", "description", "id", "parentId", "position", "title", "updatedAt") SELECT "color", "createdAt", "description", "id", "parentId", "position", "title", "updatedAt" FROM "Folder";
DROP TABLE "Folder";
ALTER TABLE "new_Folder" RENAME TO "Folder";
CREATE INDEX "Folder_parentId_position_idx" ON "Folder"("parentId", "position");
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "folderId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "searchText" TEXT NOT NULL DEFAULT '',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Page_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Page" ("createdAt", "folderId", "id", "isArchived", "isPinned", "position", "searchText", "slug", "title", "updatedAt") SELECT "createdAt", "folderId", "id", "isArchived", "isPinned", "position", "searchText", "slug", "title", "updatedAt" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
CREATE INDEX "Page_folderId_position_idx" ON "Page"("folderId", "position");
CREATE INDEX "Page_searchText_idx" ON "Page"("searchText");
CREATE TABLE "new_PageContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "html" TEXT NOT NULL DEFAULT '',
    "json" TEXT,
    "text" TEXT NOT NULL DEFAULT '',
    "canvasJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PageContent_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PageContent" ("canvasJson", "createdAt", "html", "id", "json", "pageId", "text", "updatedAt") SELECT "canvasJson", "createdAt", "html", "id", "json", "pageId", "text", "updatedAt" FROM "PageContent";
DROP TABLE "PageContent";
ALTER TABLE "new_PageContent" RENAME TO "PageContent";
CREATE UNIQUE INDEX "PageContent_pageId_key" ON "PageContent"("pageId");
CREATE TABLE "new_SyncState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "cursor" TEXT NOT NULL,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SyncState" ("clientId", "createdAt", "cursor", "id", "lastSyncedAt", "updatedAt") SELECT "clientId", "createdAt", "cursor", "id", "lastSyncedAt", "updatedAt" FROM "SyncState";
DROP TABLE "SyncState";
ALTER TABLE "new_SyncState" RENAME TO "SyncState";
CREATE UNIQUE INDEX "SyncState_cursor_key" ON "SyncState"("cursor");
CREATE UNIQUE INDEX "SyncState_clientId_key" ON "SyncState"("clientId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
