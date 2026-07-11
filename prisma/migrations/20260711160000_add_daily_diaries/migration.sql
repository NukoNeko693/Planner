CREATE TABLE "DailyDiary" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "diaryDate" DATE NOT NULL,
  "content" TEXT NOT NULL DEFAULT '',
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyDiary_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DailyDiary_userId_diaryDate_key" ON "DailyDiary"("userId", "diaryDate");
CREATE INDEX "DailyDiary_submittedAt_diaryDate_idx" ON "DailyDiary"("submittedAt", "diaryDate");
ALTER TABLE "DailyDiary" ADD CONSTRAINT "DailyDiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
