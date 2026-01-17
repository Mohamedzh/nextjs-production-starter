import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/auth/session-provider";
import { logStartup } from "@/lib/logger";
import { features } from "@/lib/features";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js Production Starter",
  description: "Production-ready Next.js template for Railway with auto-enabled features",
};

// Log enabled features at startup
logStartup();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {features.auth ? (
          <SessionProvider>
            {children}
          </SessionProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
