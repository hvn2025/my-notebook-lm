"use client";

import { useQuery } from "@tanstack/react-query";
import styles from "./page.module.css";

type HealthResponse = {
  message: string;
};

export default function Home() {
  const { data, isError, isPending } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("http://localhost:4000/health");

      if (!response.ok) {
        throw new Error("Backend health check failed");
      }

      return response.json();
    },
  });

  const message = isPending
    ? "Checking backend..."
    : isError
      ? "Backend is unavailable"
      : data.message;

  return (
    <main className={styles.main}>
      <h1>{message}</h1>
    </main>
  );
}
