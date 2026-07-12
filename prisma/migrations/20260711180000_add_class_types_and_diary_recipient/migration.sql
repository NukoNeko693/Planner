CREATE TYPE "ClassType" AS ENUM ('HOMEROOM', 'ELECTIVE');
ALTER TABLE "SchoolClass" ADD COLUMN "type" "ClassType" NOT NULL DEFAULT 'HOMEROOM';
CREATE TABLE "ClassMembership" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClassMembership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClassMembership_userId_classId_key" ON "ClassMembership"("userId", "classId");
CREATE INDEX "ClassMembership_classId_userId_idx" ON "ClassMembership"("classId", "userId");
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyDiary" ADD COLUMN "recipientTeacherId" TEXT;
CREATE INDEX "DailyDiary_recipientTeacherId_submittedAt_idx" ON "DailyDiary"("recipientTeacherId", "submittedAt");
ALTER TABLE "DailyDiary" ADD CONSTRAINT "DailyDiary_recipientTeacherId_fkey" FOREIGN KEY ("recipientTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
