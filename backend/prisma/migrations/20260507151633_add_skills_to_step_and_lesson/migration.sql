/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `lesson` ADD COLUMN `skills` JSON NULL;

-- AlterTable
ALTER TABLE `step` ADD COLUMN `skills` JSON NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Job_externalId_key` ON `Job`(`externalId`);
