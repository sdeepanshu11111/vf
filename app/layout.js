import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import IntercomInitializer from "@/components/intercom/IntercomInitializer";
import AuthPromptProvider from "@/components/auth/AuthPromptProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "vF Community — Social Network for D2C Founders",
  description: "Built for Hustlers by vFulfill",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#514de2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <AuthPromptProvider>
            <TooltipProvider>
              {children}
              <IntercomInitializer />
            </TooltipProvider>
          </AuthPromptProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
