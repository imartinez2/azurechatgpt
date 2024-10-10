import Typography from "@/components/typography";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { AI_NAME } from "@/features/theme/customise";
import Image from "next/image";
import { FC } from "react";
import { NewChat } from "../chat-menu/new-chat";

interface Prop {}

export const StartNewChat: FC<Prop> = (props) => {
  return (
    <div className="flex gap-2 flex-col justify-between p-4">
      <Card className="flex flex-col gap-4 p-4">
        <CardTitle className="mb-2 text-xl font-medium leading-tight">
          Who is {AI_NAME}?
        </CardTitle>
        <CardContent className="flex flex-row gap-2 pb-0">
          <Image
            width={180}
            height={180}
            alt={AI_NAME}
            src="/ai-avatar.417.png"
            className="h-auto max-w-full rounded-lg shadow-lg dark:shadow-black/30"
          />
          <div className="flex flex-col gap-2 ml-4 mr-4">
            <p>
              Hey! I'm your {AI_NAME} assistant. You should interact in a
              friendly manner with the AI assistant and refrain from
              participating in any harmful activities.
            </p>
            <p>
              You can start a new chat with me by clicking the button below.
            </p>
          </div>
        </CardContent>
        <CardFooter className="-mx-4 -mb-8 flex flex-row justify-end">
          <NewChat className="w-[156px]" />
        </CardFooter>
      </Card>
    </div>
  );
};
