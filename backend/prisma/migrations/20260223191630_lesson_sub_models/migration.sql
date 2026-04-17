/*
  Warnings:

  - You are about to drop the column `article` on the `lesson` table. All the data in the column will be lost.
  - You are about to drop the column `externalUrl` on the `lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `lesson` DROP COLUMN `article`,
    DROP COLUMN `externalUrl`,
    DROP COLUMN `videoUrl`;

-- CreateTable
CREATE TABLE `VideoLesson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lessonId` INTEGER NOT NULL,
    `videoPath` VARCHAR(191) NOT NULL,
    `duration` INTEGER NULL,

    UNIQUE INDEX `VideoLesson_lessonId_key`(`lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleLesson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lessonId` INTEGER NOT NULL,
    `content` LONGTEXT NOT NULL,

    UNIQUE INDEX `ArticleLesson_lessonId_key`(`lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VideoLesson` ADD CONSTRAINT `VideoLesson_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleLesson` ADD CONSTRAINT `ArticleLesson_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
