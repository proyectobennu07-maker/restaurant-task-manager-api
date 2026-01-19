/*
  Warnings:

  - Added the required column `area` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "TaskArea" AS ENUM ('COCINA', 'BARRA', 'SALON', 'CAJA', 'ALMACEN');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "area" "TaskArea" NOT NULL,
ADD COLUMN     "estimatedTime" INTEGER,
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM';
