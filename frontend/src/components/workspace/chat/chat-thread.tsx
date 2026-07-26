import { MessageCircleMore } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { ChatMessageView } from "./chat-message";
import type { ChatMessage } from "@/types/workspace";

interface ChatThreadProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function ChatThread({ messages, isStreaming }: ChatThreadProps) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-4xl gap-7 px-7 py-8">
            {messages.length === 0 ? <ChatEmpty /> : null}
            {messages.map((message, index) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === "user"}
              >
                <ChatMessageView
                  message={message}
                  streaming={isStreaming && index === messages.length - 1}
                />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

function ChatEmpty() {
  return (
    <Empty className="min-h-[360px] border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-[#d5f1ed] text-primary">
          <MessageCircleMore />
        </EmptyMedia>
        <EmptyTitle className="font-serif text-lg">Ask your sources</EmptyTitle>
        <EmptyDescription>
          Select indexed sources, then ask for summaries, comparisons, or evidence.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
