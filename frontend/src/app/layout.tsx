import type { Metadata } from "next";
import { DM_Sans, Unbounded } from "next/font/google"; // [MODIFIED]
import "./globals.css";
import { ReactLenis } from "lenis/react";
import StoreProvider from "@/store/StoreProvider";
import Toaster from "@/components/UI/Toaster";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Virtual Office",
  description: "Virtual Office",
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
          className={`${dmSans.variable} ${unbounded.variable} antialiased`}
        >
          <StoreProvider>{children}</StoreProvider>
          <Toaster />
        </body>
      </ReactLenis>
    </html>
  );
}
