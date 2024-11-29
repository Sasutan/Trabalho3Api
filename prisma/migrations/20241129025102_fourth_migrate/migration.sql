-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `bloqueadoAte` DATETIME(3) NULL,
    ADD COLUMN `tentativasInvalidas` INTEGER NOT NULL DEFAULT 0;
