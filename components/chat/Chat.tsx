"use client";

import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { useWallet } from "@solana/wallet-adapter-react";
import { Message, useChatContext } from "@/contexts/ChatContext";
import { ChatSidebar } from "./ChatSidebar";
import { Mic, Image, Info, Wallet, ArrowLeftRight, Menu } from "lucide-react";
import { CryptoAction } from "./CryptoActions";
import { TokenWorkflow } from "../crypto/TokenWorkflow";

// Add interfaces for crypto actions
interface CryptoActionData {
  tokenA?: {
    symbol: string;
    price: number;
    change24h: number;
  };
  tokenB?: {
    symbol: string;
    price: number;
    change24h: number;
  };
  apy?: number;
  duration?: string;
}

interface CryptoActionType {
  type: 'swap' | 'stake' | 'tokenInfo';
  data: CryptoActionData;
  message: string;
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

export function Chat() {
  const { connected } = useWallet();
  const { 
    currentConversation, 
    addMessage, 
    chatMode,
    createConversation
  } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [workflowType, setWorkflowType] = useState<'swap' | 'stake' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Create a new conversation if none exists
  useEffect(() => {
    if (!currentConversation) {
      createConversation("general");
    }
  }, [currentConversation, createConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const messages = currentConversation?.messages;
    if (messages && messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation?.messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      addMessage(content, "user");
      setIsLoading(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: currentConversation?.messages || [],
          mode: chatMode 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      addMessage(data.response, "assistant");
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage("Sorry, I encountered an error processing your request.", "assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    alert("Voice input feature coming soon!");
  };

  const handleFileUpload = () => {
    alert("File upload feature coming soon!");
  };

  const handleImageUpload = () => {
    alert("Image upload feature coming soon!");
  };

  const getModeDescription = () => {
    switch (chatMode) {
      case "general":
        return "Ask me anything about crypto, blockchain, or general questions.";
      case "trading":
        return "I can help you with trading strategies, market analysis, and token swaps.";
      case "portfolio":
        return "Let's analyze your portfolio, track performance, and optimize your holdings.";
      case "market":
        return "Ask me about market trends, price predictions, and latest crypto news.";
    }
  };

  const renderMessage = (message: Message) => {
    const isAssistant = message.role === "assistant";
    
    // Check if the message contains crypto action data
    const cryptoAction = tryParseCryptoAction(message.content);
    
    return (
      <div
        key={message.id}
        className={`flex ${
          isAssistant ? "justify-start" : "justify-end"
        } animate-slideUp`}
      >
        <div
          className={`max-w-[80%] rounded-lg ${
            isAssistant ? "bg-neutral-800 text-neutral-200" : "bg-blue-600 text-white"
          }`}
        >
          {cryptoAction ? (
            <div className="p-1">
              <div className="mb-2 px-3 pt-2">{cryptoAction.message}</div>
              <CryptoAction
                type={cryptoAction.type}
                data={cryptoAction.data}
                onAction={() => handleCryptoAction(cryptoAction)}
              />
            </div>
          ) : (
            <div className="p-3 whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
      </div>
    );
  };

  const tryParseCryptoAction = (content: string): CryptoActionType | null => {
    try {
      if (content.includes("{{CRYPTO_ACTION:")) {
        const actionStart = content.indexOf("{{CRYPTO_ACTION:");
        const actionEnd = content.indexOf("}}", actionStart) + 2;
        const actionJson = content.substring(actionStart + 15, actionEnd - 2);
        const action = JSON.parse(actionJson) as CryptoActionType;
        return {
          type: action.type,
          data: action.data,
          message: content.substring(0, actionStart).trim(),
        };
      }
    } catch (error) {
      console.error("Failed to parse crypto action:", error);
    }
    return null;
  };

  const handleCryptoAction = async (action: CryptoActionType): Promise<void> => {
    try {
      switch (action.type) {
        case "swap":
          if (action.data.tokenA && action.data.tokenB) {
            // Implement swap logic
            console.log("Swap tokens:", action.data);
          }
          break;
        case "stake":
          if (action.data.tokenA && action.data.apy) {
            // Implement stake logic
            console.log("Stake tokens:", action.data);
          }
          break;
        case "tokenInfo":
          if (action.data.tokenA) {
            // Implement token info logic
            console.log("Token info:", action.data);
          }
          break;
        default:
          console.warn("Unknown crypto action type:", action);
      }
    } catch (error) {
      console.error("Error handling crypto action:", error);
    }
  };

  const handleStakeAction = () => {
    setWorkflowType('stake');
  };

  const handleSwapAction = () => {
    setWorkflowType('swap');
  };

  return (
    <div className="h-screen w-full flex relative overflow-hidden bg-black">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-[280px] md:w-[260px] h-screen
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 flex flex-col
        bg-neutral-900 border-r border-neutral-800
      `}>
        <ChatSidebar />
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col h-screen relative md:ml-0">
        {/* Header */}
        <div className="h-14 flex-shrink-0 border-b border-neutral-800 bg-black/50 backdrop-blur-sm z-20 sticky top-0">
          <div className="h-full px-4 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-neutral-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 flex-1 max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold capitalize">{chatMode} Mode</span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowTooltip("mode")}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showTooltip === "mode" && (
                    <div className="absolute left-0 top-6 w-64 p-2 bg-neutral-800 rounded-lg text-sm shadow-lg z-50">
                      {getModeDescription()}
                    </div>
                  )}
                </div>
              </div>
              {!connected && (
                <div className="text-sm text-yellow-500 ml-auto hidden sm:block">
                  Connect your wallet to save conversations
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-36">
            {!currentConversation || currentConversation.messages.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
                <div className="text-center p-8 rounded-xl bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/50 max-w-lg w-full">
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Welcome to Sona Chat</h2>
                  <p className="text-neutral-400 mb-8">{getModeDescription()}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-800/50 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold">Swap Tokens</h3>
                      </div>
                      <p className="text-sm text-neutral-400">Swap between different tokens instantly</p>
                    </div>
                    <div className="bg-neutral-800/50 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold">Stake Tokens</h3>
                      </div>
                      <p className="text-sm text-neutral-400">Stake your tokens to earn rewards</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentConversation?.messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-start">
                    <LoadingDots />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Container - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 md:left-[260px] right-0 bg-gradient-to-t from-black via-black to-transparent pt-6 z-20">
          <div className="max-w-4xl mx-auto w-full px-4 pb-4">
            <ChatInput 
              onSubmit={handleSendMessage} 
              isLoading={isLoading}
              onVoiceInput={handleVoiceInput}
              onFileUpload={handleFileUpload}
              onImageUpload={handleImageUpload}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <button 
                    onClick={handleVoiceInput}
                    className="flex items-center gap-1 cursor-pointer hover:text-neutral-300 transition-colors px-2 py-1 rounded-md"
                  >
                    <Mic className="w-3 h-3" /> Voice
                  </button>
                  <button 
                    onClick={handleImageUpload}
                    className="flex items-center gap-1 cursor-pointer hover:text-neutral-300 transition-colors px-2 py-1 rounded-md"
                  >
                    <Image className="w-3 h-3" /> Image
                  </button>
                </div>
                <div className="h-4 w-px bg-neutral-800 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSwapAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors font-medium text-sm"
                  >
                    <ArrowLeftRight className="w-4 h-4" /> Swap
                  </button>
                  <button 
                    onClick={handleStakeAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors font-medium text-sm"
                  >
                    <Wallet className="w-4 h-4" /> Stake
                  </button>
                </div>
              </div>
              <span className="text-xs text-neutral-500 hidden sm:block">
                Press Enter to send, Shift + Enter for new line
              </span>
            </div>
          </div>
        </div>

        {/* Token Workflow Modal */}
        <TokenWorkflow
          type={workflowType || 'swap'}
          isOpen={workflowType !== null}
          onClose={() => setWorkflowType(null)}
        />
      </div>

      {/* Global Modal Layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="pointer-events-auto">
          {/* Any modals will be rendered here */}
        </div>
      </div>
    </div>
  );
} 