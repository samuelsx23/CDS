import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "CDS Car | Veículos selecionados e negócios seguros";
const description =
  "Veículos selecionados, compra, venda, financiamento e seguros com atendimento consultivo e procedência comprovada na Mooca, em São Paulo.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "cdsintermediacoes.com.br")
    .split(",")[0]
    .trim();
  const protocol = (requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https"))
    .split(",")[0]
    .trim();
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    keywords: [
      "CDS Car",
      "carros seminovos",
      "veículos Mooca",
      "vender carro",
      "financiamento de veículos",
    ],
    icons: {
      icon: "/images/brand/cds-car-logo.png",
      shortcut: "/images/brand/cds-car-logo.png",
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: origin,
      siteName: "CDS Car Intermediações",
      title,
      description,
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "CDS Car — escolhas melhores e negócios mais seguros" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
