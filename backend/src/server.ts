import { app } from "./app.js";
import { prisma } from "./config/db.js";
import { env } from "./config/env.js";
import { closeIngestionQueue } from "./lib/queue/index.js";

const server = app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
});

async function shutdown() {
  server.close(async () => {
    await Promise.allSettled([closeIngestionQueue(), prisma.$disconnect()]);
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
