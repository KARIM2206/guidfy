/*
  Warnings:

  - You are about to drop the `_learningpathroadmaps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_userlearningpaths` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_userroadmaps` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roadmapId,order]` on the table `Step` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `_learningpathroadmaps` DROP FOREIGN KEY `_LearningPathRoadmaps_A_fkey`;

-- DropForeignKey
ALTER TABLE `_learningpathroadmaps` DROP FOREIGN KEY `_LearningPathRoadmaps_B_fkey`;

-- DropForeignKey
ALTER TABLE `_userlearningpaths` DROP FOREIGN KEY `_UserLearningPaths_A_fkey`;

-- DropForeignKey
ALTER TABLE `_userlearningpaths` DROP FOREIGN KEY `_UserLearningPaths_B_fkey`;

-- DropForeignKey
ALTER TABLE `_userroadmaps` DROP FOREIGN KEY `_UserRoadmaps_A_fkey`;

-- DropForeignKey
ALTER TABLE `_userroadmaps` DROP FOREIGN KEY `_UserRoadmaps_B_fkey`;

-- AlterTable
ALTER TABLE `learningpath` ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `roadmap` ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `_learningpathroadmaps`;

-- DropTable
DROP TABLE `_userlearningpaths`;

-- DropTable
DROP TABLE `_userroadmaps`;

-- CreateTable
CREATE TABLE `LearningPathRoadmap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `learningPathId` INTEGER NOT NULL,
    `roadmapId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,

    UNIQUE INDEX `LearningPathRoadmap_learningPathId_roadmapId_key`(`learningPathId`, `roadmapId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRoadmap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `roadmapId` INTEGER NOT NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserRoadmap_userId_roadmapId_key`(`userId`, `roadmapId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserLearningPath` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `learningPathId` INTEGER NOT NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserLearningPath_userId_learningPathId_key`(`userId`, `learningPathId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRoadmapProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `roadmapId` INTEGER NOT NULL,
    `progressPercentage` INTEGER NOT NULL DEFAULT 0,
    `completed` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `UserRoadmapProgress_userId_roadmapId_key`(`userId`, `roadmapId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Step_roadmapId_order_key` ON `Step`(`roadmapId`, `order`);

-- AddForeignKey
ALTER TABLE `LearningPathRoadmap` ADD CONSTRAINT `LearningPathRoadmap_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `LearningPath`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearningPathRoadmap` ADD CONSTRAINT `LearningPathRoadmap_roadmapId_fkey` FOREIGN KEY (`roadmapId`) REFERENCES `Roadmap`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLessonProgress` ADD CONSTRAINT `UserLessonProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLessonProgress` ADD CONSTRAINT `UserLessonProgress_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoadmap` ADD CONSTRAINT `UserRoadmap_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoadmap` ADD CONSTRAINT `UserRoadmap_roadmapId_fkey` FOREIGN KEY (`roadmapId`) REFERENCES `Roadmap`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLearningPath` ADD CONSTRAINT `UserLearningPath_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLearningPath` ADD CONSTRAINT `UserLearningPath_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `LearningPath`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoadmapProgress` ADD CONSTRAINT `UserRoadmapProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoadmapProgress` ADD CONSTRAINT `UserRoadmapProgress_roadmapId_fkey` FOREIGN KEY (`roadmapId`) REFERENCES `Roadmap`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
