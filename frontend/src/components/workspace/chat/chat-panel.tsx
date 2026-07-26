"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useChat } from "@/hooks/use-chat";
import { PanelHeader } from "../panel-header";
import { ChatComposer } from "./chat-composer";
import { ChatThread } from "./chat-thread";

interface ChatPanelProps {
  notebookId: string;
  selectedIds: string[];
}

export function ChatPanel({ notebookId, selectedIds }: ChatPanelProps) {
  const chat = useChat(notebookId, selectedIds);
  const canChat = Boolean(notebookId) && selectedIds.length > 0;

  return (
    <Card className="h-full min-w-0 gap-0 overflow-hidden rounded-[22px] bg-[#fffefa] py-0 shadow-sm ring-[#e3ded5]">
      <PanelHeader
        title="Chat"
        description="Answers grounded in your selected sources"
        action={
          <Badge className="rounded-full bg-[#d5f1ed] px-3 text-[#096966] hover:bg-[#d5f1ed]">
            <Sparkles data-icon="inline-start" /> Grounded
          </Badge>
        }
      />
      <ChatThread messages={chat.messages} isStreaming={chat.isStreaming} />
      <ChatComposer
        disabled={!canChat}
        isStreaming={chat.isStreaming}
        onSend={chat.send}
        selectedCount={selectedIds.length}
      />
    </Card>
  );
}
