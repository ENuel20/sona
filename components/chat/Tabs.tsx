"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  activeTab: "chat" | "dashboard";
  onTabChange: (tab: "chat" | "dashboard") => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex w-full max-w-2xl mx-auto mb-8 bg-neutral-900 rounded-lg overflow-hidden">
      <button
        onClick={() => onTabChange("chat")}
        className={cn(
          "flex-1 p-3 text-center transition-colors",
          activeTab === "chat"
            ? "bg-black text-white"
            : "text-neutral-400 hover:text-neutral-300"
        )}
      >
        Chat
      </button>
      <button
        onClick={() => onTabChange("dashboard")}
        className={cn(
          "flex-1 p-3 text-center transition-colors",
          activeTab === "dashboard"
            ? "bg-black text-white"
            : "text-neutral-400 hover:text-neutral-300"
        )}
      >
        Dashboard
      </button>
    </div>
  );
} 