import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const users = [
  {
    username: "Ryosuke",
    name: "Ryosuke",
    passwordHash:
      "9bcf3cb23bd6ab44b399d7d3c79b6676:a974f2e41d8e097554a7def6b55baeb41a1b4170efbaf3527bc1e6d1aef5e4a2e4d3ed9ee3a4c9fe3406950fdb2b9fe70e0734f43b16766286276c1f10c322fc",
  },
  {
    username: "Teu",
    name: "Teu",
    passwordHash:
      "ec5193be0396bc0ebcc65202d3dba127:ee7dd1cf2ef4e782c2789a289e5fec3b247fa1d347ab948f1c6b72db26dc65908a03df937594ba5f98ca2f83e906fd978e18d08f05098ba10117e6bc88b5fc8f",
  },
  {
    username: "Soma",
    name: "Soma",
    passwordHash:
      "63131f013611af076e48636215db2798:2f69c56d23f2657307eb78832fc44611ec7c081655f824a0a3143566193f067866151e2b3342ad81d92456f56b232d186a78f06e7fa206060b6055d7497908b4",
  },
] as const;

for (const user of users) {
  await prisma.user.upsert({
    where: { username: user.username },
    update: {
      name: user.name,
      passwordHash: user.passwordHash,
      status: "ACTIVE",
    },
    create: user,
  });
}
await prisma.$disconnect();
