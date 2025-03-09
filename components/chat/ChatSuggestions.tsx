"use client";

import { Button } from "@/components/ui/button";

export function ChatSuggestions() {
  return (
    <div className="flex justify-center gap-2 my-4">
      <Button
        variant="secondary"
        size="sm"
        className="bg-[#1e2023] hover:bg-[#1e2023]/70 rounded-full px-4"
      >
        specific help needed
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="bg-[#1e2023] hover:bg-[#1e2023]/70 rounded-full px-4"
      >
        common questions
      </Button>
    </div>
  );
}