/*
  Warnings:

  - You are about to alter the column `nome` on the `sistemas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(60)`.
  - You are about to alter the column `descricao` on the `sistemas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `nome` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(60)`.
  - You are about to alter the column `email` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(40)`.
  - You are about to alter the column `senha` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(60)`.

*/
-- DropIndex
DROP INDEX `usuarios_email_key` ON `usuarios`;

-- AlterTable
ALTER TABLE `sistemas` MODIFY `nome` VARCHAR(60) NOT NULL,
    MODIFY `descricao` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `usuarios` MODIFY `nome` VARCHAR(60) NOT NULL,
    MODIFY `email` VARCHAR(40) NOT NULL,
    MODIFY `senha` VARCHAR(60) NOT NULL;

-- CreateTable
CREATE TABLE `logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `acao` VARCHAR(20) NOT NULL,
    `descricao` VARCHAR(60) NOT NULL,
    `complemento` VARCHAR(255) NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `sistemaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_sistemaId_fkey` FOREIGN KEY (`sistemaId`) REFERENCES `sistemas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
