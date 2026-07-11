CREATE TABLE "WeeklyPlanItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planDate" DATE NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WeeklyPlanItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WeeklyNote" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "weekStart" DATE NOT NULL,
  "goal" TEXT NOT NULL DEFAULT '',
  "memo" TEXT NOT NULL DEFAULT '',
  "reflection" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WeeklyNote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WeeklyPlanItem_userId_planDate_startTime_idx" ON "WeeklyPlanItem"("userId", "planDate", "startTime");
CREATE UNIQUE INDEX "WeeklyNote_userId_weekStart_key" ON "WeeklyNote"("userId", "weekStart");
ALTER TABLE "WeeklyPlanItem" ADD CONSTRAINT "WeeklyPlanItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeeklyNote" ADD CONSTRAINT "WeeklyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
