-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('STUDENT', 'SUPER_ADMIN', 'ADMIN') NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE `LearningPath` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `jobs` INTEGER NOT NULL,
    `projects` INTEGER NOT NULL,
    `estimatedDuration` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserLearningPaths` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UserLearningPaths_AB_unique`(`A`, `B`),
    INDEX `_UserLearningPaths_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_LearningPathRoadmaps` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_LearningPathRoadmaps_AB_unique`(`A`, `B`),
    INDEX `_LearningPathRoadmaps_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LearningPath` ADD CONSTRAINT `LearningPath_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserLearningPaths` ADD CONSTRAINT `_UserLearningPaths_A_fkey` FOREIGN KEY (`A`) REFERENCES `LearningPath`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserLearningPaths` ADD CONSTRAINT `_UserLearningPaths_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LearningPathRoadmaps` ADD CONSTRAINT `_LearningPathRoadmaps_A_fkey` FOREIGN KEY (`A`) REFERENCES `LearningPath`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LearningPathRoadmaps` ADD CONSTRAINT `_LearningPathRoadmaps_B_fkey` FOREIGN KEY (`B`) REFERENCES `Roadmap`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
