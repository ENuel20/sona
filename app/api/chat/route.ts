import { SonicAgentKit, createSonicTools } from "@sendaifun/sonic-agent-kit";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";

// Initialize agents as singletons for different modes
let generalAgent: any = null;
let tradingAgent: any = null;
let portfolioAgent: any = null;
let marketAgent: any = null;
let config: any = null;
let agentsInitialized = false;

// Add these interfaces
interface TokenData {
  symbol: string;
  price: number;
  change24h: number;
}

interface CryptoAction {
  type: 'swap' | 'stake' | 'tokenInfo';
  data: any;
  message: string;
}

// Add this constant at the top of the file
const COMMON_TOKENS = new Set([
  'BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC',
  'DOT', 'DAI', 'AVAX', 'LINK', 'UNI', 'AAVE', 'SUSHI', 'COMP', 'MKR', 'SNX'
]);

async function initializeAgents() {
  if (generalAgent && tradingAgent && portfolioAgent && marketAgent) return;

  try {
    const llm = new ChatOpenAI({
      modelName: "gpt-4-mini",
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const sonicAgent = new SonicAgentKit(
      process.env.SONIC_PRIVATE_KEY!,
      process.env.RPC_URL!,
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      }
    );

    const tools = createSonicTools(sonicAgent);
    const memory = new MemorySaver();
    config = { configurable: { thread_id: "Sonic Agent Kit!" } };

    // General purpose agent
    generalAgent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Sonic Agent Kit.
        You are empowered to interact onchain using your tools.
        If someone asks about tokens or balances, check them using your tools.
        If someone wants to swap or stake, guide them through the process.
        Be concise and helpful with your responses.
      `,
    });

    // Trading-focused agent
    tradingAgent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a specialized trading assistant that can interact onchain using the Sonic Agent Kit.
        Focus on providing trading advice, market analysis, and executing trades.
        When discussing trading strategies, consider risk management and market conditions.
        Provide detailed explanations for your trading recommendations.
        If someone wants to swap tokens, guide them through the process step by step.
        Be concise but thorough with your trading-related responses.
      `,
    });

    // Portfolio-focused agent
    portfolioAgent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a portfolio management specialist that can interact onchain using the Sonic Agent Kit.
        Focus on analyzing portfolio composition, performance metrics, and optimization strategies.
        When discussing portfolio management, consider diversification, risk exposure, and long-term goals.
        Provide detailed analysis of portfolio holdings and performance.
        Help users track their investments and suggest improvements to their portfolio allocation.
        Be data-driven and analytical in your portfolio-related responses.
      `,
    });

    // Market analysis agent
    marketAgent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a market analysis expert that can interact onchain using the Sonic Agent Kit.
        Focus on providing market trends, price predictions, and news analysis.
        When discussing market conditions, consider macroeconomic factors, on-chain metrics, and sentiment analysis.
        Provide detailed explanations of market movements and potential catalysts.
        Help users understand the broader market context for their investment decisions.
        Be insightful and forward-looking in your market-related responses.
      `,
    });

    agentsInitialized = true;
  } catch (error) {
    console.error("Failed to initialize agents:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();
    
    // Initialize agents if needed
    if (!agentsInitialized) {
      await initializeAgents();
    }

    // Select the appropriate agent based on mode
    const agent = getAgentForMode(mode);
    
    // Process the last message to check for crypto actions
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      const cryptoAction = await detectCryptoAction(lastMessage.content);
      if (cryptoAction) {
        // Format the response with the crypto action
        const response = formatCryptoResponse(cryptoAction);
        return new Response(JSON.stringify({ response }));
      }
    }

    // If no crypto action detected, proceed with normal chat
    const response = await agent.chat(messages);
    return new Response(JSON.stringify({ response }));
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat message' }), { status: 500 });
  }
}

