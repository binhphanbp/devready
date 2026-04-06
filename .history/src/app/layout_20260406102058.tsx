import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { ClientEnhancements } from "@/components/ClientEnhancements";
import { BackToTop } from "@/components/layout/BackToTop";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "DevReady — Nền tảng luyện phỏng vấn IT #1 Việt Nam",
    template: "%s | DevReady",
  },
  description:
    "Luyện phỏng vấn IT hiệu quả với 1000+ câu hỏi, Flashcard thông minh, AI Mentor 24/7. Dành cho sinh viên và Junior Developer Việt Nam.",
  keywords: [
    "phỏng vấn IT",
    "interview preparation",
    "lập trình",
    "frontend",
    "backend",
    "devops",
    "flashcard",
    "FPT Polytechnic",
    "junior developer",
    "Vietnam",
  ],
  authors: [{ name: "DevReady Team" }],
  creator: "DevReady",
  metadataBase: new URL("https://devready.vn"),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://devready.vn",
    siteName: "DevReady",
    title: "DevReady — Nền tảng luyện phỏng vấn IT #1 Việt Nam",
    description:
      "Luyện phỏng vấn IT hiệu quả với 1000+ câu hỏi, Flashcard thông minh, AI Mentor 24/7.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://nchvuilqifremlohuvva.supabase.co" />
        <link rel="dns-prefetch" href="https://nchvuilqifremlohuvva.supabase.co" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClientEnhancements />
          {children}
          <BackToTop />
          <Toaster position="bottom-right" richColors theme="system" />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
