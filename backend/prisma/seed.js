import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.spendCategory.upsert({
    where: { code: "Other" },
    update: { description: "Enter manually", visibleToStudents: true },
    create: {
      code: "Other",
      description: "Enter manually",
      visibleToStudents: true,
    },
  });
  console.log("Seeded spend category: Other");

  // --- DEV users (safe to run multiple times) ---
  const users = [
    {
      firstName: "Alyssa",
      lastName: "Parker",
      email: "alyssa.parker@example.com",
      byuId: "100000001", // unique string
      role: "admin",
    },
    {
      firstName: "Ben",
      lastName: "Young",
      email: "ben.young@example.com",
      byuId: "100000002",
      role: "manager",
    },
    {
      firstName: "Chloe",
      lastName: "Nguyen",
      email: "chloe.nguyen@example.com",
      byuId: "100000003",
      role: "student",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email }, // email is @unique in your model
      update: {
        // keep these in sync if you ever change details
        firstName: u.firstName,
        lastName: u.lastName,
        byuId: u.byuId,
        role: u.role,
      },
      create: u,
    });
    console.log(`Seeded user: ${u.email}`);
  }
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
