"use server";

import { userHashedId } from "@/features/auth/helpers";
import { initDBContainer } from "@/features/common/posgres";
import { AzureCogSearch } from "@/features/langchain/vector-stores/azure-cog-search/azure-cog-vector-store";
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { nanoid } from "nanoid";
import {
  CHAT_DOCUMENT_ATTRIBUTE,
  ChatDocumentModel,
  FaqDocumentIndex,
} from "./models";
import { PgVectorSearch } from "@/features/langchain/vector-stores/pgvector/pgvector-store";
import { ChatDocument } from "@prisma/client";
import AdmZip from "adm-zip";

const MAX_DOCUMENT_SIZE = 20000000;

export const UploadDocument = async (formData: FormData) => {
  const { docs, file, chatThreadId } = await LoadFile(formData);
  console.log("file loaded", docs, file, chatThreadId);
  const splitDocuments = await SplitDocuments(docs);
  console.log("document split");
  const docPageContents = splitDocuments.map((item) => item.pageContent);
  console.log("split do mapped");
  await IndexDocuments(file, docPageContents, chatThreadId);
  console.log("indexed");
  return file.name;
};

const LoadFile = async (formData: FormData) => {
  const file: File | null = formData.get("file") as unknown as File;
  const chatThreadId: string = formData.get("id") as unknown as string;
  console.log("file", file);
  if (file && file.size < MAX_DOCUMENT_SIZE) {
    if (file.type == "application/zip") {
      const blob = new Blob([file], { type: file.type });
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let zip = new AdmZip(buffer);
      const entries = zip.getEntries();
      const docs: Document[] = [];
      entries.forEach(function (zipEntry) {
        console.log(zipEntry.getData().toString("utf8")); // outputs zip entries information
        const data = zipEntry.getData().toString("utf8");
        const doc: Document = {
          pageContent: data,
          metadata: {
            file: zipEntry.name,
          },
        };
        docs.push(doc);
      });
      return { docs, file, chatThreadId };
    }
    if (file.type == "text/markdown") {
      const docs: Document[] = [];
      const data = await file.text();
      console.log("md data", data);
      const doc: Document = {
        pageContent: data,
        metadata: {
          file: file.name,
        },
      };
      docs.push(doc);
      return { docs, file, chatThreadId };
    } else {
      const client = initDocumentIntelligence();

      const blob = new Blob([file], { type: file.type });

      const poller = await client.beginAnalyzeDocument(
        "prebuilt-document",
        await blob.arrayBuffer()
      );

      const { paragraphs } = await poller.pollUntilDone();

      const docs: Document[] = [];

      if (paragraphs) {
        for (const paragraph of paragraphs) {
          const doc: Document = {
            pageContent: paragraph.content,
            metadata: {
              file: file.name,
            },
          };
          docs.push(doc);
        }
      } else {
        throw new Error("No content found in document.");
      }

      return { docs, file, chatThreadId };
    }
  }
  throw new Error("Invalid file format or size. Only PDF files are supported.");
};

const SplitDocuments = async (docs: Array<Document>) => {
  const allContent = docs.map((doc) => doc.pageContent).join("\n");
  const splitter = new RecursiveCharacterTextSplitter();
  const output = await splitter.createDocuments([allContent]);
  return output;
};

const IndexDocuments = async (
  file: File,
  docs: string[],
  chatThreadId: string
) => {
  const vectorStore = initAzureSearchVectorStore();
  console.log("initialized azure search vector store");
  const documentsToIndex: FaqDocumentIndex[] = [];
  let index = 0;
  for (const doc of docs) {
    const docToAdd: FaqDocumentIndex = {
      id: nanoid(),
      chatThreadId,
      user: await userHashedId(),
      pageContent: doc,
      metadata: file.name,
      embedding: [],
    };

    documentsToIndex.push(docToAdd);
    index++;
  }
  console.log("after loop");
  await vectorStore.addDocuments(documentsToIndex);
  console.log("added document to store");
  await UpsertChatDocument(file.name, chatThreadId);
};

export const initAzureSearchVectorStore = () => {
  const embedding = new OpenAIEmbeddings();
  const azureSearch = new PgVectorSearch<FaqDocumentIndex>(embedding, {
    name: process.env.AZURE_SEARCH_NAME,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME,
    vectorFieldName: "vector",
  });

  return azureSearch;
};

export const initDocumentIntelligence = () => {
  const client = new DocumentAnalysisClient(
    process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY),
    {
      apiVersion: "2022-08-31",
    }
  );

  return client;
};

export const UpsertChatDocument = async (
  fileName: string,
  chatThreadID: string
) => {
  const modelToSave: ChatDocument = {
    chatThreadId: chatThreadID,
    id: nanoid(),
    userId: await userHashedId(),
    createdAt: new Date(),
    type: CHAT_DOCUMENT_ATTRIBUTE,
    isDeleted: false,
    name: fileName,
  };

  const container = await initDBContainer();
  await container.chatDocument.createMany({
    data: [modelToSave],
    skipDuplicates: true,
  });
  //await container.items.upsert(modelToSave);
};
