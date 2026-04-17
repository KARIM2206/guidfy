-- CreateTable
CREATE TABLE `UserStepProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `stepId` INTEGER NOT NULL,
    `progressPercentage` INTEGER NOT NULL DEFAULT 0,
    `completed` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `UserStepProgress_userId_stepId_key`(`userId`, `stepId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserStepProgress` ADD CONSTRAINT `UserStepProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserStepProgress` ADD CONSTRAINT `UserStepProgress_stepId_fkey` FOREIGN KEY (`stepId`) REFERENCES `Step`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
