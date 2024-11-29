/*
  Warnings:

  - You are about to drop the column `bloqueadoAte` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `tentativasInvalidas` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `bloqueadoAte`,
    DROP COLUMN `tentativasInvalidas`,
    ADD COLUMN `ultimoAcesso` DATETIME(3) NULL;
