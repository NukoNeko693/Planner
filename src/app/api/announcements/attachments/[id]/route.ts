import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findAttachment } from "@/server/repositories/announcement-repository";
import { findActiveUserContext } from "@/server/repositories/user-repository";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const [user, attachment] = await Promise.all([
    findActiveUserContext(session.user.id),
    findAttachment((await params).id),
  ]);
  if (!user || !attachment)
    return new NextResponse("Not found", { status: 404 });
  const item = attachment.announcement;
  const staffReview =
    (user.role === "TEACHER" || user.role === "ADMIN") &&
    item.status === "PENDING";
  const own = item.authorId === user.id;
  const belongsToGrade =
    (user.schoolClass?.schoolDivision === item.schoolDivision &&
      user.schoolClass.grade === item.grade) ||
    user.gradeTeamMemberships.some(
      (grade) =>
        grade.schoolDivision === item.schoolDivision &&
        grade.grade === item.grade,
    );
  const visiblePublished =
    item.status === "PUBLISHED" &&
    (user.role === "ADMIN" ||
      item.scope === "SCHOOL" ||
      (item.scope === "HOMEROOM" && item.classId === user.classId) ||
      (item.scope === "GRADE" && belongsToGrade));
  if (!staffReview && !own && !visiblePublished)
    return new NextResponse("Forbidden", { status: 403 });
  return new NextResponse(Buffer.from(attachment.data), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
