/*
  Warnings:

  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `type` ENUM('LIKE', 'ANSWER', 'FOLLOW', 'SYSTEM') NOT NULL;
