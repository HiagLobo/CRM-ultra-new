"use client";
/**
 * O quadro de totais do formulário, sempre à vista: total mensal, total do ano,
 * implantação (entrada na assinatura e saldo na conclusão) e o preço efetivo
 * por assento mudam a cada tecla. A conta vem da função pura do domínio, a
 * mesma que o servidor usa para gravar (a tela nunca refaz cálculo).
 *
 * Quando a prévia é recusada, os ÚLTIMOS totais válidos continuam na tela,
 * esmaecidos, com a explicação em vermelho logo abaixo: sumir com tudo faria o
 * fundador perder a referência do que estava montando.
 *
 * Dois avisos de peso diferente, de propósito:
 * - **amarelo** a partir de 15% de desconto: dá para seguir;
 * - **vermelho** abaixo do piso: aí o servidor recusa, e o botão de salvar fica
 *   desligado com a explicação do piso e do preço efetivo por assento.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import {
  DESCONTO_QUE_AVISA,
  MESES_DO_ANO,
  MESES_PAGOS_NO_ANUAL,
  formatarReais,
  type CalculoOrcamento,
} from "@/features/orcamento";
import { caixaErro } from "./estilos";
import { mensagemDaPrevia, type PreviaOrcamento } from "./formOrcamento";

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

export default function ResumoOrcamento({ previa }: { previa: PreviaOrcamento }) {
  // os últimos totais que fecharam ficam na tela enquanto o fundador conserta
  const ultimoValido = React.useRef<CalculoOrcamento | null>(null);
  if (previa.ok) ultimoValido.current = previa.calculo;
  const calculo = previa.ok ? previa.calculo : ultimoValido.current;
  const recusa = mensagemDaPrevia(previa);

  return (
    <div style={{ marginBottom: 14 }}>
      {calculo && (
        <div style={{ opacity: previa.ok ? 1 : 0.55 }}>
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
            <Total rotulo="Total mensal" valor={formatarReais(calculo.totais.mensalCentavos)} forte />
            <Total
              rotulo={calculo.condicoes.anual ? `Ano (${MESES_PAGOS_NO_ANUAL} mensalidades)` : "Total do ano"}
              valor={formatarReais(calculo.totais.anoCentavos)}
            />
            <Total
              rotulo="Implantação"
              valor={calculo.condicoes.implantacaoIsenta ? "isenta" : formatarReais(calculo.implantacao.totalCentavos)}
            />
            {calculo.implantacao.totalCentavos > 0 && (
              <Total
                rotulo={`Entrada (${calculo.implantacao.entradaPct}%)`}
                valor={formatarReais(calculo.implantacao.entradaCentavos)}
              />
            )}
            {calculo.implantacao.saldoCentavos > 0 && (
              <Total rotulo="Saldo na conclusão" valor={formatarReais(calculo.implantacao.saldoCentavos)} />
            )}
            {calculo.totais.extrasUnicosCentavos > 0 && (
              <Total rotulo="Cobrança única" valor={formatarReais(calculo.totais.extrasUnicosCentavos)} />
            )}
          </div>

          <p style={{ margin: "8px 0 0", fontSize: 12.5, color: p.g500, lineHeight: 1.5 }}>
            Cada assento entra pela faixa dele. Preço efetivo por assento:{" "}
            {calculo.condicoes.assentos.pro > 0 && `Pro ${formatarReais(calculo.condicoes.efetivoPorAssento.pro)}`}
            {calculo.condicoes.assentos.pro > 0 && calculo.condicoes.assentos.ultra > 0 && " · "}
            {calculo.condicoes.assentos.ultra > 0 &&
              `Ultra ${formatarReais(calculo.condicoes.efetivoPorAssento.ultra)}`}
            {calculo.condicoes.anual &&
              `. No anual são ${MESES_DO_ANO} meses pelo preço de ${MESES_PAGOS_NO_ANUAL}, e o piso vale sobre esse valor`}
            .
          </p>
          {calculo.implantacao.totalCentavos > 0 && (
            <p style={{ margin: "6px 0 0", fontSize: 12.5, color: p.g500, lineHeight: 1.5 }}>
              A implantação é cobrada em duas partes: entrada na assinatura e saldo na conclusão. Ela não é diluída
              nos meses e não é devolvida se o cliente sair depois.
            </p>
          )}
        </div>
      )}

      {recusa && (
        <div role="alert" style={{ ...caixaErro, marginTop: calculo ? 10 : 0 }}>
          <strong>Não dá para salvar assim.</strong> {recusa}
        </div>
      )}

      {previa.ok && previa.calculo.condicoes.descontoAlto && (
        <p style={{ ...caixaAviso, margin: "10px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
          <Ic n="alert-triangle" s={16} c={p.warning} />
          Desconto de {previa.calculo.condicoes.descontoPct}%, de {DESCONTO_QUE_AVISA}% para cima. Dá para seguir, mas
          confira se a conta ainda fecha.
        </p>
      )}
    </div>
  );
}
