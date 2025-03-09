"use client";

import { Plus, History, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";

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

  return (
    <header className="border-b border-neutral-800 p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-300 hover:text-neutral-300 hover:bg-white/10 w-8 h-8 rounded-full"
            onClick={onNewChat}
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-300 hover:text-neutral-300 hover:bg-white/10 w-8 h-8 rounded-full"
            title="History"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-white">Sona</h1>
          <Badge 
            variant="secondary" 
            className="bg-blue-600/20 text-blue-400 border-none text-xs font-medium uppercase px-2 py-0.5"
          >
            beta
          </Badge>
        </div>

        {!connected ? (
          <WalletMultiButton className="wallet-adapter-button" />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-300 hover:text-neutral-300 hover:bg-white/10 gap-1.5 rounded-full"
            onClick={disconnect}
          >
            <Wallet className="w-4 h-4" />
            {`${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`}
          </Button>
        )}
      </div>
    </header>
  );
}