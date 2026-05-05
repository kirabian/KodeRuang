import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import dynamic from 'next/dynamic';
const AIChat = dynamic(() => import('@/components/chat/AIChat'), { ssr: false });

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KodeRuang - Komunitas Developer Indonesia",
  description: "Platform komunitas untuk developer berbagi resource bermanfaat seperti artikel teknis, GitHub repository, library, dan tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <AIChat />
      </body>
    </html>
  );
}
