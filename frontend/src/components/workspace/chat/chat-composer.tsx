"use client";

import { FormEvent, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const suggestions = [
  "Summarize the key findings",
  "Where do the sources disagree?",
  "Draft a one-page brief",
];

interface ChatComposerProps {
  disabled: boolean;
  isStreaming: boolean;
  selectedCount: number;
  onSend: (message: string) => Promise<void>;
}

export function ChatComposer(props: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || props.disabled || props.isStreaming) return;
    const next = message;
    setMessage("");
    void props.onSend(next);
  };

  const placeholder = props.selectedCount
    ? "Ask anything about your sources"
    : "Select at least one indexed source";

  return (
    <div className="shrink-0 border-t p-4">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {suggestions.map((suggestion) => (
          <Button
            className="rounded-full bg-[#f4f1eb] text-xs text-muted-foreground"
            disabled={props.disabled}
            key={suggestion}
            onClick={() => setMessage(suggestion)}
            size="sm"
            type="button"
            variant="secondary"
          >
            {suggestion}
          </Button>
        ))}
      </div>
      <form onSubmit={submit}>
        <InputGroup className="h-12 rounded-2xl bg-white">
          <InputGroupInput
            aria-label="Ask about your sources"
            disabled={props.disabled || props.isStreaming}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={placeholder}
            value={message}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Send question"
              className="rounded-full"
              disabled={!message.trim() || props.disabled || props.isStreaming}
              size="icon"
              type="submit"
            >
              <ArrowUp />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
