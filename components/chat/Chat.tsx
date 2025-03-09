"use client";

import { useEffect, useState, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { useWallet } from "@solana/wallet-adapter-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-neutral-800 rounded-lg w-fit">
      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}

export function Chat({ chatKey }: { chatKey: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connected } = useWallet();

  useEffect(() => {
    setMessages([]);
  }, [chatKey]);

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    try {
      setMessages(prev => [...prev, { role: "user", content }]);
      setIsLoading(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response
      }]);
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)]">
      {messages.length === 0 && !isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-neutral-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <LoadingDots />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="border-t border-neutral-800">
            <div className="max-w-2xl mx-auto px-4 py-4">
              <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </>
      )}
    </div>
  );
} 