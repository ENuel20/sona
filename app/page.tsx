"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { Chat } from "@/components/chat/Chat";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/contexts/ChatContext";

type Tab = "chat" | "dashboard";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const { createConversation } = useChatContext();

  const handleNewChat = () => {
    createConversation();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-neutral-800">
        <ChatHeader onNewChat={handleNewChat} />
        
        {/* Navigation Tabs */}
        <div className="max-w-3xl mx-auto px-4 py-2">
          <div className="flex bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700/50">
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors relative",
                activeTab === "chat"
                  ? "bg-black/90 text-white"
                  : "text-neutral-400 hover:text-neutral-300"
              )}
            >
              Chat
              {activeTab === "chat" && (
                <div className="absolute inset-0 border border-neutral-700/50 rounded-2xl" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors relative",
                activeTab === "dashboard"
                  ? "bg-black/90 text-white"
                  : "text-neutral-400 hover:text-neutral-300"
              )}
            >
              Dashboard
              {activeTab === "dashboard" && (
                <div className="absolute inset-0 border border-neutral-700/50 rounded-2xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-28">
        {activeTab === "chat" ? (
          <Chat />
        ) : (
          <div className="max-w-6xl mx-auto px-4">
            <Dashboard />
          </div>
        )}
      </div>
    </div>
  );
}