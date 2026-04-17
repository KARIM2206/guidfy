/*
  Warnings:

  - You are about to drop the column `videoPath` on the `videolesson` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stepId,order]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lessonId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `videoUrl` to the `VideoLesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `articlelesson` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `title` VARCHAR(191) NOT NULL DEFAULT 'New Article';

-- AlterTable
ALTER TABLE `question` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `quiz` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `passingScore` INTEGER NULL,
    ADD COLUMN `timeLimit` INTEGER NULL;

-- AlterTable
ALTER TABLE `videolesson` DROP COLUMN `videoPath`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `provider` VARCHAR(191) NULL,
    ADD COLUMN `thumbnail` VARCHAR(191) NULL,
    ADD COLUMN `videoUrl` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `QuizAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `quizId` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `QuizAttempt_userId_quizId_idx`(`userId`, `quizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Lesson_stepId_order_key` ON `Lesson`(`stepId`, `order`);

-- CreateIndex
CREATE UNIQUE INDEX `Quiz_lessonId_key` ON `Quiz`(`lessonId`);

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `QuizAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `QuizAttempt_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
