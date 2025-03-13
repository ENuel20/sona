"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Upload, Image } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  onVoiceInput?: () => void;
  onFileUpload?: () => void;
  onImageUpload?: () => void;
}

export function ChatInput({ 
  onSubmit, 
  isLoading,
  onVoiceInput,
  onFileUpload,
  onImageUpload
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end bg-neutral-800 rounded-xl p-2 border border-neutral-700">
        <div className="flex space-x-2 px-2">
          {onVoiceInput && (
            <button
              type="button"
              onClick={onVoiceInput}
              className="text-neutral-400 hover:text-white transition-colors"
              disabled={isLoading}
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
          
          {onFileUpload && (
            <button
              type="button"
              onClick={onFileUpload}
              className="text-neutral-400 hover:text-white transition-colors"
              disabled={isLoading}
              aria-label="Upload file"
            >
              <Upload className="w-5 h-5" />
            </button>
          )}
          
          {onImageUpload && (
            <button
              type="button"
              onClick={onImageUpload}
              className="text-neutral-400 hover:text-white transition-colors"
              disabled={isLoading}
              aria-label="Upload image"
            >
              <Image className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-2 px-2 text-white placeholder-neutral-500"
          disabled={isLoading}
          rows={1}
          aria-label="Message input"
        />
        
        <button
          type="submit"
          className={`p-2 rounded-lg ${
            message.trim() && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
          } transition-colors`}
          disabled={!message.trim() || isLoading}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}