import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google"; // [MODIFIED]
import "./globals.css";
import { ReactLenis } from "lenis/react";
import StoreProvider from "@/store/StoreProvider";
import Toaster from "@/components/UI/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Smart Office",
  description: "Smart Office",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ReactLenis root>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} antialiased`}
        >
          <StoreProvider>{children}</StoreProvider>
          <Toaster />
        </body>
      </ReactLenis>
    </html>
  );
}
