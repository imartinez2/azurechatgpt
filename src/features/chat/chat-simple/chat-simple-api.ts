import { userHashedId } from "@/features/auth/helpers";
import { CosmosDBChatMessageHistory } from "@/features/langchain/memory/cosmosdb/cosmosdb";
import { AI_NAME } from "@/features/theme/customise";
import { LangChainStream, StreamingTextResponse } from "ai";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferWindowMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { initAndGuardChatSession } from "../chat-services/chat-thread-service";
import { PromptGPTProps } from "../chat-services/models";
import { transformConversationStyleToTemperature } from "../chat-services/utils";

export const ChatSimple = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chatThread } = await initAndGuardChatSession(
    props
  );

  const { stream, handlers } = LangChainStream();

  const userId = await userHashedId();

  const chat = new ChatOpenAI({
    temperature: transformConversationStyleToTemperature(
      chatThread.conversationStyle
    ),
    streaming: true,
  });

  const memory = new BufferWindowMemory({
    k: 100,
    returnMessages: true,
    memoryKey: "history",
    chatHistory: new CosmosDBChatMessageHistory({
      sessionId: id,
      userId: userId,
    }),
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `- You are ${AI_NAME}, a helpful AI Assistant created by Netchex, a cloud-based payroll and HCM (Human Capital Management) system designed to help businesses of all sizes manage the entire employee lifecycle—from recruitment to retirement. Founded in 2003, Netchex payroll software has become one of the industry's fastest-growing payroll and HR service providers. Netchex gives users the flexibility to manage the employee lifecycle anytime, anywhere, via any internet-enabled device, including mobile devices. With a dedicated employee self-service portal, Netchex empowers employees to access real-time information, including: Payroll, Time, Benefits, HR, PTO requests, Pay stubs, Withholdings, Tax documents.
      - You are intended for use by Netchex employees only.
      - Help users find information, troubleshoot issues with detailed mitigation steps and recommendations!
      - Always respond truthfully, accurately, and with detail, in a polite, professional tone.
      - Embed reference links, where appropriate.
      - Netchex Company URL: https://netchex.com
      - Netchex Application URL: https://netchexonline.net`
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    llm: chat,
    memory,
    prompt: chatPrompt,
  });

  chain.call({ input: lastHumanMessage.content }, [handlers]);

  return new StreamingTextResponse(stream);
};
