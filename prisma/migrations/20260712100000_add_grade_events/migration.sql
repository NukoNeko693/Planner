ALTER TABLE "Event"
ADD COLUMN "schoolDivision" "SchoolDivision",
ADD COLUMN "grade" INTEGER;

CREATE INDEX "Event_schoolDivision_grade_eventDate_deletedAt_idx"
ON "Event"("schoolDivision", "grade", "eventDate", "deletedAt");
