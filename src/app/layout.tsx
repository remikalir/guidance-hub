import type { Metadata } from "next"
import { Playfair_Display, Roboto } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { Providers } from "./providers"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  weight: ["400", "700"],
  display: "swap",
})

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Guidance Hub — Duke University AI & Education",
  description:
    "A peer-reviewed resource exchange for Duke University instructors sharing AI-related assignments, resources, and tools.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${roboto.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper antialiased font-sans">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
