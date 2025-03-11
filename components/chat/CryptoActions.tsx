"use client";

import { ArrowRightLeft, Coins, TrendingUp, BarChart3, Info } from "lucide-react";
import { useState } from "react";

interface TokenInfo {
  symbol: string;
  price: number;
  change24h: number;
}

interface CryptoActionProps {
  type: "swap" | "stake" | "tokenInfo";
  data: {
    tokenA?: TokenInfo;
    tokenB?: TokenInfo;
    apy?: number;
    duration?: string;
  };
  onAction: () => void;
}

export function CryptoAction({ type, data, onAction }: CryptoActionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderSwapAction = () => (
    <div 
      className="flex flex-col gap-2 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:border-blue-500/50 transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onAction}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Swap Tokens</span>
        <ArrowRightLeft className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "rotate-180" : ""}`} />
      </div>
      {data.tokenA && data.tokenB && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-neutral-400">From</div>
            <div className="font-medium">{data.tokenA.symbol}</div>
            <div className="text-xs text-neutral-400">${data.tokenA.price.toFixed(2)}</div>
          </div>
          <ArrowRightLeft className="w-4 h-4 text-neutral-400" />
          <div className="flex-1">
            <div className="text-xs text-neutral-400">To</div>
            <div className="font-medium">{data.tokenB.symbol}</div>
            <div className="text-xs text-neutral-400">${data.tokenB.price.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStakeAction = () => (
    <div 
      className="flex flex-col gap-2 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:border-green-500/50 transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onAction}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Stake Tokens</span>
        <Coins className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "scale-110" : ""}`} />
      </div>
      {data.tokenA && data.apy && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Token</span>
            <span className="font-medium">{data.tokenA.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">APY</span>
            <span className="font-medium text-green-400">{data.apy}%</span>
          </div>
          {data.duration && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Lock Period</span>
              <span className="font-medium">{data.duration}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTokenInfo = () => (
    <div 
      className="flex flex-col gap-2 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:border-purple-500/50 transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onAction}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Token Info</span>
        <Info className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "scale-110" : ""}`} />
      </div>
      {data.tokenA && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Symbol</span>
            <span className="font-medium">{data.tokenA.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Price</span>
            <span className="font-medium">${data.tokenA.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">24h Change</span>
            <span className={`font-medium ${data.tokenA.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
              {data.tokenA.change24h >= 0 ? "+" : ""}{data.tokenA.change24h}%
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {type === "swap" && renderSwapAction()}
      {type === "stake" && renderStakeAction()}
      {type === "tokenInfo" && renderTokenInfo()}
    </div>
  );
} 