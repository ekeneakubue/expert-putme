import { PrismaClient } from "@prisma/client";

/**
 * Seed baseline subjects for Expert PUTME Mock.
 * Run: npx prisma db seed
 */
const prisma = new PrismaClient();

const subjects = [
  "Use of English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Government",
  "Economics",
  "Literature",
];

async function main() {
  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
