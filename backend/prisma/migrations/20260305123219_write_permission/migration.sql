-- CreateTable
CREATE TABLE `LearningPathPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `learningPathId` INTEGER NOT NULL,
    `section` ENUM('PROJECT', 'JOB', 'ROADMAP') NOT NULL,

    UNIQUE INDEX `LearningPathPermission_userId_learningPathId_section_key`(`userId`, `learningPathId`, `section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LearningPathPermission` ADD CONSTRAINT `LearningPathPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearningPathPermission` ADD CONSTRAINT `LearningPathPermission_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `LearningPath`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
