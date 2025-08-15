import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.scss";
import AntDesignProviders from "./providers";

export const metadata: Metadata = {
  title: "AISnap - 智能文档格式转换平台",
  description: "基于Web的智能文档格式转换平台，解决AI生成内容的格式转换痛点",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <AntDesignProviders>
          {children}
        </AntDesignProviders>
      </body>
    </html>
  );
}