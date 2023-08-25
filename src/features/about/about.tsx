import Link from "next/link";
import Image from "next/image";
import { Azure } from "azure-react-icons";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { AI_NAME } from "@/features/theme/customise";
import { NewChat } from "../chat/chat-menu/new-chat";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const About = () => {
  return (
    <div className="h-full rounded-md overflow-y-auto">
      <div className="flex gap-2 flex-col justify-between">
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
              className="max-w-full h-fit rounded-lg shadow-lg dark:shadow-black/30"
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
            <NewChat className="w-[150px]" />
          </CardFooter>
        </Card>

        <Card className="flex flex-col gap-4 p-4">
          <CardTitle className="mb-2 text-xl font-medium leading-tight">
            Why is it so great?
          </CardTitle>
          <CardContent className="flex flex-row gap-2 pb-0">
            <div className="flex flex-col gap-2">
              <section>
                <div className="flex flex-col gap-4">
                  <div className="mb-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <CheckCircle size={22} />
                      </div>
                      <div className="ml-2 grow">
                        <p className="mb-1 font-bold">
                          Powerful Infrastructure
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-300">
                          leverages the robust and scalable infrastructure of
                          Microsoft Azure, providing high-performance resources
                          for workloads.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <CheckCircle size={22} />
                      </div>
                      <div className="ml-2 grow">
                        <p className="mb-1 font-bold">
                          Integration with Azure Services
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-300">
                          seamlessly integrates with various Azure services,
                          allowing for a wide range of tools, data storage, and
                          analytics capabilities.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <CheckCircle size={22} />
                      </div>
                      <div className="ml-2 grow">
                        <p className="mb-1 font-bold">OpenAI models</p>
                        <p className="text-neutral-500 dark:text-neutral-300">
                          provides access to OpenAI's models, enabling
                          developers to leverage advanced natural language
                          processing for applications.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <CheckCircle size={22} />
                      </div>
                      <div className="ml-2 grow">
                        <p className="mb-1 font-bold">
                          Enterprise-Grade Security
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-300">
                          prioritizes security and compliance, providing robust
                          data protection and ensures compliance for enterprise
                          users.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <CheckCircle size={22} />
                      </div>
                      <div className="ml-2 grow">
                        <p className="mb-1 font-bold">Azure Machine Learning</p>
                        <p className="text-neutral-500 dark:text-neutral-300">
                          integrates with Azure Machine Learning, enabling users
                          to leverage its powerful features for model training,
                          deployment, and management.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
          <CardFooter className="-mx-4 -mb-8 flex flex-row justify-end">
            {/* <NewChat className="w-[150px]" /> */}
          </CardFooter>
        </Card>

        <Card className="flex flex-col gap-4 p-4">
          <CardTitle className="mb-2 text-xl font-medium leading-tight">
            Data, privacy, and security for Azure OpenAI Service
          </CardTitle>
          <CardContent className="flex flex-row gap-2 pb-0">
            <div className="flex flex-col gap-2">
              <p>
                This article provides details regarding how data provided by you
                to the Azure OpenAI service is processed, used, and stored.
                Azure OpenAI stores and processes data to provide the service
                and to monitor for uses that violate the applicable product
                terms.
              </p>
            </div>
          </CardContent>
          <CardFooter className="-mx-4 -mb-8 flex flex-row justify-end">
            <Button asChild variant={"outline"} className="gap-2 w-[150px]">
              <Link
                target="_blank"
                href="https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy"
                className="flex gap-2"
              >
                <Azure size={22} /> Read Article
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
