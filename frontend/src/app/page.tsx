"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type HealthResponse = {
  message: string;
};

type ChatResponse = {
  answer: string;
};

export default function Home() {
  const [question, setQuestion] = useState("");

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

  const backendStatus = isPending
    ? "Checking backend..."
    : isError
      ? "Backend is unavailable"
      : data.message;

  const chatMutation = useMutation<ChatResponse, Error, string>({
    mutationFn: async (submittedQuestion) => {
      const response = await fetch("http://localhost:4000/test-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: submittedQuestion }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "The chat request failed");
      }

      return response.json();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submittedQuestion = question.trim();
    if (submittedQuestion) {
      chatMutation.mutate(submittedQuestion);
    }
  }

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>NotebookLM clone</p>
            <h1>Ask about Apollo 11</h1>
          </div>
          <p className={styles.status}>{backendStatus}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="question">Your question</label>
          <div className={styles.controls}>
            <input
              id="question"
              name="question"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What made Apollo 11 historically significant?"
              disabled={chatMutation.isPending}
            />
            <button
              type="submit"
              disabled={!question.trim() || chatMutation.isPending}
            >
              {chatMutation.isPending ? "Asking..." : "Ask"}
            </button>
          </div>
        </form>

        <div className={styles.output} aria-live="polite">
          {chatMutation.isIdle && (
            <p className={styles.hint}>
              The answer will be generated from the in-memory source text.
            </p>
          )}
          {chatMutation.isPending && <p>Retrieving context and generating an answer...</p>}
          {chatMutation.isError && (
            <p className={styles.error} role="alert">
              {chatMutation.error.message}
            </p>
          )}
          {chatMutation.isSuccess && (
            <div className={styles.answer}>
              <h2>Answer</h2>
              <p>{chatMutation.data.answer}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
