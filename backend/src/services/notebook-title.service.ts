import { ChatOpenAI } from "@langchain/openai";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { getOpenRouterConfig } from "../config/open-router.js";

export const UNTITLED_NOTEBOOK_TITLE = "Untitled notebook";

function cleanGeneratedTitle(value: string) {
  return value
    .trim()
    .replace(/^title\s*:\s*/i, "")
    .replace(/^["'`*#\s]+|["'`*#.\s]+$/g, "")
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, 8)
    .join(" ")
    .slice(0, 80);
}

export async function generateNotebookTitleForSource(sourceId: string) {
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    select: {
      title: true,
      notebook: { select: { id: true, title: true } },
      chunks: {
        orderBy: { chunkIndex: "asc" },
        take: 4,
        select: { content: true },
      },
    },
  });

  if (
    !source ||
    source.notebook.title !== UNTITLED_NOTEBOOK_TITLE ||
    source.chunks.length === 0
  ) {
    return null;
  }

  const context = source.chunks
    .map((chunk) => chunk.content)
    .join("\n\n")
    .slice(0, 8_000);
  const model = new ChatOpenAI({
    model: env.openRouterChatModel,
    temperature: 0,
    ...getOpenRouterConfig(),
  });
  const completion = await model.invoke([
    [
      "system",
      "Create a concise notebook title from the supplied source. Return only a specific 3-7 word title with no quotes, punctuation, label, or markdown.",
    ],
    ["human", `Source name: ${source.title}\n\nSource text:\n${context}`],
  ]);
  const title = cleanGeneratedTitle(completion.text);
  if (!title) return null;

  const updated = await prisma.notebook.updateMany({
    where: {
      id: source.notebook.id,
      title: UNTITLED_NOTEBOOK_TITLE,
    },
    data: { title },
  });
  return updated.count ? title : null;
}
