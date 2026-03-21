import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import IntercomInitializer from "@/components/intercom/IntercomInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "vF Community — Social Network for D2C Founders",
  description: "Built for Hustlers by vFulfill",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <TooltipProvider>
            {children}
            <IntercomInitializer />
          </TooltipProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
