"use client";

import { Plus, History, Wallet, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

interface ChatHeaderProps {
  onNewChat: () => void;
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  const { connected, publicKey, disconnect } = useWallet();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  return (
    <header className="p-4 bg-black">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-300 hover:text-neutral-300 hover:bg-white/10 w-8 h-8 rounded-full"
              onClick={onNewChat}
              onMouseEnter={() => setShowTooltip("new")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            {showTooltip === "new" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-neutral-800 text-xs rounded-md whitespace-nowrap z-50">
                Start new chat
              </div>
            )}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-300 hover:text-neutral-300 hover:bg-white/10 w-8 h-8 rounded-full"
              onMouseEnter={() => setShowTooltip("history")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <History className="w-4 h-4" />
            </Button>
            {showTooltip === "history" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-neutral-800 text-xs rounded-md whitespace-nowrap z-50">
                View chat history
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-white">Sona</h1>
          <div className="relative">
            <Badge 
              variant="secondary" 
              className="bg-blue-600/20 text-blue-400 border-none text-xs font-medium uppercase px-2 py-0.5 cursor-help"
              onMouseEnter={() => setShowTooltip("beta")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              beta
            </Badge>
            {showTooltip === "beta" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-neutral-800 text-xs rounded-md whitespace-nowrap z-50">
                Early access version - features may change
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          {!connected ? (
            <div
              onMouseEnter={() => setShowTooltip("wallet")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <WalletMultiButton className="wallet-adapter-button" />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-300 hover:text-neutral-300 hover:bg-white/10 gap-1.5 rounded-full"
              onClick={disconnect}
              onMouseEnter={() => setShowTooltip("wallet")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <Wallet className="w-4 h-4" />
              {`${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`}
            </Button>
          )}
          {showTooltip === "wallet" && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-neutral-800 text-xs rounded-md whitespace-nowrap z-50">
              {connected ? "Click to disconnect wallet" : "Connect wallet to save chats"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}