/*
  Warnings:

  - A unique constraint covering the columns `[applyLink]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `job` ADD COLUMN `applyLink` VARCHAR(191) NULL,
    ADD COLUMN `experienceLevel` VARCHAR(191) NULL,
    ADD COLUMN `externalId` VARCHAR(191) NULL,
    ADD COLUMN `matchScore` DOUBLE NULL,
    ADD COLUMN `postedAt` DATETIME(3) NULL,
    ADD COLUMN `scrapedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `skills` JSON NULL,
    ADD COLUMN `source` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Job_applyLink_key` ON `Job`(`applyLink`);
