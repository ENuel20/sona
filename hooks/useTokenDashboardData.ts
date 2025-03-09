import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { getTokenPrices } from "@/services/coingecko";

interface TokenData {
  symbol: string;
  walletAmount: number;
  stakedAmount: number;
  totalAmount: number;
  currentPrice: number | null;
  priceChange24h: number | null;
  apy: number | null;
  unclaimedRewards: number | null;
  icon?: string;
}

// Token configuration
const TOKENS = {
  SOL: {
    symbol: "SOL",
    mint: null, // Native SOL
    coingeckoId: "solana",
    decimals: 9,
    icon: "/icons/sol.png"
  },
  USDC: {
    symbol: "USDC",
    mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // Devnet USDC
    coingeckoId: "usd-coin",
    decimals: 6,
    icon: "/icons/usdc.png"
  },
  // Add SONIC configuration when available
};

export function useTokenDashboardData() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokenData, setTokenData] = useState<Record<string, TokenData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch token balances
        const newTokenData: Record<string, TokenData> = {};

        // 1. Fetch SOL balance
        const solBalance = await connection.getBalance(publicKey);
        newTokenData.SOL = {
          symbol: "SOL",
          walletAmount: solBalance / 1e9,
          stakedAmount: 0,
          totalAmount: solBalance / 1e9,
          currentPrice: null,
          priceChange24h: null,
          apy: null,
          unclaimedRewards: null,
          icon: TOKENS.SOL.icon
        };

        // 2. Fetch USDC balance
        const usdcToken = TOKENS.USDC;
        if (usdcToken.mint) {
          const usdcAta = await getAssociatedTokenAddress(
            usdcToken.mint,
            publicKey
          );
          try {
            const usdcAccount = await getAccount(connection, usdcAta);
            newTokenData.USDC = {
              symbol: "USDC",
              walletAmount: Number(usdcAccount.amount) / Math.pow(10, usdcToken.decimals),
              stakedAmount: 0,
              totalAmount: Number(usdcAccount.amount) / Math.pow(10, usdcToken.decimals),
              currentPrice: 1, // USDC is a stablecoin
              priceChange24h: 0,
              apy: null,
              unclaimedRewards: null,
              icon: usdcToken.icon
            };
          } catch (e) {
            // Token account doesn't exist yet
            newTokenData.USDC = {
              symbol: "USDC",
              walletAmount: 0,
              stakedAmount: 0,
              totalAmount: 0,
              currentPrice: 1,
              priceChange24h: 0,
              apy: null,
              unclaimedRewards: null,
              icon: usdcToken.icon
            };
          }
        }

        // 3. Fetch prices from CoinGecko
        try {
          const coingeckoIds = Object.values(TOKENS)
            .map(token => token.coingeckoId)
            .filter(Boolean);
          
          const prices = await getTokenPrices(coingeckoIds);

          // Update token data with prices
          Object.entries(TOKENS).forEach(([symbol, config]) => {
            if (config.coingeckoId && prices[config.coingeckoId] && newTokenData[symbol]) {
              newTokenData[symbol].currentPrice = prices[config.coingeckoId].current_price;
              newTokenData[symbol].priceChange24h = prices[config.coingeckoId].price_change_percentage_24h;
            }
          });
        } catch (priceError) {
          console.error("Failed to fetch prices:", priceError);
          // Continue with null prices rather than failing completely
        }

        setTokenData(newTokenData);
      } catch (err) {
        setError("Failed to fetch token data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const interval = setInterval(fetchData, 60000); // Update every minute
    fetchData();

    return () => clearInterval(interval);
  }, [connection, publicKey]);

  return { tokenData, isLoading, error };
} 