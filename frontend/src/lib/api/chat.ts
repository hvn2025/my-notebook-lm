import { apiBaseUrl, getAccessToken, readApiError } from "./http";
import type { RagDebugData } from "@/types/workspace";

interface StreamChatInput {
  message: string;
  notebookId: string;
  sourceIds: string[];
  signal: AbortSignal;
  onText: (text: string) => void;
  onDebug: (debug: RagDebugData) => void;
}

function parseEvent(block: string) {
  let event = "message";
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) data.push(line.slice(5).trim());
  }
  return { event, data: data.join("\n") };
}

export async function streamChat(input: StreamChatInput) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${apiBaseUrl}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: input.message,
      notebookId: input.notebookId,
      sourceIds: input.sourceIds,
    }),
    signal: input.signal,
  });

  if (!response.ok) throw new Error(await readApiError(response));
  if (!response.body) throw new Error("The chat stream did not start");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const parsed = parseEvent(block);
      if (!parsed.data) continue;
      const payload = JSON.parse(parsed.data) as Record<string, unknown>;
      if (parsed.event === "debug") input.onDebug(payload as unknown as RagDebugData);
      if (parsed.event === "error") throw new Error(String(payload.error));
      if (parsed.event === "message" && typeof payload.text === "string") {
        input.onText(payload.text);
      }
    }
    if (done) break;
  }
}
