-- AlterTable
ALTER TABLE "drivers" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "drivers" ALTER COLUMN "cnh" DROP NOT NULL;
ALTER TABLE "drivers" ALTER COLUMN "cnhCategory" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT IF EXISTS "drivers_userId_fkey";

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
