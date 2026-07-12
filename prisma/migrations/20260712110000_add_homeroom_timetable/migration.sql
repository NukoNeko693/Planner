CREATE TABLE "TimetableEntry" (
  "id" TEXT NOT NULL, "classId" TEXT NOT NULL, "weekday" INTEGER NOT NULL,
  "period" INTEGER NOT NULL, "subject" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TimetableEntry_classId_weekday_period_key" ON "TimetableEntry"("classId", "weekday", "period");
CREATE INDEX "TimetableEntry_classId_weekday_period_idx" ON "TimetableEntry"("classId", "weekday", "period");
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
