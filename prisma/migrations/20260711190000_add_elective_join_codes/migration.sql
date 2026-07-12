ALTER TABLE "SchoolClass"
ADD COLUMN "joinCode" TEXT,
ADD COLUMN "ownerId" TEXT;

CREATE UNIQUE INDEX "SchoolClass_joinCode_key" ON "SchoolClass"("joinCode");
CREATE INDEX "SchoolClass_ownerId_type_idx" ON "SchoolClass"("ownerId", "type");

ALTER TABLE "SchoolClass"
ADD CONSTRAINT "SchoolClass_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
