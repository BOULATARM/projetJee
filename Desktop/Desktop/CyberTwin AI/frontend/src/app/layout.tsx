import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberTwin AI — Cyber Digital Twin Platform",
  description:
    "AI-powered cyber digital twin platform for real-time cyberattack simulation, threat intelligence, and network security visualization.",
  keywords: ["cybersecurity", "digital twin", "AI", "threat intelligence", "network security"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-cyber-bg text-cyber-text antialiased cyber-grid">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
