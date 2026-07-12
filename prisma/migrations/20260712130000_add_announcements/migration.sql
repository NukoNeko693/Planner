CREATE TYPE "AnnouncementScope" AS ENUM ('HOMEROOM', 'GRADE', 'SCHOOL');
CREATE TYPE "AnnouncementStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');
CREATE TABLE "Announcement" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "purpose" TEXT,
  "scope" "AnnouncementScope" NOT NULL, "status" "AnnouncementStatus" NOT NULL DEFAULT 'PENDING',
  "authorId" TEXT NOT NULL, "reviewerId" TEXT, "rejectionReason" TEXT,
  "classId" TEXT, "schoolDivision" "SchoolDivision", "grade" INTEGER,
  "publishedAt" TIMESTAMP(3), "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AnnouncementAttachment" (
  "id" TEXT NOT NULL, "announcementId" TEXT NOT NULL, "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL, "size" INTEGER NOT NULL, "data" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnnouncementAttachment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Announcement_status_publishedAt_idx" ON "Announcement"("status", "publishedAt");
CREATE INDEX "Announcement_authorId_createdAt_idx" ON "Announcement"("authorId", "createdAt");
CREATE INDEX "Announcement_classId_status_idx" ON "Announcement"("classId", "status");
CREATE INDEX "Announcement_schoolDivision_grade_status_idx" ON "Announcement"("schoolDivision", "grade", "status");
CREATE INDEX "AnnouncementAttachment_announcementId_idx" ON "AnnouncementAttachment"("announcementId");
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnnouncementAttachment" ADD CONSTRAINT "AnnouncementAttachment_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
