"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { v4 as uuidv4 } from "uuid";

export type ChatMode = "general" | "trading" | "portfolio" | "market";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
}

export interface Conversation {
  id: string;
  name: string;
  mode: ChatMode;
  messages: Message[];
  lastUpdated: number;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  createConversation: (mode: ChatMode) => void;
  switchConversation: (id: string) => void;
  addMessage: (content: string, role: "user" | "assistant") => void;
  updateConversationName: (id: string, name: string) => void;
  deleteConversation: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'chat_history_';

export function ChatProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>("general");

  // Storage key based on wallet
  const storageKey = useMemo(() => 
    publicKey ? `${STORAGE_KEY_PREFIX}${publicKey.toString()}` : null,
    [publicKey]
  );

  // Load conversations from localStorage
  useEffect(() => {
    if (!storageKey) {
      setConversations([]);
      setCurrentConversation(null);
      setChatMode("general");
      return;
    }

    const storedConversations = localStorage.getItem(storageKey);
    if (storedConversations) {
      try {
        const parsedConversations = JSON.parse(storedConversations) as Conversation[];
        setConversations(parsedConversations);
        
        if (parsedConversations.length > 0) {
          const mostRecent = parsedConversations.reduce((latest, conv) => 
            conv.lastUpdated > latest.lastUpdated ? conv : latest
          );
          setCurrentConversation(mostRecent);
          setChatMode(mostRecent.mode);
        } else {
          createConversation("general");
        }
      } catch (error) {
        console.error("Failed to parse stored conversations:", error);
        createConversation("general");
      }
    } else {
      createConversation("general");
    }
  }, [storageKey]);

  // Save conversations to localStorage
  useEffect(() => {
    if (storageKey && conversations.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    }
  }, [conversations, storageKey]);

  const createConversation = useCallback((mode: ChatMode) => {
    const newConversation: Conversation = {
      id: uuidv4(),
      name: 'New Chat',  // Start with generic name
      mode,
      messages: [],
      lastUpdated: Date.now(),
    };

    setConversations(prev => [...prev, newConversation]);
    setCurrentConversation(newConversation);
    setChatMode(mode);
  }, []);

  const switchConversation = useCallback((id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
      setChatMode(conversation.mode);
    }
  }, [conversations]);

  const addMessage = useCallback((content: string, role: "user" | "assistant") => {
    if (!currentConversation || !content.trim()) return;

    const newMessage: Message = {
      id: uuidv4(),
      content,
      role,
      timestamp: Date.now(),
    };

    const updatedConversation: Conversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, newMessage],
      lastUpdated: Date.now(),
    };

    // Generate name from first user message if it's the first message
    if (currentConversation.messages.length === 0 && role === "user") {
      updatedConversation.name = generateConversationName(content);
    }

    setConversations(prev =>
      prev.map(c => (c.id === currentConversation.id ? updatedConversation : c))
    );
    setCurrentConversation(updatedConversation);
  }, [currentConversation]);

  const updateConversationName = useCallback((id: string, name: string) => {
    if (!name.trim()) return;

    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, name: name.trim() } : c))
    );
    
    if (currentConversation?.id === id) {
      setCurrentConversation(prev => prev ? { ...prev, name: name.trim() } : null);
    }
  }, [currentConversation]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (currentConversation?.id === id) {
        const nextConversation = filtered[0] || null;
        setCurrentConversation(nextConversation);
        if (nextConversation) {
          setChatMode(nextConversation.mode);
        }
      }
      return filtered;
    });
  }, [currentConversation]);

  const value = useMemo<ChatContextType>(() => ({
    conversations,
    currentConversation,
    chatMode,
    setChatMode,
    createConversation,
    switchConversation,
    addMessage,
    updateConversationName,
    deleteConversation,
  }), [
    conversations,
    currentConversation,
    chatMode,
    setChatMode,
    createConversation,
    switchConversation,
    addMessage,
    updateConversationName,
    deleteConversation,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}

// Helper function to generate conversation names
function generateConversationName(content: string): string {
  try {
    // Remove any special characters and extra spaces
    const cleanContent = content.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Split into words and take first 6 words
    const words = cleanContent.split(' ');
    const nameWords = words.slice(0, 6);
    let name = nameWords.join(' ');
    
    // Add ellipsis if there are more words
    if (words.length > 6) {
      name += '...';
    }
    
    // Limit total length
    return name.length > 50 ? name.substring(0, 47) + '...' : name;
  } catch (error) {
    console.error('Error generating conversation name:', error);
    return 'New Chat';
  }
} 