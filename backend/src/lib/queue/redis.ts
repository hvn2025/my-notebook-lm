import { Redis } from "ioredis";
import { env } from "../../config/env.js";

function requireRedisUrl() {
  if (!env.redisUrl) {
    throw new Error("REDIS_URL is required to use the ingestion queue");
  }

  const url = new URL(env.redisUrl);
  if (url.protocol !== "redis:" && url.protocol !== "rediss:") {
    throw new Error("REDIS_URL must use the redis:// or rediss:// protocol");
  }

  return url;
}

export function createRedisConnection(maxRetriesPerRequest: number | null) {
  const redisUrl = requireRedisUrl();
  const connection = new Redis(redisUrl.toString(), {
    enableReadyCheck: false,
    lazyConnect: true,
    maxRetriesPerRequest,
    retryStrategy: (attempt) => Math.min(attempt * 200, 2_000),
    reconnectOnError: (error) => {
      const reconnectable = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
      return reconnectable.some((message) => error.message.includes(message));
    },
    tls:
      redisUrl.protocol === "rediss:"
        ? { servername: redisUrl.hostname, rejectUnauthorized: true }
        : undefined,
  });

  connection.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });

  return connection;
}

export const redisConnection = createRedisConnection(1);
