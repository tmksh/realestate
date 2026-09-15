import type { Metadata } from "next";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AQUALINE | 未公開マンション LINE配信",
  description: "管理会社が登録し、運営が確認してから公式LINEで会員へ届ける未公開物件配信ツール",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${outfit.variable} ${notoSansJp.variable} h-full antialiased`}>
      <body className="min-h-full">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
