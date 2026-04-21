import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
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
      <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-white text-[#0F172A]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
