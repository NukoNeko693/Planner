CREATE TABLE "SchoolClass" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SchoolClass_code_key" ON "SchoolClass"("code");
ALTER TABLE "User" ADD COLUMN "classId" TEXT;
ALTER TABLE "Event" ADD COLUMN "classId" TEXT;
CREATE INDEX "User_classId_status_idx" ON "User"("classId", "status");
CREATE INDEX "Event_classId_eventDate_deletedAt_idx" ON "Event"("classId", "eventDate", "deletedAt");
ALTER TABLE "User" ADD CONSTRAINT "User_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Existing prototype class events may not have a classId. NOT VALID keeps those rows
-- while enforcing the invariant for all newly inserted or updated events.
ALTER TABLE "Event" ADD CONSTRAINT "Event_scope_class_check" CHECK (("scope" = 'CLASS' AND "classId" IS NOT NULL) OR ("scope" <> 'CLASS' AND "classId" IS NULL)) NOT VALID;
