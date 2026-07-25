import { prisma } from "../config/db.js";

export function upsertUser(email: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}
