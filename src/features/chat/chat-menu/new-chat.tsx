"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateChatThread } from "../chat-services/chat-thread-service";
import { FC } from "react";
import { cn } from "@/lib/utils";

interface Prop {
  className?: string;
}

export const NewChat: FC<Prop> = (props) => {
  const router = useRouter();
  const startNewChat = async () => {
    try {
      const newChatThread = await CreateChatThread();
      if (newChatThread) {
        router.push("/chat/" + newChatThread.id);
        router.refresh();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Button
      className = {cn("gap-2", props.className)}
      variant={"outline"}
      size={"sm"}
      onClick={() => startNewChat()}
      {...props}
    >
      <PlusCircle size={16} /> New chat
    </Button>
  );
};
