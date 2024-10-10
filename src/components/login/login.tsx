"use client";
import { AI_NAME } from "@/features/theme/customise";
import { signIn } from "next-auth/react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useEffect } from "react";
import { userSession } from "@/features/auth/helpers";

export const LogIn = () => {
  useEffect(() => {
    const testLogin = async () => {
      try {
        let session = await userSession();
        console.log("session", session);
      } catch (error) {
        signIn("azure-ad");
      }
    };
    testLogin();
  }, []);

  return (
    <Card className="flex gap-2 flex-col min-w-[300px]">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl flex gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={"ai-avatar.417.png"} />
          </Avatar>
          <span className="text-primary">{AI_NAME}</span>
        </CardTitle>
        <CardDescription>
          <p>Automatically logging you in.</p>
          <p>
            If this screen is visible for an extended period of time you can try
            to manually login in with your Netchex account.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button onClick={() => signIn("azure-ad")}>Log In</Button>
      </CardContent>
    </Card>
  );
};
