"use client";
import { MenuItem } from "@/components/menu";
import { Button } from "@/components/ui/button";
import { SoftDeleteChatThreadByID, UpsertChatThread } from "@/features/chat/chat-services/chat-thread-service";
import { FileText, MessageCircle, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { FC, useState } from "react";
import { ChatThreadModel } from "../chat-services/models";

interface Prop {
	menuItems: Array<ChatThreadModel>;
}

export const MenuItems: FC<Prop> = (props) => {
	const { id } = useParams();
	const router = useRouter();
	const [editMode, setEditMode] = useState<string | null>(null);

	const handleDelete = async (threadID: string) => {
		await SoftDeleteChatThreadByID(threadID);
		router.refresh();
		router.replace("/chat");
	};

	const handleItemClick = (e: React.MouseEvent, threadId: string) => {
		e.preventDefault();
		if (id === threadId && editMode !== threadId) {
			setEditMode(threadId);
		} else {
			router.push("/chat/" + threadId);
		}
	};

	const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>, threadId: string) => {
		const newName = e.target.value;

		// Find the chat thread that needs to be updated
		const threadToBeUpdated = props.menuItems.find(thread => thread.id === threadId);

		if (threadToBeUpdated) {
			// Update the name of the chat thread
			threadToBeUpdated.name = newName;
			
			// Update the chat thread on the server
			await UpsertChatThread({
				...threadToBeUpdated,
				name: newName
			});

			// Refresh the router
			router.refresh();
		}
		
		setEditMode(null);
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, threadId: string, originalName: string) => {
		if (e.key === 'Enter') {
			handleNameChange(e as any, threadId);
			setEditMode(null);
		} else if (e.key === 'Escape') {
			(e.target as HTMLInputElement).value = originalName;
			setEditMode(null);
		}
	}

	return (
		<>
			{props.menuItems.map((thread) => (
				<MenuItem
					href={"/chat/" + thread.id}
					isSelected={id === thread.id}
					key={thread.id}
					className="justify-between group/item"
					onClick={(e) => { handleItemClick(e, thread.id) }}
				>
					{thread.chatType === "data" ? (
						<FileText
							size={16}
							className={id === thread.id ? " text-brand" : ""}
						/>
					) : (
						<MessageCircle
							size={16}
							className={id === thread.id ? " text-brand" : ""}
						/>
					)}

					<span className="flex gap-2 items-center overflow-hidden flex-1">
						{editMode === thread.id ? (
							<input
								className="w-full"
								type="text"
								defaultValue={thread.name}
								onBlur={(e) => handleNameChange(e, thread.id)}
								onKeyDown={(e) => handleKeyDown(e, thread.id, thread.name)}
							/>
						) : (
							<span className="overflow-ellipsis truncate">{thread.name}</span>
						)}
					</span>
					<Button
						className="invisible group-hover/item:visible hover:text-brand"
						size={"sm"}
						variant={"ghost"}
						onClick={async (e) => {
							e.preventDefault();
							const yesDelete = confirm(
								"Are you sure you want to delete this chat?"
							);
							if (yesDelete) {
								await handleDelete(thread.id);
							}
						}}
					>
						<Trash size={16} />
					</Button>
				</MenuItem>
			))}
		</>
	);
};
