/*
  Warnings:

  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `byuNetId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "byuNetId" SET NOT NULL,
ALTER COLUMN "fullName" SET NOT NULL;
