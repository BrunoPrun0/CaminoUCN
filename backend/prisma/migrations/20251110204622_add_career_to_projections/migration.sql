/*
  Warnings:

  - A unique constraint covering the columns `[studentId,careerCode,name]` on the table `projections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `careerCode` to the `projections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogCode` to the `projections` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "projections_studentId_name_key";

-- AlterTable
ALTER TABLE "projections" ADD COLUMN     "careerCode" TEXT NOT NULL,
ADD COLUMN     "catalogCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "projections_studentId_careerCode_idx" ON "projections"("studentId", "careerCode");

-- CreateIndex
CREATE UNIQUE INDEX "projections_studentId_careerCode_name_key" ON "projections"("studentId", "careerCode", "name");
