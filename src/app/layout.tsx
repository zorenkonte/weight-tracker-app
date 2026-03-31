import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopProgressBar } from "./progress-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weight Tracker",
  description: "Track weight over time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <TopProgressBar />
        {children}
      </body>
    </html>
  );
}
