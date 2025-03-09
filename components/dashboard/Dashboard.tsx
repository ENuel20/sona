"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface TokenBalance {
  symbol: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
}

interface PortfolioMetrics {
  dailyPnL: number;
  dailyPnLPercentage: number;
  weeklyPnL: number;
  weeklyPnLPercentage: number;
  monthlyPnL: number;
  monthlyPnLPercentage: number;
}

export function Dashboard() {
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([
    {
      symbol: "SOL",
      balance: 0,
      price: 0,
      value: 0,
      change24h: 0,
    },
    {
      symbol: "USDC",
      balance: 0,
      price: 1,
      value: 0,
      change24h: 0,
    }
  ]);
  
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    dailyPnL: 25.50,
    dailyPnLPercentage: 2.5,
    weeklyPnL: 150.75,
    weeklyPnLPercentage: 15.2,
    monthlyPnL: 450.25,
    monthlyPnLPercentage: 45.8
  });

  useEffect(() => {
    // Fetch token balances and prices here
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Implement actual balance and price fetching
        // For now using placeholder data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (publicKey) {
          setTokenBalances([
            {
              symbol: "SOL",
              balance: 1.5,
              price: 150.20,
              value: 225.30,
              change24h: 2.5,
            },
            {
              symbol: "USDC",
              balance: 100,
              price: 1,
              value: 100,
              change24h: 0,
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-400">
        <p>Connect your wallet to view your dashboard</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Total Value */}
      <div className="bg-neutral-800/50 rounded-xl p-4">
        <div className="text-sm text-neutral-400">Total Value</div>
        <div className="text-2xl font-medium mt-1">
          ${tokenBalances.reduce((acc, token) => acc + token.value, 0).toFixed(2)}
        </div>
      </div>

      {/* Token List */}
      <div className="space-y-3">
        {tokenBalances.map((token) => (
          <div
            key={token.symbol}
            className="bg-neutral-800/50 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <img
                  src={`/icons/${token.symbol.toLowerCase()}.png`}
                  alt={token.symbol}
                  className="w-6 h-6"
                />
                <span className="font-medium">{token.symbol}</span>
              </div>
              <div className="text-sm text-neutral-400 mt-1">
                {token.balance.toFixed(2)} {token.symbol}
              </div>
            </div>
            <div className="text-right">
              <div>${token.value.toFixed(2)}</div>
              <div className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staking Section */}
      <div className="bg-neutral-800/50 rounded-xl p-4">
        <div className="text-sm text-neutral-400">Staking Rewards</div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400">Available</div>
            <div className="font-medium mt-1">0.00 SOL</div>
          </div>
          <button className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm">
            Claim
          </button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="bg-neutral-800/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-400">Portfolio Metrics</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Daily P&L */}
          <div className="space-y-1">
            <div className="text-sm text-neutral-400">24h</div>
            <div className="font-medium">
              ${Math.abs(metrics.dailyPnL).toFixed(2)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              metrics.dailyPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {metrics.dailyPnLPercentage >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {metrics.dailyPnLPercentage >= 0 ? '+' : ''}
              {metrics.dailyPnLPercentage}%
            </div>
          </div>

          {/* Weekly P&L */}
          <div className="space-y-1">
            <div className="text-sm text-neutral-400">7d</div>
            <div className="font-medium">
              ${Math.abs(metrics.weeklyPnL).toFixed(2)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              metrics.weeklyPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {metrics.weeklyPnLPercentage >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {metrics.weeklyPnLPercentage >= 0 ? '+' : ''}
              {metrics.weeklyPnLPercentage}%
            </div>
          </div>

          {/* Monthly P&L */}
          <div className="space-y-1">
            <div className="text-sm text-neutral-400">30d</div>
            <div className="font-medium">
              ${Math.abs(metrics.monthlyPnL).toFixed(2)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              metrics.monthlyPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {metrics.monthlyPnLPercentage >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {metrics.monthlyPnLPercentage >= 0 ? '+' : ''}
              {metrics.monthlyPnLPercentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 