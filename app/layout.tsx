import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://precificadora3decom.com.br";

const description =
  "Calculadora de precificação para impressão 3D. Calcule preços com precisão, taxas reais de Shopee e Mercado Livre 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "3DEcom — Precificadora para Impressão 3D",
    template: "%s | 3DEcom",
  },
  description,
  applicationName: "3DEcom",
  keywords: [
    "precificação",
    "impressão 3D",
    "calculadora",
    "preço de venda",
    "Mercado Livre",
    "Shopee",
    "taxas marketplace",
    "margem de lucro",
    "filamento",
    "Bambu Lab",
  ],
  authors: [{ name: "3DEcom" }],
  creator: "3DEcom",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "3DEcom",
    title: "3DEcom — Precificadora para Impressão 3D",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "3DEcom — Precificadora para Impressão 3D",
    description,
    images: [`${siteUrl}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${dmMono.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
