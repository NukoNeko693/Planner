import { prisma } from "@/lib/prisma";

export type AnnouncementAudience = {
  classId: string | null;
  grades: { schoolDivision: "MIDDLE" | "HIGH"; grade: number }[];
  isAdmin?: boolean;
};

const summarySelect = {
  id: true,
  title: true,
  body: true,
  purpose: true,
  scope: true,
  status: true,
  rejectionReason: true,
  classId: true,
  schoolDivision: true,
  grade: true,
  publishedAt: true,
  reviewedAt: true,
  createdAt: true,
  author: { select: { id: true, name: true, role: true } },
  reviewer: { select: { name: true } },
  attachments: {
    select: { id: true, fileName: true, mimeType: true, size: true },
  },
} as const;

export function listAnnouncements(
  userId: string,
  audience: AnnouncementAudience,
) {
  return prisma.announcement.findMany({
    where: {
      OR: [
        { authorId: userId },
        ...(audience.isAdmin ? [{ status: "PUBLISHED" as const }] : []),
        { status: "PUBLISHED", scope: "SCHOOL" },
        ...(audience.classId
          ? [
              {
                status: "PUBLISHED" as const,
                scope: "HOMEROOM" as const,
                classId: audience.classId,
              },
            ]
          : []),
        ...audience.grades.map((item) => ({
          status: "PUBLISHED" as const,
          scope: "GRADE" as const,
          ...item,
        })),
      ],
    },
    select: summarySelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export function listPendingAnnouncements() {
  return prisma.announcement.findMany({
    where: { status: "PENDING", author: { role: "STUDENT" } },
    select: summarySelect,
    orderBy: { createdAt: "asc" },
  });
}

export async function createAnnouncement(input: {
  title: string;
  body: string;
  purpose: string | null;
  scope: "HOMEROOM" | "GRADE" | "SCHOOL";
  authorId: string;
  directPublish: boolean;
  classId: string | null;
  schoolDivision: "MIDDLE" | "HIGH" | null;
  grade: number | null;
  files: {
    fileName: string;
    mimeType: string;
    size: number;
    data: Uint8Array;
  }[];
}) {
  return prisma.announcement.create({
    data: {
      title: input.title,
      body: input.body,
      purpose: input.purpose,
      scope: input.scope,
      authorId: input.authorId,
      status: input.directPublish ? "PUBLISHED" : "PENDING",
      publishedAt: input.directPublish ? new Date() : null,
      classId: input.classId,
      schoolDivision: input.schoolDivision,
      grade: input.grade,
      attachments: {
        create: input.files.map((file) => ({
          ...file,
          data: Buffer.from(file.data),
        })),
      },
    },
  });
}

export async function reviewAnnouncement(input: {
  id: string;
  reviewerId: string;
  approve: boolean;
  reason: string | null;
}) {
  return prisma.announcement.updateMany({
    where: { id: input.id, status: "PENDING", author: { role: "STUDENT" } },
    data: {
      status: input.approve ? "PUBLISHED" : "REJECTED",
      reviewerId: input.reviewerId,
      reviewedAt: new Date(),
      publishedAt: input.approve ? new Date() : null,
      rejectionReason: input.approve ? null : input.reason,
    },
  });
}

export function findAttachment(id: string) {
  return prisma.announcementAttachment.findUnique({
    where: { id },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      data: true,
      announcement: {
        select: {
          authorId: true,
          status: true,
          scope: true,
          classId: true,
          schoolDivision: true,
          grade: true,
        },
      },
    },
  });
}
