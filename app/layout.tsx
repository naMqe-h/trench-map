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
})

const siteConfig = {
    name: "TrenchMap",
    description:
        "An interactive 3D map of Solana memecoin trenches. Enter a contract address and watch its village generate in real-time based on on-chain data.",
    keywords: [
        "solana",
        "memecoin",
        "3d map",
        "crypto",
        "blockchain",
        "on-chain data",
    ],
}

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    openGraph: {
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        type: "website",
    },
    twitter: {
        card: "summary",
        title: siteConfig.name,
        description: siteConfig.description,
    },
}

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
        {children}
      </body>
    </html>
  );
}
