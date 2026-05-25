import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { PwaRegister } from "@/components/shared/pwa-register";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asti Ko Paisa - Friendly debt reminders",
  description:
    "Track debts, send polite reminders, and keep money conversations stress-free.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Asti Ko Paisa",
  },
};

export const viewport: Viewport = {
  themeColor: "#12AD67",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
