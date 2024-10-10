
import { Card } from "@/components/ui/card";
import { About } from "@/features/about/about";

export default async function Home() {
  return (
    <Card className="h-full items-start p-4 flex justify-center">
      <About />
    </Card>
  );
}
