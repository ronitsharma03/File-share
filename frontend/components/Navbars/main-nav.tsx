"use client";

import { cn } from "@/lib/utils";
import { FileIcon, HomeIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <FileIcon className="text-primary h-6 w-6" />
        <span className="hidden font-bold sm:inline-block ">FileShare</span>
      </Link>

      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-1">
            <HomeIcon className="h-4 w-4" />
            <span className="">Home</span>
          </div>
        </Link>
        <Link
          href="/settings"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/settings" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="flex gap-1 items-center">
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </div>
        </Link>

        <button onClick={() => {
          
        }}></button>
      </nav>
    </div>
  );
}
