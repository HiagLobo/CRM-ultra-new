"use client";
/**
 * Seção de confiança. Nada de depoimento inventado: afirma o que é verificável
 * na própria demonstração e mostra os depoimentos REAIS de quem testou o demo
 * (`src/content/depoimentos.ts`, um por autorização registrada). Sem nenhum
 * autorizado, o espaço fica reservado e marcado enquanto `brand.demoMode` estiver ligado.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { DEPOIMENTOS, assinatura } from "@/content/depoimentos";
import { Secao, Eyebrow, Titulo, Sub, AvisoIlustrativo } from "./ui";

const GARANTIAS: { icone: string; titulo: string; texto: string }[] = [
  {
    icone: "layout-dashboard",
    titulo: "Demonstração de verdade",
    texto:
      "Você navega pelos painéis reais do produto. Não é vídeo, não é apresentação de slides.",
  },
  {
    icone: "shield-check",
    titulo: "Dados fictícios",
    texto:
      "Todo o conteúdo do demo é inventado. Nenhum cliente, imóvel ou negócio real aparece ali.",
  },
  {
    icone: "lock",
    titulo: "Seus dados, o mínimo",
    texto:
      "Pedimos e-mail, telefone e CRECI só para liberar o acesso e falar com você. Nada de cartão.",
  },
];

export default function Prova() {
  return (
    <Secao>
      <div style={{ maxWidth: 720, marginBottom: 40 }}>
        <Eyebrow>Por que confiar</Eyebrow>
        <Titulo>Sem promessa que a demonstração não cumpra</Titulo>
        <Sub>
          O {brand.nome} está em pré-lançamento. Preferimos mostrar o produto funcionando a inventar
          números de mercado.
        </Sub>
      </div>

      <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
        {GARANTIAS.map((g) => (
          <article
            key={g.titulo}
            style={{
              background: p.lilac1,
              borderRadius: 16,
              border: `1px solid ${p.lilac2}`,
              padding: 26,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, background: "#fff", display: "grid", placeItems: "center" }}>
                <Ic n={g.icone} s={20} c={p.primary} />
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, margin: 0, color: p.ink }}>
                {g.titulo}
              </h3>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: 0 }}>{g.texto}</p>
          </article>
        ))}
      </div>

      {DEPOIMENTOS.length > 0 && (
        <section aria-labelledby="titulo-depoimentos" style={{ marginTop: 44 }}>
          <h3
            id="titulo-depoimentos"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: p.ink, margin: 0 }}
          >
            Quem testou a demonstração
          </h3>
          <p style={{ fontSize: 14, color: p.g500, margin: "6px 0 20px" }}>
            Corretores que pediram acesso e navegaram pelos painéis. Publicado com autorização de cada um.
          </p>
          <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
            {DEPOIMENTOS.map((d) => (
              <figure
                key={d.id}
                style={{
                  margin: 0,
                  background: p.white,
                  borderRadius: 16,
                  border: `1px solid ${p.g100}`,
                  padding: 26,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ fontFamily: "var(--font-display)", fontSize: 38, lineHeight: 0.6, color: p.lilac2, height: 22 }}
                >
                  &ldquo;
                </span>
                <blockquote style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: p.ink }}>
                  &ldquo;{d.texto}&rdquo;
                </blockquote>
                <figcaption style={{ marginTop: "auto", fontSize: 13.5, color: p.g500 }}>{assinatura(d)}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {brand.demoMode && DEPOIMENTOS.length === 0 && (
        <div
          style={{
            marginTop: 34,
            border: `1px dashed ${p.g300}`,
            borderRadius: 16,
            padding: 26,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 16,
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: p.ink }}>
              Espaço reservado para depoimentos
            </div>
            <div style={{ fontSize: 14, color: p.g500, marginTop: 4 }}>
              Entram aqui quando os primeiros corretores usarem o produto, com nome e autorização.
            </div>
          </div>
          <AvisoIlustrativo>Nada publicado sem cliente real</AvisoIlustrativo>
        </div>
      )}
    </Secao>
  );
}
