/**
 * Peças do documento: bloco com título, destaque de valor, lista e as células
 * da tabela. Só cor da palette (o painel inteiro segue essa regra) e nada de
 * tamanho fixo em pixel para o texto quebrar bem a 390 px e no papel A4.
 *
 * A classe `orc-bloco` é o que o `@media print` usa para não cortar um bloco no
 * meio da página (ver globals.css).
 */
import type * as React from "react";
import { palette as p } from "@/lib/palette";

export function Bloco({
  titulo,
  apoio,
  children,
}: {
  titulo?: string;
  apoio?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="orc-bloco" style={{ marginTop: 22 }}>
      {titulo && (
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: p.g500,
            margin: "0 0 10px",
            borderBottom: `1px solid ${p.g300}`,
            paddingBottom: 6,
          }}
        >
          {titulo}
        </h2>
      )}
      {apoio && <p style={{ margin: "0 0 10px", fontSize: 12.5, color: p.g700, lineHeight: 1.5 }}>{apoio}</p>}
      {children}
    </section>
  );
}

/** Caixa de valor. Mensalidade e implantação usam a mesma: pesam igual no papel. */
export function Destaque({ rotulo, valor, apoio }: { rotulo: string; valor: string; apoio?: string }) {
  return (
    <div
      style={{
        flex: "1 1 46%",
        minWidth: 0,
        border: `1.5px solid ${p.g300}`,
        borderRadius: 10,
        padding: "12px 14px",
        background: p.page,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: p.g500 }}>{rotulo}</div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 800,
          color: p.ink,
          lineHeight: 1.2,
          marginTop: 4,
          overflowWrap: "anywhere",
        }}
      >
        {valor}
      </div>
      {apoio && <div style={{ fontSize: 11.5, color: p.g700, marginTop: 4, lineHeight: 1.45 }}>{apoio}</div>}
    </div>
  );
}

/** Lista curta do documento (inclusos, condições, LGPD, anexo). */
export function Lista({ itens }: { itens: readonly string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
      {itens.map((item) => (
        <li key={item} style={{ fontSize: 12.5, color: p.ink, lineHeight: 1.5 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Par rótulo e valor das linhas de total. `forte` marca o número principal. */
export function LinhaTotal({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        padding: "7px 0",
        borderBottom: `1px solid ${p.g100}`,
      }}
    >
      <span style={{ fontSize: forte ? 13.5 : 12.5, fontWeight: forte ? 700 : 500, color: forte ? p.ink : p.g700 }}>
        {rotulo}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: forte ? 17 : 13.5,
          fontWeight: forte ? 800 : 600,
          color: p.ink,
          whiteSpace: "nowrap",
        }}
      >
        {valor}
      </span>
    </div>
  );
}

export const celulaCabecalho: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".04em",
  textTransform: "uppercase",
  color: p.g500,
  padding: "0 8px 7px",
  borderBottom: `1px solid ${p.g300}`,
};

export const celula: React.CSSProperties = {
  fontSize: 12.5,
  color: p.ink,
  padding: "8px",
  borderBottom: `1px solid ${p.g100}`,
  verticalAlign: "top",
};

export const tabela: React.CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
