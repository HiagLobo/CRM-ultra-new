import type { Metadata, Viewport } from "next";
import { brand } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.nome} · ${brand.tagline}`,
  description:
    "A plataforma de CRM imobiliário para corretores, imobiliárias e redes de franquias: leads, atendimento, imóveis, negociações e comissões em um só lugar.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/*
          As animações de entrada da landing nascem com `opacity: 0` e só são
          reveladas por JavaScript. Sem esta rede, quem estiver com o JS
          desligado veria a página EM BRANCO — o pior desfecho possível para
          uma página que é a porta de entrada do produto.
        */}
        <noscript>
          <style>{`.lp-rise, .lp-entra { opacity: 1 !important; transform: none !important; animation: none !important; }`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
