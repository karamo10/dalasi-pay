import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Next.js page metadata applied to the entire application. */
export const metadata: Metadata = {
  title: "Dalasi Pay",
  description: "Dalasipay powered by Modempay",
};

/**
 * Root layout that wraps every page with the Geist font variables and base HTML structure.
 *
 * @param children - The active page or nested layout rendered inside the body.
 * @returns The full HTML document shell.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
