import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mission Control Dashboard",
  description: "Personal dashboard for Filipe - BINB, Personal, Jarvis, Projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
