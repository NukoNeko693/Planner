CREATE TYPE "SchoolDivision" AS ENUM ('MIDDLE', 'HIGH');

ALTER TABLE "SchoolClass"
ADD COLUMN "schoolDivision" "SchoolDivision",
ADD COLUMN "grade" INTEGER,
ADD COLUMN "classLabel" TEXT;

CREATE INDEX "SchoolClass_schoolDivision_grade_type_idx"
ON "SchoolClass"("schoolDivision", "grade", "type");

CREATE UNIQUE INDEX "SchoolClass_schoolDivision_grade_classLabel_key"
ON "SchoolClass"("schoolDivision", "grade", "classLabel");

CREATE TABLE "GradeTeamMembership" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "schoolDivision" "SchoolDivision" NOT NULL,
  "grade" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GradeTeamMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GradeTeamMembership_userId_schoolDivision_grade_key"
ON "GradeTeamMembership"("userId", "schoolDivision", "grade");
CREATE INDEX "GradeTeamMembership_schoolDivision_grade_idx"
ON "GradeTeamMembership"("schoolDivision", "grade");
ALTER TABLE "GradeTeamMembership" ADD CONSTRAINT "GradeTeamMembership_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
