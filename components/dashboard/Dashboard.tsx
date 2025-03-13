"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Info } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Dynamically import Chart.js to avoid SSR issues
const Chart = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px]">
      <div className="animate-pulse text-neutral-400">Loading chart...</div>
    </div>
  ),
});

interface PriceData {
  timestamp: number;
  price: number;
}

interface TokenInsight {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  insights: string[];
}

interface UserStats {
  totalBalance: number;
  totalStaked: number;
  totalRewards: number;
  portfolioChange24h: number;
}

interface TokenBalance {
  symbol: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
}

interface StakingPosition {
  token: string;
  amount: number;
  apy: number;
  rewards: number;
  duration: string;
}

export function Dashboard() {
  const { publicKey } = useWallet();
  const [selectedToken, setSelectedToken] = useState("SOL");
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [insights, setInsights] = useState<TokenInsight | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tokens = ["SOL", "BTC", "ETH", "USDC"];

  useEffect(() => {
    fetchTokenData(selectedToken);
  }, [selectedToken]);

  const fetchTokenData = async (token: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls
      // Simulated data for now
      const mockPriceData = generateMockPriceData();
      const mockInsights = generateMockInsights(token);
      
      setPriceData(mockPriceData);
      setInsights(mockInsights);
    } catch (error) {
      console.error("Error fetching token data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    labels: priceData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `${selectedToken} Price`,
        data: priceData.map(d => d.price),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
          maxRotation: 0,
          maxTicksLimit: 6,
        },
      },
    },
  };

  // Add new fetch functions for user data
  const fetchUserData = async () => {
    if (!publicKey) return;
    
    // TODO: Replace with actual API calls
    setUserStats({
      totalBalance: 25000,
      totalStaked: 10000,
      totalRewards: 500,
      portfolioChange24h: 2.5
    });

    setTokenBalances([
      { symbol: "SOL", balance: 100, price: 150, value: 15000, change24h: 2.5 },
      { symbol: "BTC", balance: 0.5, price: 50000, value: 25000, change24h: -1.2 },
      { symbol: "ETH", balance: 2, price: 3000, value: 6000, change24h: 1.8 },
    ]);

    setStakingPositions([
      { token: "SOL", amount: 50, apy: 5.5, rewards: 0.25, duration: "90 days" },
      { token: "ETH", amount: 1, apy: 4.2, rewards: 0.04, duration: "30 days" },
    ]);
  };

  useEffect(() => {
    fetchUserData();
  }, [publicKey]);

  return (
    <div className="p-6 space-y-6">
      {/* User Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
            <h3 className="text-sm text-neutral-400 mb-2">Total Balance</h3>
            <p className="text-2xl font-semibold">${userStats.totalBalance.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
            <h3 className="text-sm text-neutral-400 mb-2">Total Staked</h3>
            <p className="text-2xl font-semibold">${userStats.totalStaked.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
            <h3 className="text-sm text-neutral-400 mb-2">Total Rewards</h3>
            <p className="text-2xl font-semibold">${userStats.totalRewards.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
            <h3 className="text-sm text-neutral-400 mb-2">24h Change</h3>
            <p className={`text-2xl font-semibold ${userStats.portfolioChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {userStats.portfolioChange24h >= 0 ? '+' : ''}{userStats.portfolioChange24h}%
            </p>
          </div>
        </div>
      )}

      {/* Token Selection and Chart */}
      <div className="flex gap-2">
        {tokens.map(token => (
          <button
            key={token}
            onClick={() => setSelectedToken(token)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedToken === token
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {token}
          </button>
        ))}
      </div>

      {/* Price Chart */}
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
        <div className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse">Loading chart...</div>
            </div>
          ) : (
            <Chart data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Token Balances */}
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
        <h3 className="text-lg font-medium mb-4">Your Token Balances</h3>
        <div className="space-y-4">
          {tokenBalances.map(token => (
            <div key={token.symbol} className="flex items-center justify-between p-2 hover:bg-neutral-800 rounded-lg transition-colors">
              <div>
                <h4 className="font-medium">{token.symbol}</h4>
                <p className="text-sm text-neutral-400">{token.balance.toLocaleString()} tokens</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${token.value.toLocaleString()}</p>
                <p className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staking Positions */}
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
        <h3 className="text-lg font-medium mb-4">Your Staking Positions</h3>
        <div className="space-y-4">
          {stakingPositions.map((position, index) => (
            <div key={index} className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{position.token}</h4>
                <span className="text-sm text-green-400">{position.apy}% APY</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-400">Amount Staked</p>
                  <p className="font-medium">{position.amount} {position.token}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Rewards Earned</p>
                  <p className="font-medium">{position.rewards} {position.token}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Duration</p>
                  <p className="font-medium">{position.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
            <h3 className="text-lg font-medium mb-4">Market Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Price</span>
                <span className="font-medium">${insights.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">24h Change</span>
                <span className={`font-medium flex items-center gap-1 ${
                  insights.change24h >= 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {insights.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {insights.change24h}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">24h Volume</span>
                <span className="font-medium">${insights.volume24h.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Market Cap</span>
                <span className="font-medium">${insights.marketCap.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
            <h3 className="text-lg font-medium mb-4">Market Insights</h3>
            <div className="space-y-2">
              {insights.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-neutral-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for mock data
function generateMockPriceData(): PriceData[] {
  const data: PriceData[] = [];
  const now = Date.now();
  const basePrice = 100;
  
  for (let i = 0; i < 24; i++) {
    data.push({
      timestamp: now - (23 - i) * 3600000,
      price: basePrice + Math.random() * 20 - 10,
    });
  }
  
  return data;
}

function generateMockInsights(token: string): TokenInsight {
  return {
    symbol: token,
    price: 100 + Math.random() * 50,
    change24h: Math.round((Math.random() * 10 - 5) * 100) / 100,
    volume24h: Math.round(Math.random() * 1000000),
    marketCap: Math.round(Math.random() * 1000000000),
    insights: [
      "Strong buying pressure in the last 24 hours",
      "Technical indicators suggest a bullish trend",
      "Increased social media mentions",
      "Major protocol upgrade expected next week",
    ],
  };
} 