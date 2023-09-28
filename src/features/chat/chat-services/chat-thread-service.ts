"use server";
import "server-only";

import { userHashedId, userSession } from "@/features/auth/helpers";
import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { SqlQuerySpec } from "@azure/cosmos";
import { nanoid } from "nanoid";
import { initDBContainer } from "../../common/cosmos";
import {
	CHAT_THREAD_ATTRIBUTE,
	ChatMessageModel,
	ChatThreadModel,
	ChatType,
	ConversationStyle,
	LLMModel,
	PromptGPTProps,
	GPT_3_5,
	GPT_4,
	NEW_CHAT_DEFAULT_NAME
} from "./models";


export const FindAllChatThreadForCurrentUser = async () => {
	const container = await initDBContainer();

	const querySpec: SqlQuerySpec = {
		query:
			"SELECT * FROM root r WHERE r.type=@type AND r.userId=@userId AND r.isDeleted=@isDeleted ORDER BY r.createdAt DESC",
		parameters: [
			{
				name: "@type",
				value: CHAT_THREAD_ATTRIBUTE,
			},
			{
				name: "@userId",
				value: await userHashedId(),
			},
			{
				name: "@isDeleted",
				value: false,
			},
		],
	};

	const { resources } = await container.items
		.query<ChatThreadModel>(querySpec, {
			partitionKey: await userHashedId(),
		})
		.fetchAll();
	return resources;
};

export const FindChatThreadByID = async (id: string) => {
	const container = await initDBContainer();

	const querySpec: SqlQuerySpec = {
		query:
			"SELECT * FROM root r WHERE r.type=@type AND r.userId=@userId AND r.id=@id AND r.isDeleted=@isDeleted",
		parameters: [
			{
				name: "@type",
				value: CHAT_THREAD_ATTRIBUTE,
			},
			{
				name: "@userId",
				value: await userHashedId(),
			},
			{
				name: "@id",
				value: id,
			},
			{
				name: "@isDeleted",
				value: false,
			},
		],
	};

	const { resources } = await container.items
		.query<ChatThreadModel>(querySpec)
		.fetchAll();

	return resources;
};

export const SoftDeleteChatThreadByID = async (chatThreadID: string) => {
	const container = await initDBContainer();

	const threads = await FindChatThreadByID(chatThreadID);

	if (threads.length !== 0) {
		const chats = await FindAllChats(chatThreadID);

		chats.forEach(async (chat) => {
			const itemToUpdate = {
				...chat,
			};
			itemToUpdate.isDeleted = true;
			await container.items.upsert(itemToUpdate);
		});

		threads.forEach(async (thread) => {
			const itemToUpdate = {
				...thread,
			};
			itemToUpdate.isDeleted = true;
			await container.items.upsert(itemToUpdate);
		});
	}
};

export const EnsureChatThreadIsForCurrentUser = async (
	chatThreadID: string
) => {
	const modelToSave = await FindChatThreadByID(chatThreadID);
	if (modelToSave.length === 0) {
		throw new Error("Chat thread not found");
	}

	return modelToSave[0];
};

export const UpsertChatThread = async (chatThread: ChatThreadModel) => {
	const container = await initDBContainer();
	const updatedChatThread = await container.items.upsert<ChatThreadModel>(
		chatThread
	);

	if (updatedChatThread === undefined) {
		throw new Error("Chat thread not found");
	}

	return updatedChatThread.resource;
};

export const updateChatThreadTitle = async (
	chatThread: ChatThreadModel,
	messages: ChatMessageModel[],
	modelName: LLMModel,
	chatType: ChatType,
	conversationStyle: ConversationStyle,
	userMessage: string
) => {
	if (messages.length === 0) {
		const updatedChatThreadResource = await UpsertChatThread({
			...chatThread,
			model: modelName,
			chatType: chatType,
			conversationStyle: conversationStyle,
			name: chatThread.name === NEW_CHAT_DEFAULT_NAME 
				? userMessage.substring(0, 30) 
				: chatThread.name,
		});

		return updatedChatThreadResource!;
	}

	return chatThread;
};

export const CreateChatThread = async () => {
	const modelToSave: ChatThreadModel = {
		name: NEW_CHAT_DEFAULT_NAME,
		userName: (await userSession())!.name,
		userId: await userHashedId(),
		id: nanoid(),
		createdAt: new Date(),
		isDeleted: false,
		chatType: "simple",
		model: GPT_3_5,
		conversationStyle: "balanced",
		type: CHAT_THREAD_ATTRIBUTE,
	};

	const container = await initDBContainer();
	const response = await container.items.create<ChatThreadModel>(modelToSave);
	return response.resource;
};

export const initAndGuardChatSession = async (props: PromptGPTProps) => {
	const { messages, id, model, chatType, conversationStyle } = props;

	//last message
	const lastHumanMessage = messages[messages.length - 1];

	const currentChatThread = await EnsureChatThreadIsForCurrentUser(id);
	const chats = await FindAllChats(id);

	const chatThread = await updateChatThreadTitle(
		currentChatThread,
		chats,
		model,
		chatType,
		conversationStyle,
		lastHumanMessage.content
	);

	return {
		id,
		lastHumanMessage,
		chats,
		chatThread,
	};
};
