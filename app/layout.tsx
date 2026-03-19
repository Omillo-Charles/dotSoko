import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/nav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: ".Soko E-Commerce",
  description: "Top Multivendor E-Commerce Platform",
  icons: {
    icon: "/favicon.ico",
    apple: "/dotsoko.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: ".Soko",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/ubuntufont/ubuntu-font-family-0.83/Ubuntu-R.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <CartProvider>
              <WishlistProvider>
                <Toaster position="top-right" richColors />
                <Navbar />
                {children}
              </WishlistProvider>
            </CartProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
