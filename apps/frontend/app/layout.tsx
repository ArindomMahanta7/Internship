import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashGate from "../components/animations/SplashGate";
import CartSync from "../components/CartSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuyCart",
  description: "BuyCart — shop the latest phones from the brands you love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SplashGate>{children}</SplashGate>
        {/* Renders nothing; mirrors the localStorage cart to the account. */}
        <CartSync />
      </body>
    </html>
  );
}
