import { prisma } from "../config/db.js";

async function verifyDatabase() {
  const email = `milestone-one-${Date.now()}@example.com`;
  const createdUser = await prisma.user.create({
    data: {
      email,
      notebooks: {
        create: { title: "Milestone 1 verification notebook" },
      },
    },
    include: { notebooks: true },
  });

  const storedUser = await prisma.user.findUnique({
    where: { id: createdUser.id },
    include: { notebooks: true },
  });

  if (!storedUser || storedUser.notebooks.length !== 1) {
    throw new Error("Database verification failed");
  }

  console.log({
    userId: storedUser.id,
    email: storedUser.email,
    notebookTitle: storedUser.notebooks[0]?.title,
  });

  await prisma.user.delete({ where: { id: storedUser.id } });
}

verifyDatabase()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
