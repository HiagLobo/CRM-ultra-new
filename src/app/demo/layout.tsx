import type { Metadata } from "next";

/**
 * Site de exemplo do demo (/demo/*): imobiliária, imóveis e preços fictícios.
 * Não pode virar resultado de busca associado à empresa — `noindex` aqui e
 * `Disallow: /demo/` no robots.ts (um cobre o outro).
 */
export const metadata: Metadata = {
  title: "Site de exemplo",
  robots: { index: false, follow: false, nocache: true },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
