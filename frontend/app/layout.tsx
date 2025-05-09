"use client";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/context/ThemeProvider";
import MainNav from "@/components/Navbars/main-nav";
import MobileNav from "@/components/Navbars/mobile-nav";
import { UserNav } from "@/components/Navbars/user-nav";



const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              <header className="sticky top-0 z-40 border-b-2 border-zinc-700 bg-background">
                <div className="flex h-16 items-center justify-between py-4 ">
                  <div className="lg:ml-56 ml-10">
                    <MainNav />
                  </div>
                  <div className="hidden md:flex mr-4">
                    <UserNav />
                  </div>
                  <MobileNav />
                </div>
              </header>
              <main className="flex-1 space-y-4 p-8 pt-6 lg:ml-46">
                <div className="container">{children}</div>
              </main>
            </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
