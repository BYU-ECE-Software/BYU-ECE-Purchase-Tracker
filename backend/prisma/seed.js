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
  {
    /*const users = [
    {
      //firstName: "Alyssa",
      //lastName: "Parker",
      fullName: "Alyssa Parker",
      email: "alyssa.parker@example.com",
      byuNetId: "alyssaparkerrrrrrr", // unique string
      //role: "admin",
    },
    {
      //firstName: "Ben",
      //lastName: "Young",
      fullName: "Ben Young",
      email: "ben.young@example.com",
      byuNetId: "benyoungggg",
      //role: "manager",
    },
    {
      //firstName: "Chloe",
      //lastName: "Nguyen",
      fullName: "Chloe Nguyen",
      email: "chloe.nguyen@example.com",
      byuNetId: "chloenguyennnnnn",
      //role: "student",
    },
  ];*/
  }

  {
    /*for (const u of users) {
    await prisma.user.upsert({
      where: { byuNetId: u.byuNetId }, // email is @unique in your model
      update: {
        // keep these in sync if you ever change details
        //firstName: u.firstName,
        //lastName: u.lastName,
        fullName: u.fullName,
        email: u.email,
        //role: u.role,
      },
      create: u,
    });
    console.log(`Seeded user: ${u.byuNetId}`);
  }*/
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
