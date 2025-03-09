"use client";

import { cn } from "@/lib/utils";
import { Message } from "@/types/message";

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[80%] animate-in fade-in-50 duration-300",
                message.sender === "user" ? "bg-neutral-700" : "bg-[#1e2023]"
              )}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}