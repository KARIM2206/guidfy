-- CreateTable
CREATE TABLE `LearningPathRecommendation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `experience` VARCHAR(191) NOT NULL,
    `skills` JSON NOT NULL,
    `interest` VARCHAR(191) NOT NULL,
    `hoursPerDay` INTEGER NOT NULL,
    `targetGoal` VARCHAR(191) NULL,
    `recommendedPath` VARCHAR(191) NOT NULL,
    `confidence` DOUBLE NULL,
    `topPaths` JSON NULL,
    `userId` INTEGER NOT NULL,
    `learningPathId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LearningPathRecommendation_userId_idx`(`userId`),
    INDEX `LearningPathRecommendation_learningPathId_idx`(`learningPathId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LearningPathRecommendation` ADD CONSTRAINT `LearningPathRecommendation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearningPathRecommendation` ADD CONSTRAINT `LearningPathRecommendation_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `LearningPath`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
