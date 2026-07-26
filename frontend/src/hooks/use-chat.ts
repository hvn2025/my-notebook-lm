"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { streamChat } from "@/lib/api/chat";
import type { ChatMessage, RagDebugData } from "@/types/workspace";

function createId() {
  return crypto.randomUUID();
}

interface ChatRequest {
  text: string;
  assistantId: string;
  controller: AbortController;
}

export function useChat(notebookId: string, sourceIds: string[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const updateAssistant = (
    id: string,
    update: (message: ChatMessage) => ChatMessage,
  ) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? update(message) : message)),
    );
  };

  const chatMutation = useMutation({
    mutationKey: ["chat", notebookId],
    retry: false,
    mutationFn: ({ text, assistantId, controller }: ChatRequest) =>
      streamChat({
        message: text,
        notebookId,
        sourceIds,
        signal: controller.signal,
        onText: (chunk) =>
          updateAssistant(assistantId, (message) => ({
            ...message,
            text: message.text + chunk,
          })),
        onDebug: (debug: RagDebugData) =>
          updateAssistant(assistantId, (message) => ({ ...message, debug })),
      }),
  });

  const send = async (question: string) => {
    const text = question.trim();
    if (!text || chatMutation.isPending) return;

    const assistantId = createId();
    setMessages((current) => [
      ...current,
      { id: createId(), role: "user", text },
      { id: assistantId, role: "assistant", text: "" },
    ]);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await chatMutation.mutateAsync({ text, assistantId, controller });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        updateAssistant(assistantId, (message) => ({
          ...message,
          error: true,
          text: error instanceof Error ? error.message : "Chat request failed",
        }));
      }
    } finally {
      abortRef.current = null;
    }
  };

  return { messages, isStreaming: chatMutation.isPending, send };
}
