import type { Metadata } from "next"
import { Pixelify_Sans } from "next/font/google"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import "./globals.css"

const pixelifySans = Pixelify_Sans({
    subsets: ["latin"],
    weight: ["400"]
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
      <body className={`${pixelifySans.className} antialiased`}>
        {children}
        <ToastContainer theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}
