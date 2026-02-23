import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "3DEcom - Precificadora para Impressao 3D",
    template: "%s | 3DEcom",
  },
  description:
    "Calculadora de precificacao para impressao 3D. Gerencie materiais, maquinas e calcule precos com precisao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${dmMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
