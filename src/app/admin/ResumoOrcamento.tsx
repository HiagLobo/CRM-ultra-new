"use client";
/**
 * O quadro de totais do formulário, sempre à vista: total mensal, total do ano
 * e implantação mudam a cada tecla. A conta vem da função pura do domínio, a
 * mesma que o servidor usa para gravar (a tela nunca refaz cálculo).
 *
 * Dois avisos de peso diferente, de propósito:
 * - **amarelo** a partir de 15% de desconto: dá para seguir;
 * - **vermelho** abaixo do piso: aí o servidor recusa, e o botão de salvar fica
 *   desligado com a explicação do piso e do preço efetivo por assento.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { DESCONTO_QUE_AVISA, formatarReais, MESES_PAGOS_NO_ANUAL, type ResultadoCalculo } from "@/features/orcamento";
import { caixaErro } from "./estilos";
import { mensagemDaPrevia } from "./formOrcamento";

const caixaAviso: React.CSSProperties = { ...caixaErro, background: `${p.warning}1F`, borderColor: `${p.warning}88` };

function Total({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: p.g500 }}>{rotulo}</div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: forte ? 24 : 18,
          color: p.ink,
          overflowWrap: "anywhere",
        }}
      >
        {valor}
      </div>
    </div>
  );
}

export default function ResumoOrcamento({ previa }: { previa: ResultadoCalculo }) {
  const recusa = mensagemDaPrevia(previa);

  if (!previa.ok) {
    return (
      <div role="alert" style={{ ...caixaErro, marginBottom: 14 }}>
        <strong>Não dá para salvar assim.</strong> {recusa}
      </div>
    );
  }

  const { totais, condicoes } = previa.calculo;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          background: p.lilac1,
          border: `1px solid ${p.lilac2}`,
          borderRadius: 12,
          padding: "12px 14px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        <Total rotulo="Total mensal" valor={formatarReais(totais.mensalCentavos)} forte />
        <Total rotulo={condicoes.anual ? `Ano (${MESES_PAGOS_NO_ANUAL} meses)` : "Total do ano"} valor={formatarReais(totais.anoCentavos)} />
        <Total
          rotulo="Implantação"
          valor={condicoes.implantacaoIsenta ? "isenta" : formatarReais(totais.implantacaoCentavos)}
        />
        {totais.extrasUnicosCentavos > 0 && (
          <Total rotulo="Cobrança única" valor={formatarReais(totais.extrasUnicosCentavos)} />
        )}
      </div>

      <p style={{ margin: "8px 0 0", fontSize: 12.5, color: p.g500, lineHeight: 1.5 }}>
        Cada assento entra pela faixa dele. Preço efetivo por assento:{" "}
        {condicoes.assentos.pro > 0 && `Pro ${formatarReais(condicoes.efetivoPorAssento.pro)}`}
        {condicoes.assentos.pro > 0 && condicoes.assentos.ultra > 0 && " · "}
        {condicoes.assentos.ultra > 0 && `Ultra ${formatarReais(condicoes.efetivoPorAssento.ultra)}`}
        {condicoes.anual && `. No anual são 12 meses pelo preço de ${MESES_PAGOS_NO_ANUAL}, com implantação isenta`}.
      </p>

      {condicoes.descontoAlto && (
        <p role="status" style={{ ...caixaAviso, margin: "10px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
          <Ic n="alert-triangle" s={16} c={p.warning} />
          Desconto de {condicoes.descontoPct}%, de {DESCONTO_QUE_AVISA}% para cima. Dá para seguir, mas confira se a
          conta ainda fecha.
        </p>
      )}
    </div>
  );
}
