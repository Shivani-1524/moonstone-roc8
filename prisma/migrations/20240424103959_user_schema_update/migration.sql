/*
  Warnings:

  - You are about to drop the column `updateAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `User` table. All the data in the column will be lost.
  - Added the required column `otp` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otpExpiresAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "updateAt",
DROP COLUMN "verificationCode",
ADD COLUMN     "otp" TEXT NOT NULL,
ADD COLUMN     "otpAttemptCounter" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3) NOT NULL;
