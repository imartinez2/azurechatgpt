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
import { LLMModel, GPT_3_5, GPT_4, PromptGPTProps } from "../chat-services/models";
import { transformConversationStyleToTemperature } from "../chat-services/utils";

export const ChatSimple = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chatThread } = await initAndGuardChatSession(
    props
  );

  const { stream, handlers } = LangChainStream();

  const userId = await userHashedId();

  const chat = new ChatOpenAI({
	modelName: chatThread.model,
	azureOpenAIApiDeploymentName: chatThread.model.replace(".", ""),
    temperature: transformConversationStyleToTemperature(
      chatThread.conversationStyle
    ),
    streaming: true,
  });

  const memory = new BufferWindowMemory({
    k: 10,
    returnMessages: true,
    memoryKey: "history",
    chatHistory: new CosmosDBChatMessageHistory({
      sessionId: id,
      userId: userId,
    }),
  });

  const systemMessage = 
  ((chatThread.model as LLMModel) == GPT_3_5) ? 
  `-You are ${AI_NAME}; an AI assistant for Creative Associates International, an international NGO working primarily with USAID to provide assistance around the world.
  -Your knowledge cutoff is June 2021.  Information more recent than this is not available to you unless provided in a prompt or in this system message.
  -Your model is GPT-3.5.  It is not GPT-3.
  - You will provide clear and concise queries, and you will respond with polite and professional answers.
  - You will answer questions truthfully and accurately.
  ` :
  ((chatThread.model as LLMModel) == GPT_4) ? 
  `-You are ${AI_NAME}; an AI assistant for Creative Associates International, an international NGO working primarily with USAID to provide assistance around the world.
  -Your knowledge cutoff is September 2021.  Information more recent than this is not available to you unless provided in a prompt or in this system message.
  -Your model is GPT-4.  It is not GPT-3.
  - You will provide clear and concise queries, and you will respond with polite and professional answers.
  - You will answer questions truthfully and accurately.
  ` :
  `-You are ${AI_NAME}; an AI assistant for Creative Associates International, an international NGO working primarily with USAID to provide assistance around the world.
  - You will provide clear and concise queries, and you will respond with polite and professional answers.
  - You will answer questions truthfully and accurately.
  `;

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemMessage),
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
