import { prisma } from "./config/db.js";
import {
  closeIngestionWorker,
  ingestionWorker,
} from "./workers/ingestionWorker.js";

console.log(`Ingestion worker is listening on ${ingestionWorker.name}`);

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Received ${signal}; shutting down ingestion worker`);
  await Promise.allSettled([closeIngestionWorker(), prisma.$disconnect()]);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
