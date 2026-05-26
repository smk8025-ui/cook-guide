import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "냉털쿡 - AI 기반 냉장고 레시피 추천",
  description: "냉장고 속 남은 재료로 간편하고 맛있는 요리를 추천받으세요! 자취생 요리 도우미 앱.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center">
        <div className="mobile-shell">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
