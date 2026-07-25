const [notebookId, ...questionParts] = process.argv.slice(2);
const question = questionParts.join(" ").trim();
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface StreamPayload {
  text?: string;
  error?: string;
}

function processEvent(rawEvent: string) {
  const lines = rawEvent.split("\n");
  const eventName =
    lines.find((line) => line.startsWith("event:"))?.slice(6).trim() ??
    "message";
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n");

  if (eventName === "done") {
    process.stdout.write("\n\nStream completed successfully.\n");
    return true;
  }

  if (!data) {
    return false;
  }

  if (eventName === "debug") {
    console.log("--- RAG DEBUG ---");
    console.log(JSON.stringify(JSON.parse(data), null, 2));
    console.log("--- STREAMED ANSWER ---\n");
    return false;
  }

  const payload = JSON.parse(data) as StreamPayload;
  if (eventName === "error" || payload.error) {
    throw new Error(payload.error ?? "The server returned an SSE error");
  }

  if (payload.text) {
    process.stdout.write(payload.text);
  }

  return false;
}

async function main() {
  if (!notebookId || !uuidPattern.test(notebookId) || !question) {
    throw new Error(
      'Usage: npm run test:chat -- <notebook-uuid> "Your question"',
    );
  }

  const response = await fetch("http://localhost:4000/api/chat", {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: question, notebookId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  if (!response.body) {
    throw new Error("The response did not include an SSE body");
  }

  console.log(`Connected (${response.status} ${response.statusText})\n`);
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let boundary = buffer.indexOf("\n\n");

    while (boundary >= 0) {
      const event = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      completed = processEvent(event) || completed;
      boundary = buffer.indexOf("\n\n");
    }
  }

  if (!completed) {
    throw new Error("The stream closed without a done event");
  }
}

main().catch((error: unknown) => {
  console.error("\nChat test failed:", error);
  process.exitCode = 1;
});
