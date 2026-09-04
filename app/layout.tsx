import type { Metadata } from "next";
import { Manrope, Noto_Sans_Bengali } from "next/font/google";
import LanguageProvider from "@/components/LanguageProvider";
import { getLocale, getServerDictionary } from "@/lib/i18n-server";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "sans-serif",
  ],
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-noto-bengali",
});

export function generateMetadata(): Metadata {
  const t = getServerDictionary();
  return {
    title: t.metadata.title,
    description: t.metadata.description,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();

  return (
    <html lang={locale === "bn" ? "bn-BD" : "en"}>
      <body className={`${manrope.variable} ${notoSansBengali.variable} font-sans`}>
        <LanguageProvider locale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
