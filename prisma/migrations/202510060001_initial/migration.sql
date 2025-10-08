-- CreateTable
CREATE TABLE "Folder" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"parentId" TEXT,
	"title" TEXT NOT NULL,
	"description" TEXT,
	"color" TEXT,
	"position" INTEGER NOT NULL DEFAULT 0,
	"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Page" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"folderId" TEXT,
	"title" TEXT NOT NULL,
	"slug" TEXT,
	"position" INTEGER NOT NULL DEFAULT 0,
	"searchText" TEXT NOT NULL DEFAULT '',
	"isPinned" INTEGER NOT NULL DEFAULT 0,
	"isArchived" INTEGER NOT NULL DEFAULT 0,
	"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "Page_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "PageContent" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"pageId" TEXT NOT NULL,
	"html" TEXT NOT NULL DEFAULT '',
	"json" TEXT,
	"text" TEXT NOT NULL DEFAULT '',
	"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "PageContent_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PageRevision" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"pageId" TEXT NOT NULL,
	"snapshot" TEXT NOT NULL,
	"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "PageRevision_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "SyncState" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"clientId" TEXT NOT NULL,
	"cursor" TEXT NOT NULL,
	"lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ChangeLog" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"entityType" TEXT NOT NULL,
	"entityId" TEXT NOT NULL,
	"action" TEXT NOT NULL,
	"payload" TEXT NOT NULL,
	"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

CREATE INDEX "Folder_parentId_position_idx" ON "Folder"("parentId", "position");

CREATE INDEX "Page_folderId_position_idx" ON "Page"("folderId", "position");

CREATE INDEX "Page_searchText_idx" ON "Page"("searchText");

CREATE UNIQUE INDEX "PageContent_pageId_key" ON "PageContent"("pageId");

CREATE INDEX "PageRevision_pageId_createdAt_idx" ON "PageRevision"("pageId", "createdAt");

CREATE UNIQUE INDEX "SyncState_cursor_key" ON "SyncState"("cursor");

CREATE UNIQUE INDEX "SyncState_clientId_key" ON "SyncState"("clientId");

CREATE INDEX "ChangeLog_entityType_entityId_idx" ON "ChangeLog"("entityType", "entityId");

CREATE INDEX "ChangeLog_createdAt_idx" ON "ChangeLog"("createdAt");
