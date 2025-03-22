"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { FileIcon, HomeIcon, Menu, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [isOpen, setOpen] = useState<boolean>(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden mr-4">
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <div className="px-7 flex">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setOpen(false)}
            >
              <div className="flex items-center mt-4 gap-1">
                <FileIcon className="h-6 w-6 text-primary" />
                <span className="font-bold">FileShare</span>
              </div>
            </Link>
          </div>
          <nav className="mt-8 flex flex-col gap-4 px-7">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                pathname === "/settings"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <SettingsIcon className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
