import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const accountGroups = [
  {
    baseName: "Ryosuke",
    passwordHash:
      "9bcf3cb23bd6ab44b399d7d3c79b6676:a974f2e41d8e097554a7def6b55baeb41a1b4170efbaf3527bc1e6d1aef5e4a2e4d3ed9ee3a4c9fe3406950fdb2b9fe70e0734f43b16766286276c1f10c322fc",
  },
  {
    baseName: "Teu",
    passwordHash:
      "ec5193be0396bc0ebcc65202d3dba127:ee7dd1cf2ef4e782c2789a289e5fec3b247fa1d347ab948f1c6b72db26dc65908a03df937594ba5f98ca2f83e906fd978e18d08f05098ba10117e6bc88b5fc8f",
  },
  {
    baseName: "Soma",
    passwordHash:
      "63131f013611af076e48636215db2798:2f69c56d23f2657307eb78832fc44611ec7c081655f824a0a3143566193f067866151e2b3342ad81d92456f56b232d186a78f06e7fa206060b6055d7497908b4",
  },
] as const;

const users = accountGroups.flatMap(({ baseName, passwordHash }) => [
  {
    username: baseName,
    name: baseName,
    passwordHash,
    role: "STUDENT" as const,
    classCode: baseName === "Soma" ? "1-B" : "1-A",
  },
  {
    username: `${baseName}T`,
    name: `${baseName}（教師）`,
    passwordHash,
    role: "TEACHER" as const,
    classCode: baseName === "Soma" ? "1-B" : "1-A",
  },
  {
    username: `${baseName}O`,
    name: `${baseName}（管理者）`,
    passwordHash,
    role: "ADMIN" as const,
    classCode: baseName === "Soma" ? "1-B" : "1-A",
  },
]);

async function main() {
  const classes = await Promise.all(
    [
      { code: "1-A", name: "1年A組" },
      { code: "1-B", name: "1年B組" },
    ].map((schoolClass) =>
      prisma.schoolClass.upsert({
        where: { code: schoolClass.code },
        update: { name: schoolClass.name },
        create: schoolClass,
      }),
    ),
  );
  const classIds = new Map(
    classes.map((schoolClass) => [schoolClass.code, schoolClass.id]),
  );

  for (const user of users) {
    const classId = classIds.get(user.classCode);
    if (!classId) throw new Error(`Class not found: ${user.classCode}`);
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
        status: "ACTIVE",
        role: user.role,
        classId,
      },
      create: {
        username: user.username,
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        classId,
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
