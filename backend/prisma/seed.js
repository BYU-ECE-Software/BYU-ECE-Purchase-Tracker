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
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
