import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
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
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
