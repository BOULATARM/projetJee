import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Variable fonts : "100 900" indique la plage de graisses supportée
const geist = localFont({
  src: [{ path: "./fonts/GeistVF.woff", weight: "100 900", style: "normal" }],
  variable: "--font-geist",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = localFont({
  src: [{ path: "./fonts/GeistMonoVF.woff", weight: "100 900", style: "normal" }],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "LIAS - Laboratoire d'Informatique et d'Applications Scientifiques",
  description: "Application de gestion du Laboratoire LIAS - Faculté des Sciences Ben M'Sik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
