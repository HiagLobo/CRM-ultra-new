"use client";
/**
 * Seção "Planos": os três níveis previstos, SEM checkout e SEM preço inventado.
 * Preço fica como "em definição" de propósito — publicar um valor que ainda não
 * existe cria expectativa que o produto teria de honrar depois.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { Secao, Eyebrow, Titulo, Sub, AvisoIlustrativo } from "./ui";
import { BotaoAcessar } from "./botoes";

const PLANOS: { nome: string; para: string; itens: string[]; destaque?: boolean }[] = [
  {
    nome: "Corretor",
    para: "Para quem atende os próprios clientes",
    itens: ["Funil de vendas", "Atendimento e agenda", "Carteira de imóveis", "Controle de comissões"],
  },
  {
    nome: "Imobiliária",
    para: "Para quem gere um time de associados",
    itens: [
      "Tudo do plano Corretor",
      "Gestão de corretores associados",
      "Curadoria e fechamentos",
      "Financeiro, cobranças e jurídico",
      "Site de divulgação dos imóveis, com a sua marca",
    ],
    destaque: true,
  },
  {
    nome: "Rede",
    para: "Para redes de franquias",
    itens: ["Tudo do plano Imobiliária", "Site por unidade", "Visão por unidade", "Assentos e acessos", "Relatórios da rede"],
  },
];

export default function Planos({ onAcessar }: { onAcessar: () => void }) {
  return (
    <Secao id="planos" fundo={p.page}>
      <div style={{ maxWidth: 720, marginBottom: 24 }}>
        <Eyebrow>Planos</Eyebrow>
        <Titulo>Comece pela demonstração: o plano vem depois</Titulo>
        <Sub>
          O acesso ao demo do {brand.nomeCurto} é gratuito e não pede cartão. Os valores de assinatura
          estão em definição e serão combinados no contato comercial.
        </Sub>
      </div>

      <div style={{ marginBottom: 34 }}>
        <AvisoIlustrativo>Preços ainda não divulgados. Nada é cobrado nesta etapa</AvisoIlustrativo>
      </div>

      <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
        {PLANOS.map((plano) => (
          <article
            key={plano.nome}
            style={{
              background: "#fff",
              borderRadius: 16,
              border: `1.5px solid ${plano.destaque ? p.primary : p.g300}`,
              boxShadow: plano.destaque
                ? "0 18px 44px rgba(79,70,229,.16)"
                : "0 8px 24px rgba(28,26,34,.06)",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, margin: 0, color: p.ink }}>
                  {plano.nome}
                </h3>
                {plano.destaque && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      color: p.primary,
                      background: p.lilac1,
                      borderRadius: 999,
                      padding: "4px 10px",
                    }}
                  >
                    Mais procurado
                  </span>
                )}
              </div>
              <div style={{ fontSize: 14, color: p.g500 }}>{plano.para}</div>
            </div>

            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: p.g500 }}>
              Preço em definição
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10, flex: 1 }}>
              {plano.itens.map((i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 14, color: p.ink, lineHeight: 1.5 }}>
                  <span style={{ marginTop: 2 }}>
                    <Ic n="check" s={16} c={p.success} />
                  </span>
                  {i}
                </li>
              ))}
            </ul>

            <BotaoAcessar onAcessar={onAcessar}>Ver na prática</BotaoAcessar>
          </article>
        ))}
      </div>
    </Secao>
  );
}
