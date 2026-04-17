/*
  Warnings:

  - You are about to alter the column `type` on the `notification` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `metadata` JSON NULL,
    MODIFY `message` TEXT NOT NULL,
    MODIFY `type` VARCHAR(191) NOT NULL DEFAULT 'info';

-- CreateIndex
CREATE INDEX `Notification_read_idx` ON `Notification`(`read`);

-- CreateIndex
CREATE INDEX `Notification_createdAt_idx` ON `Notification`(`createdAt`);

-- RenameIndex
ALTER TABLE `notification` RENAME INDEX `Notification_userId_fkey` TO `Notification_userId_idx`;
