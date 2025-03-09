"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { ChatSuggestions } from "./ChatSuggestions";
import { Message } from "../types/message";

export default function SonaChat() {
  const [activeTab] = useState("chat");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setHasStartedChat(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Hello! How can I assist you today?",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setHasStartedChat(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <ChatHeader onNewChat={handleNewChat} />

      {!hasStartedChat ? (
        <main className="flex-1 flex flex-col">
          <div className="max-w-2xl mx-auto w-full px-4 pt-4">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col">
          <ChatMessages messages={messages} />
          <ChatSuggestions />
          <div className="border-t border-neutral-800 p-4">
            <div className="max-w-2xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}