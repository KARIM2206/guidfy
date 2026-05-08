-- DropIndex
DROP INDEX `Job_applyLink_key` ON `job`;

-- AlterTable
ALTER TABLE `job` MODIFY `applyLink` TEXT NULL;
