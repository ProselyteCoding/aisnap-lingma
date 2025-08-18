/*
  Warnings:

  - You are about to drop the `conversion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `conversion` DROP FOREIGN KEY `Conversion_userId_fkey`;

-- DropTable
DROP TABLE `conversion`;

-- CreateTable
CREATE TABLE `History` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `inputType` VARCHAR(191) NOT NULL,
    `outputType` VARCHAR(191) NOT NULL,
    `input` VARCHAR(191) NULL,
    `output` VARCHAR(191) NULL,
    `inputFile` VARCHAR(191) NULL,
    `outputFile` VARCHAR(191) NULL,
    `template` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `History` ADD CONSTRAINT `History_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
