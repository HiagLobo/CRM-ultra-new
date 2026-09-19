"use client";
/** Lista rótulo → valor da ficha do lead (contato, origem). O valor quebra linha: nada estoura no celular. */
import * as React from "react";
import { palette as p } from "@/lib/palette";

export default function Dados({ itens }: { itens: ReadonlyArray<readonly [string, string]> }) {
  return (
    <dl style={{ display: "grid", gridTemplateColumns: "max-content minmax(0, 1fr)", gap: "6px 14px", margin: 0, fontSize: 14 }}>
      {itens.map(([rotulo, valor]) => (
        <React.Fragment key={rotulo}>
          <dt style={{ color: p.g500 }}>{rotulo}</dt>
          <dd style={{ margin: 0, color: p.ink, overflowWrap: "anywhere" }}>{valor}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
