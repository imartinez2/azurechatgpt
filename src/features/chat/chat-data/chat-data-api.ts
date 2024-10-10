import { userHashedId } from "@/features/auth/helpers";
import { CosmosDBChatMessageHistory } from "@/features/langchain/memory/cosmosdb/cosmosdb";
import { LangChainStream, StreamingTextResponse } from "ai";
import { loadQAMapReduceChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferWindowMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { AzureCogSearch } from "../../langchain/vector-stores/azure-cog-search/azure-cog-vector-store";
import { insertPromptAndResponse } from "../chat-services/chat-service";
import { initAndGuardChatSession } from "../chat-services/chat-thread-service";
import { FaqDocumentIndex, PromptGPTProps } from "../chat-services/models";
import { transformConversationStyleToTemperature } from "../chat-services/utils";
import { AI_NAME } from "@/features/theme/customise";

export const ChatData = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chatThread } = await initAndGuardChatSession(
    props
  );

  const chatModel = new ChatOpenAI({
    temperature: transformConversationStyleToTemperature(
      chatThread.conversationStyle
    ),
    streaming: true,
  });

  const relevantDocuments = await findRelevantDocuments(
    lastHumanMessage.content,
    id
  );

  const chain = loadQAMapReduceChain(chatModel, {
    combinePrompt: defineSystemPrompt(),
  });

  const { stream, handlers } = LangChainStream({
    onCompletion: async (completion: string) => {
      await insertPromptAndResponse(id, lastHumanMessage.content, completion);
    },
  });

  const userId = await userHashedId();

  const memory = new BufferWindowMemory({
    k: 100,
    returnMessages: true,
    memoryKey: "history",
    chatHistory: new CosmosDBChatMessageHistory({
      sessionId: id,
      userId: userId,
    }),
  });

  chain.call(
    {
      input_documents: relevantDocuments,
      question: lastHumanMessage.content,
      memory: memory,
    },
    [handlers]
  );

  return new StreamingTextResponse(stream);
};

const findRelevantDocuments = async (query: string, chatThreadId: string) => {
  const vectorStore = initVectorStore();

  const relevantDocuments = await vectorStore.similaritySearch(query, 10, {
    vectorFields: vectorStore.config.vectorFieldName,
    filter: `user eq '${await userHashedId()}' and chatThreadId eq '${chatThreadId}'`,
  });

  return relevantDocuments;
};

const defineSystemPrompt = () => {
  const system_combine_template = `- You are ${AI_NAME}, a helpful AI Assistant created by Netchex, a cloud-based payroll and HCM (Human Capital Management) system designed to help businesses of all sizes manage the entire employee lifecycle—from recruitment to retirement. Founded in 2003, Netchex payroll software has become one of the industry's fastest-growing payroll and HR service providers. Netchex gives users the flexibility to manage the employee lifecycle anytime, anywhere, via any internet-enabled device, including mobile devices. With a dedicated employee self-service portal, Netchex empowers employees to access real-time information, including: Payroll, Time, Benefits, HR, PTO requests, Pay stubs, Withholdings, Tax documents.
  - You are intended for use by Netchex employees only.
  - Help users find information, troubleshoot issues with detailed mitigation steps and recommendations!
  - Always respond truthfully, accurately, and with detail, in a polite, professional tone.
  - Embed reference links, where appropriate.
  - Netchex Company URL: https://netchex.com
  - Netchex Application URL: https://netchexonline.net
  Given the following context and a question, create a final answer.
  If the context is empty or If you don't know the answer, politely decline to answer the question. Don't try to make up an answer.
  ----------------
  context: {summaries}`;

  const combine_messages = [
    SystemMessagePromptTemplate.fromTemplate(system_combine_template),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ];
  const CHAT_COMBINE_PROMPT =
    ChatPromptTemplate.fromPromptMessages(combine_messages);

  return CHAT_COMBINE_PROMPT;
};

const initVectorStore = () => {
  const embedding = new OpenAIEmbeddings();
  const azureSearch = new AzureCogSearch<FaqDocumentIndex>(embedding, {
    name: process.env.AZURE_SEARCH_NAME,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME,
    apiKey: process.env.AZURE_SEARCH_API_KEY,
    apiVersion: process.env.AZURE_SEARCH_API_VERSION,
    vectorFieldName: "embedding",
  });

  return azureSearch;
};
