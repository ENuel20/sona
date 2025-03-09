import axios from "axios";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

interface CoinGeckoPrice {
  current_price: number;
  price_change_percentage_24h: number;
}

export async function getTokenPrices(tokens: string[]): Promise<Record<string, CoinGeckoPrice>> {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/simple/price`,
      {
        params: {
          ids: tokens.join(","),
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      }
    );

    const formatted: Record<string, CoinGeckoPrice> = {};
    for (const [id, data] of Object.entries(response.data)) {
      formatted[id] = {
        current_price: (data as any).usd,
        price_change_percentage_24h: (data as any).usd_24h_change,
      };
    }
    return formatted;
  } catch (error) {
    console.error("Failed to fetch prices from CoinGecko:", error);
    throw error;
  }
} 