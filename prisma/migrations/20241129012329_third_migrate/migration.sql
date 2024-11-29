/*
  Warnings:

  - You are about to drop the column `sistemaId` on the `logs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `logs_sistemaId_fkey`;

-- AlterTable
ALTER TABLE `logs` DROP COLUMN `sistemaId`;
