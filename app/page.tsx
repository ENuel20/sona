"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { Chat } from "@/components/chat/Chat";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "chat" | "dashboard";

export default function Home() {
  const [chatKey, setChatKey] = useState<string>("default");
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  return (
    <main className="min-h-screen bg-black text-white">
      <ChatHeader onNewChat={() => setChatKey(Date.now().toString())} />
      
      {/* Navigation Tabs */}
      <div className="max-w-3xl mx-auto px-4 mt-6">
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

      {/* Content */}
      <div className="max-w-3xl mx-auto mt-4">
        {activeTab === "chat" ? (
          <Chat key={chatKey} />
        ) : (
          <Dashboard />
        )}
      </div>
    </main>
  );
}