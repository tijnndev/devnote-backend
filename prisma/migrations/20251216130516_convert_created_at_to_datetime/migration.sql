-- CreateTable
CREATE TABLE `folder` (
    `id` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NULL,
    `color` TEXT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `folder_parentId_fkey`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page` (
    `id` VARCHAR(191) NOT NULL,
    `folderId` VARCHAR(191) NULL,
    `title` TEXT NOT NULL,
    `slug` TEXT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `searchText` TEXT NOT NULL DEFAULT '',
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `page_folderId_fkey`(`folderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagecontent` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `html` LONGTEXT NULL,
    `json` LONGTEXT NULL,
    `text` LONGTEXT NULL,
    `canvasJson` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pagecontent_pageId_key`(`pageId`),
    INDEX `pagecontent_pageId_fkey`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagerevision` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `snapshot` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pagerevision_pageId_fkey`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `syncstate` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(255) NOT NULL,
    `cursor` TEXT NOT NULL,
    `lastSyncedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `syncstate_clientId_key`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `changelog` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` TEXT NOT NULL,
    `entityId` TEXT NOT NULL,
    `action` TEXT NOT NULL,
    `payload` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `folder` ADD CONSTRAINT `folder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `folder`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `folder`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pagecontent` ADD CONSTRAINT `pagecontent_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `page`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pagerevision` ADD CONSTRAINT `pagerevision_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `page`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
