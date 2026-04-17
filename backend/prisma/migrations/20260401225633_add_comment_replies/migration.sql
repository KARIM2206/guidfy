-- AlterTable
ALTER TABLE `postcomment` ADD COLUMN `parentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PostComment` ADD CONSTRAINT `PostComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `PostComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
