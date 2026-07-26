"use client";

import { Check, Copy, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChatMessage } from "@/types/workspace";

interface ChatMessageViewProps {
  message: ChatMessage;
  streaming: boolean;
}

export function ChatMessageView({ message, streaming }: ChatMessageViewProps) {
  if (message.role === "user") {
    return (
      <Message align="end">
        <MessageContent>
          <Bubble align="end" className="max-w-[84%]">
            <BubbleContent className="rounded-2xl bg-primary px-5 py-3 text-primary-foreground">
              {message.text}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message>
      <MessageContent>
        {message.debug?.stepBackQuestion ? (
          <Marker className="rounded-lg bg-[#f4f1eb] px-3 py-2 text-xs">
            <MarkerIcon><Check /></MarkerIcon>
            <MarkerContent>Step-back: {message.debug.stepBackQuestion}</MarkerContent>
          </Marker>
        ) : null}
        <Bubble variant={message.error ? "destructive" : "ghost"}>
          <BubbleContent className="whitespace-pre-wrap text-[15px] leading-7">
            {message.text || (streaming ? <ThinkingMarker /> : "No response received.")}
          </BubbleContent>
        </Bubble>
        {message.text ? <AssistantActions message={message} /> : null}
      </MessageContent>
    </Message>
  );
}

function ThinkingMarker() {
  return (
    <Marker role="status">
      <MarkerIcon><Spinner /></MarkerIcon>
      <MarkerContent>Reviewing your selected sources…</MarkerContent>
    </Marker>
  );
}

function AssistantActions({ message }: { message: ChatMessage }) {
  const chunks = message.debug?.retrieval.uniqueChunkCount;
  return (
    <MessageFooter className="gap-2 px-0">
      {chunks !== undefined ? <Badge variant="secondary">{chunks} retrieved chunks</Badge> : null}
      <Button onClick={() => void navigator.clipboard.writeText(message.text)} size="sm" variant="outline">
        <Copy /> Copy
      </Button>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <Button disabled size="sm" variant="outline"><Save /> Save to note</Button>
        </TooltipTrigger>
        <TooltipContent>Notes do not have a backend endpoint yet.</TooltipContent>
      </Tooltip>
    </MessageFooter>
  );
}
