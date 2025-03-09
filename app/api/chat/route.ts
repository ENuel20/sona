import { SonicAgentKit, createSonicTools } from "@sendaifun/sonic-agent-kit";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";

// Initialize agent as a singleton
let agent: any = null;
let config: any = null;

async function initializeAgent() {
  if (agent) return;

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

    agent = createReactAgent({
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
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    // Check if environment variables are set
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!process.env.SONIC_PRIVATE_KEY) {
      console.error("Missing SONIC_PRIVATE_KEY");
      return NextResponse.json(
        { error: "Sonic private key not configured" },
        { status: 500 }
      );
    }

    if (!process.env.RPC_URL) {
      console.error("Missing RPC_URL");
      return NextResponse.json(
        { error: "RPC URL not configured" },
        { status: 500 }
      );
    }

    await initializeAgent();
    
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not initialized" },
        { status: 500 }
      );
    }

    const { message } = await req.json();

    const stream = await agent.stream(
      { messages: [new HumanMessage(message)] },
      config
    );

    const responses = [];
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        responses.push(chunk.agent.messages[0].content);
      } else if ("tools" in chunk) {
        responses.push(chunk.tools.messages[0].content);
      }
    }

    return NextResponse.json({ response: responses.join("\n") });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
} 