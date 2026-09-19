"use client";
/**
 * Passo 3 — acesso liberado: escolha por qual dos três painéis começar.
 * O8·S3: e, para quem já quer conversar, o WhatsApp comercial a um clique.
 * O9·S2: dado novo que não foi atualizado (já estava em outro cadastro) é avisado aqui.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand, linkWhatsapp } from "@/config/brand";
import { Ic } from "@/components/Icon";
import EscolhaPainel from "./EscolhaPainel";
import { MENSAGEM_CONVERSAR } from "./QueroUsar";
import { AvisoNaoAtualizados } from "./AvisosCadastro";
import type { CampoNaoAtualizado } from "./mensagens";

export default function StepOk({
  aoFechar,
  naoAtualizados = [],
}: {
  aoFechar: () => void;
  naoAtualizados?: readonly CampoNaoAtualizado[];
}) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: `${p.success}1A`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Ic n="check-circle-2" s={24} c={p.success} />
        </span>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, color: p.g700, margin: 0 }}>
          E-mail confirmado. A demonstração do {brand.nomeCurto} está liberada — escolha por onde
          começar.
        </p>
      </div>

      <AvisoNaoAtualizados campos={naoAtualizados} />

      <EscolhaPainel aoEscolher={aoFechar} />

      <p style={{ fontSize: 12.5, color: p.g500, margin: 0 }}>
        Você pode voltar e testar os outros painéis quando quiser, pelo{" "}
        <strong style={{ color: p.g700 }}>Entrar</strong> do site.
      </p>

      <p style={{ fontSize: 13.5, color: p.g700, margin: 0, display: "flex", alignItems: "center", gap: "4px 8px", flexWrap: "wrap" }}>
        <Ic n="message-circle" s={16} c={p.primary} />
        <span>Quer conversar?</span>
        <a
          href={linkWhatsapp(MENSAGEM_CONVERSAR)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: p.primary, fontWeight: 700 }}
        >
          Fale com a gente no WhatsApp
        </a>
      </p>
    </div>
  );
}
