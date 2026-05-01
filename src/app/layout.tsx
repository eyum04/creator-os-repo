import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/lib/theme';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CreatorOS",
  description: "Content planning and management tool for aspiring TikTok creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard" afterSignOutUrl="/">
      <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}` }} />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#2563EB" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="CreatorOS" />
          <link rel="apple-touch-icon" href="/icon.svg" />
        </head>
        <body className="min-h-full flex flex-col bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F1F5F9]">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
