import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { BarChartHorizontalBig, BookMarked } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "../user-profile";

export const MainMenu = () => {
  return (
    <div className="flex gap-2 lg:flex-col md:flex-col justify-between">
      <div className="flex gap-2 lg:flex-col md:flex-col justify-between">
        <Link
          href="/"
          className="w-10 h-10 items-center justify-center flex"
          title="Home"
        >
          <Avatar className="">
            <AvatarImage src="/ncx-icon.png" />
          </Avatar>
        </Link>

        <Link
          href="/about"
          className="w-10 h-10 items-center justify-center flex"
          title="About"
        >
          <BookMarked size={24} />
        </Link>

        {/* TODO: Re-add feature later
        <Link
          href="/reporting"
          className="w-10 h-10 items-center justify-center flex rounded-full hover:bg-secondary"
          title="Reporting"
        >
          <BarChartHorizontalBig size={20} />
        </Link> */}
      </div>
      <UserProfile />
    </div>
  );
};
