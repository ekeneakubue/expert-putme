import { PrismaClient, UserRole } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

/**
 * Seed baseline subjects and a default admin user.
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

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminEmail = (
    process.env.ADMIN_EMAIL || "admin@expertputme.app"
  ).toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Control Room Admin",
      email: adminEmail,
      role: UserRole.ADMIN,
      passwordHash: hashPassword(adminPassword),
    },
  });
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
