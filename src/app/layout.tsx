import Header from "@/components/Header";
import "@/features/editor/styles/tiptap.css";
import { Center, VStack } from "@yamada-ui/react";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import type { ReactNode } from "react";
import Footer from "../components/Footer";
import YamadaUIProvider from "../components/YamadaUIProvider";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "いちぴろぷらす",
  description:
    "広島市立大学生向けの時間割管理、タスク管理、記事共有ができる学習支援アプリ。いちぴろプラスで大学生活をもっと便利に。",
  keywords:
    "いちぴろ, Ichipiro, 広島市立大学, 時間割管理, 学習支援, 大学生アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "いちぴろぷらす",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={notoSansJP.className} suppressHydrationWarning>
        <YamadaUIProvider>
          <Center>
            <VStack maxW="9xl" fontSize={{ base: "md", md: "sm" }}>
              <Header />
              {children}
              <Footer />
            </VStack>
          </Center>
        </YamadaUIProvider>
      </body>
    </html>
  );
};

export default RootLayout;
