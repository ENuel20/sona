"use client";

import { useState } from "react";
import { useChatContext, type ChatMode, type Conversation } from "@/contexts/ChatContext";
import { Trash2, Plus, MessageSquare, TrendingUp, BarChart3, Globe, ChevronDown, Pencil, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ChatSidebar() {
  const { 
    conversations, 
    currentConversation, 
    createConversation, 
    switchConversation, 
    deleteConversation,
    updateConversationName,
    chatMode,
    setChatMode
  } = useChatContext();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  const formatTimestamp = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleCreateConversation = (mode: ChatMode) => {
    createConversation(mode);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleModeChange = (mode: ChatMode) => {
    setChatMode(mode);
    setShowModeDropdown(false);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete);
      setIsDeleteModalOpen(false);
      setConversationToDelete(null);
    }
  };

  const getModeIcon = (mode: ChatMode) => {
    switch (mode) {
      case "trading":
        return <TrendingUp className="w-4 h-4" />;
      case "portfolio":
        return <BarChart3 className="w-4 h-4" />;
      case "market":
        return <Globe className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleEditName = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingName(conversation.id);
    setNameInput(conversation.name);
  };

  const handleSaveName = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (nameInput.trim()) {
      updateConversationName(id, nameInput);
    }
    setEditingName(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingName(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <button
            onClick={() => handleCreateConversation("general")}
            className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 px-3 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">New Chat</span>
          </button>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className="w-full flex items-center justify-between gap-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg py-2 px-3 text-sm transition-colors"
          >
            <span className="flex items-center gap-1">
              {getModeIcon(chatMode)}
              <span className="capitalize">{chatMode}</span>
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showModeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden z-50">
              <button
                onClick={() => handleModeChange("general")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-neutral-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>General</span>
              </button>
              <button
                onClick={() => handleModeChange("trading")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-neutral-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Trading</span>
              </button>
              <button
                onClick={() => handleModeChange("portfolio")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-neutral-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Portfolio</span>
              </button>
              <button
                onClick={() => handleModeChange("market")}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-neutral-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Market</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {conversations.length === 0 ? (
          <div className="p-4 text-neutral-500 text-sm text-center">
            No conversations yet
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {conversations.map((conversation) => (
              <li 
                key={conversation.id}
                onClick={() => switchConversation(conversation.id)}
                className={`group p-3 cursor-pointer hover:bg-neutral-800 transition-colors ${
                  currentConversation?.id === conversation.id ? "bg-neutral-800" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getModeIcon(conversation.mode)}
                      {editingName === conversation.id ? (
                        <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="bg-neutral-700 text-sm px-2 py-1 rounded flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveName(conversation.id, e as any);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit(e as any);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => handleSaveName(conversation.id, e)}
                            className="p-1 hover:text-green-500 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0 group/name">
                          <p className="font-medium truncate flex-1">{conversation.name}</p>
                          <button
                            onClick={(e) => handleEditName(conversation, e)}
                            className="opacity-0 group-hover/name:opacity-100 md:group-hover:opacity-100 text-neutral-500 hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {formatTimestamp(conversation.lastUpdated)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(conversation.id, e)}
                    className="text-neutral-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-sm w-full mx-auto">
            <h3 className="text-lg font-semibold mb-2">Delete Conversation</h3>
            <p className="text-neutral-300 mb-4">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 