// Add these helper functions
async function detectCryptoAction(message: string): Promise<CryptoAction | null> {
  const lowerMessage = message.toLowerCase();
  
  // Check for swap intent
  if (lowerMessage.includes('swap') || lowerMessage.includes('exchange')) {
    const tokens = extractTokens(message);
    if (tokens.from && tokens.to) {
      return {
        type: 'swap',
        data: {
          fromToken: tokens.from,
          toToken: tokens.to,
          estimatedAmount: await getEstimatedSwapAmount(tokens.from, tokens.to),
        },
        message: `Would you like to swap ${tokens.from} for ${tokens.to}?`,
      };
    }
  }
  
  // Check for stake intent
  if (lowerMessage.includes('stake') || lowerMessage.includes('staking')) {
    const token = extractToken(message);
    if (token) {
      return {
        type: 'stake',
        data: {
          token,
          apy: await getStakingAPY(token),
        },
        message: `Would you like to stake ${token}? Current APY:`,
      };
    }
  }
  
  // Check for token info intent
  if (lowerMessage.includes('price') || lowerMessage.includes('info')) {
    const token = extractToken(message);
    if (token) {
      return {
        type: 'tokenInfo',
        data: await getTokenInfo(token),
        message: `Here's the current information for ${token}:`,
      };
    }
  }
  
  return null;
}

function formatCryptoResponse(action: CryptoAction): string {
  return `${action.message}\n{{CRYPTO_ACTION:${JSON.stringify(action)}}}`;
}

// Placeholder functions - implement these with actual API calls
async function getEstimatedSwapAmount(fromToken: string, toToken: string): Promise<number> {
  // Implement with actual DEX API
  return 0;
}

async function getStakingAPY(token: string): Promise<number> {
  // Implement with actual staking protocol API
  return 0;
}

async function getTokenInfo(token: string): Promise<TokenData> {
  // Implement with actual price feed API
  return {
    symbol: token,
    price: 0,
    change24h: 0,
  };
}

// Replace the extractTokens function
function extractTokens(message: string): { from?: string; to?: string } {
  const words = message.toUpperCase().split(/\s+/);
  let fromToken: string | undefined;
  let toToken: string | undefined;

  // Look for patterns like "swap X for Y" or "exchange X to Y"
  for (let i = 0; i < words.length; i++) {
    if (COMMON_TOKENS.has(words[i])) {
      if (!fromToken) {
        fromToken = words[i];
      } else if (!toToken && fromToken !== words[i]) {
        toToken = words[i];
        break;
      }
    }
  }

  // If we didn't find both tokens using the first method, try looking for amounts
  if (!fromToken || !toToken) {
    const tokenPattern = /(\d+(?:\.\d+)?\s*([A-Z]{2,10}))/g;
    const matches = [...message.toUpperCase().matchAll(tokenPattern)];
    
    matches.forEach((match, index) => {
      const token = match[2];
      if (COMMON_TOKENS.has(token)) {
        if (index === 0 && !fromToken) {
          fromToken = token;
        } else if (index === 1 && !toToken && token !== fromToken) {
          toToken = token;
        }
      }
    });
  }

  return { from: fromToken, to: toToken };
}

// Replace the extractToken function
function extractToken(message: string): string | null {
  const words = message.toUpperCase().split(/\s+/);
  
  // First try to find a token from our common tokens list
  for (const word of words) {
    if (COMMON_TOKENS.has(word)) {
      return word;
    }
  }
  
  // Then try to find a token that follows an amount
  const tokenPattern = /(\d+(?:\.\d+)?\s*([A-Z]{2,10}))/g;
  const matches = [...message.toUpperCase().matchAll(tokenPattern)];
  
  if (matches.length > 0) {
    const token = matches[0][2];
    if (COMMON_TOKENS.has(token)) {
      return token;
    }
  }
  
  return null;
}

function getAgentForMode(mode: string) {
  switch (mode) {
    case "trading":
      return tradingAgent;
    case "portfolio":
      return portfolioAgent;
    case "market":
      return marketAgent;
    default:
      return generalAgent;
  }
} 