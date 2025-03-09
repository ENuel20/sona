"use client";

import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Link, RefreshCw, Paperclip } from "lucide-react";
import { useRef, useState } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  return (
    <div className="relative">
      <div className="bg-neutral-800/80 rounded-2xl overflow-hidden">
        <Textarea
          ref={textareaRef}
          rows={1}
          placeholder="Ask anything"
          className="min-h-[60px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 text-base py-4 px-4 text-neutral-400 placeholder:text-neutral-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-300">
              <RefreshCw className="w-4 h-4" />
              Swap
            </button>
            <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-300">
              <Link className="w-4 h-4" />
              Stake
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700/50 rounded-lg">
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:hover:bg-neutral-700 text-neutral-400"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}