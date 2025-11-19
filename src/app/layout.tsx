import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import HeaderClient from "@/components/HeaderClient";
import Link from "next/link";
import OnboardingModal from "@/components/OnboardingModal";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Flow-Launchpad",
    template: "%s | Flow-Launchpad",
  },
  description: "Create and join SOL presales. Each presale has its own wallet, progress, and timer.",
  keywords: ["solana", "presale", "flow-launchpad", "launch", "crypto"],
  openGraph: {
    title: "Flow-Launchpad",
    description: "Create and join SOL presales with wallet-based tracking and progress.",
    url: "/",
    siteName: "Flow-Launchpad",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Flow-Launchpad" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Flow-Launchpad",
    description: "Create and join SOL presales with wallet-based tracking and progress.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen">
            <header className="border-b border-[var(--color-border)] sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur">
              <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href="/" className="font-semibold flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded" />
                    Flow-Launchpad
                  </Link>
                </div>
                <HeaderClient />
              </div>
            </header>
            <main className="max-w-6xl mx-auto px-6 py-6">
              {children}
            </main>
            <OnboardingModal />
            <Toaster richColors position="top-center" theme="dark" />
            <footer className="border-t border-[var(--color-border)] mt-12">
              <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-400">© {new Date().getFullYear()} Flow-Launchpad</div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
