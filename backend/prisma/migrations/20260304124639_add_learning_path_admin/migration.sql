-- CreateTable
CREATE TABLE `LearningPathAdmin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `learningPathId` INTEGER NOT NULL,
    `adminId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LearningPathAdmin_learningPathId_adminId_key`(`learningPathId`, `adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LearningPathAdmin` ADD CONSTRAINT `LearningPathAdmin_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `LearningPath`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearningPathAdmin` ADD CONSTRAINT `LearningPathAdmin_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
