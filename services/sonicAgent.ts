import { SonicAgentKit, createSonicTools } from "@sendaifun/sonic-agent-kit";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

export class SonicAgentService {
  private agent: any;
  private config: any;

  constructor() {
    this.agent = null;
    this.config = null;
  }

  async initialize() {
    try {
      const llm = new ChatOpenAI({
        modelName: "gpt-4-mini",
        temperature: 0.7,
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
      });

      const sonicAgent = new SonicAgentKit(
        process.env.NEXT_PUBLIC_SONIC_PRIVATE_KEY!,
        process.env.NEXT_PUBLIC_RPC_URL!,
        {
          OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
        }
      );

      const tools = createSonicTools(sonicAgent);
      const memory = new MemorySaver();
      this.config = { configurable: { thread_id: "Sonic Agent Kit!" } };

      this.agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
          You are a helpful agent that can interact onchain using the Sonic Agent Kit.
          You are empowered to interact onchain using your tools.
          Be concise and helpful with your responses.
        `,
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize Sonic agent:", error);
      return false;
    }
  }

  async processMessage(message: string) {
    if (!this.agent) {
      throw new Error("Agent not initialized");
    }

    try {
      const stream = await this.agent.stream(
        { messages: [new HumanMessage(message)] },
        this.config
      );

      const responses = [];
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          responses.push(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          responses.push(chunk.tools.messages[0].content);
        }
      }

      return responses.join("\n");
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }
}

export const sonicAgent = new SonicAgentService(); 