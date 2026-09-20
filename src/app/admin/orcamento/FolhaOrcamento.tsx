/**
 * A folha A4: marca, cliente, assentos, implantação, extras e totais. O resto
 * do documento (incluso, franquias, anexo, condições e LGPD) vem de
 * `CondicoesOrcamento`, para nenhum arquivo passar de 300 linhas.
 *
 * Todo número sai do orçamento, que guardou o preço do dia. A folha não calcula
 * preço: ela só soma o que já veio pronto e formata.
 */
import type * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import CondicoesOrcamento from "./CondicoesOrcamento";
import { Bloco, Destaque, LinhaTotal, celula, celulaCabecalho, tabela } from "./pecas";
import { assentos as textoAssentos, dataBR, porcento, reais } from "./formato";
import {
  ESCADA_EXPLICADA,
  IMPLANTACAO_EXPLICADA,
  IMPLANTACAO_ISENTA,
  IMPLANTACAO_TITULO,
  linhaValidade,
  rotuloPublico,
} from "./legais";
import type { Orcamento } from "./tiposOrcamento";

const info: React.CSSProperties = { fontSize: 12.5, color: p.g700, lineHeight: 1.6 };

function Identificacao({ orcamento }: { orcamento: Orcamento }) {
  return (
    <header
      className="orc-bloco"
      style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}
    >
      <div style={{ minWidth: 0 }}>
        <img src="/assets/logo.svg" alt={brand.nome} style={{ height: 40 }} />
        <div style={{ ...info, marginTop: 8 }}>
          {brand.empresa.razaoSocial}
          <br />
          CNPJ {brand.empresa.cnpj}
        </div>
      </div>
      <div style={{ textAlign: "right", minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: p.ink }}>
          Proposta {orcamento.numero}
        </div>
        <div style={{ ...info, marginTop: 4 }}>
          Emitida em {dataBR(orcamento.criadoEm)}
          <br />
          <strong style={{ color: p.ink }}>{linhaValidade(dataBR(orcamento.validoAte))}</strong>
        </div>
      </div>
    </header>
  );
}

function Cliente({ orcamento }: { orcamento: Orcamento }) {
  // a API manda o rótulo pronto; o de casa fica como reserva
  const publico = orcamento.publicoRotulo ?? rotuloPublico(orcamento.publico);
  const unidades = orcamento.unidades ? `${orcamento.unidades} unidades ativas` : "";
  const linhaPublico = [publico, unidades].filter(Boolean).join(" · ");
  return (
    <Bloco titulo="Cliente">
      <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: p.ink }}>
        {orcamento.cliente.nome}
      </div>
      <div style={{ ...info, marginTop: 2 }}>
        {orcamento.cliente.email && <span>{orcamento.cliente.email}</span>}
        {orcamento.cliente.email && orcamento.cliente.telefone && <span> · </span>}
        {orcamento.cliente.telefone && <span>{orcamento.cliente.telefone}</span>}
      </div>
      {linhaPublico && <div style={info}>{linhaPublico}</div>}
    </Bloco>
  );
}

function TabelaAssentos({ orcamento }: { orcamento: Orcamento }) {
  const total = orcamento.assentos.reduce((soma, a) => soma + a.quantidade, 0);
  return (
    <Bloco titulo="Assentos contratados" apoio={ESCADA_EXPLICADA}>
      <table style={tabela}>
        <thead>
          <tr>
            <th scope="col" style={{ ...celulaCabecalho, textAlign: "left", width: "34%" }}>
              Nível
            </th>
            <th scope="col" style={{ ...celulaCabecalho, textAlign: "right", width: "18%" }}>
              Assentos
            </th>
            <th scope="col" style={{ ...celulaCabecalho, textAlign: "right", width: "24%" }}>
              Por assento
            </th>
            <th scope="col" style={{ ...celulaCabecalho, textAlign: "right", width: "24%" }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {orcamento.assentos.map((item, i) => (
            <tr key={`${item.codigo}-${i}`}>
              <td style={{ ...celula, textAlign: "left" }}>
                <strong>{item.nivel}</strong>
                {item.faixa && <div style={{ fontSize: 11.5, color: p.g500 }}>{item.faixa}</div>}
              </td>
              <td style={{ ...celula, textAlign: "right" }}>{item.quantidade}</td>
              <td style={{ ...celula, textAlign: "right" }}>{reais(item.precoUnitario)}</td>
              <td style={{ ...celula, textAlign: "right", fontWeight: 700 }}>{reais(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ ...info, marginTop: 8 }}>
        {textoAssentos(total)} na conta. A faixa de cada assento sai do total de assentos contratados.
      </div>
    </Bloco>
  );
}

/**
 * Mensalidade e implantação com o mesmo peso no papel. A implantação aparece
 * com os três números (total, entrada e saldo): é serviço entregue, pago em
 * duas partes, e o cliente precisa ver o que vence na assinatura.
 */
function Investimento({ orcamento }: { orcamento: Orcamento }) {
  const implantacao = orcamento.implantacao;
  const cobrada = implantacao && implantacao.total > 0;
  return (
    <Bloco titulo="Investimento">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Destaque rotulo="Mensalidade" valor={reais(orcamento.totais.mensal)} apoio="Cobrada por assento ativo." />
        {cobrada ? (
          <Destaque
            rotulo={IMPLANTACAO_TITULO}
            valor={reais(implantacao.total)}
            apoio={`Entrada de ${reais(implantacao.entrada)} (${porcento(implantacao.entradaPct)}) na assinatura e saldo de ${reais(implantacao.saldo)} na conclusão.`}
          />
        ) : (
          <Destaque rotulo={IMPLANTACAO_TITULO} valor="Isenta" apoio={IMPLANTACAO_ISENTA} />
        )}
      </div>
      {cobrada && <p style={{ ...info, margin: "10px 0 0" }}>{IMPLANTACAO_EXPLICADA}</p>}
    </Bloco>
  );
}

function Extras({ orcamento }: { orcamento: Orcamento }) {
  if (orcamento.extras.length === 0) return null;
  return (
    <Bloco titulo="Extras contratados">
      <table style={tabela}>
        <thead>
          <tr>
            <th scope="col" style={{ ...celulaCabecalho, textAlign: "left", width: "52%" }}>
              Item
            </th>
            <th scope="col" style={{ ...celulaCabecalho, textAlign: "right", width: "16%" }}>
              Qtd.
            </th>
            <th scope="col" style={{ ...celulaCabecalho, textAlign: "right", width: "32%" }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {orcamento.extras.map((extra, i) => (
            <tr key={`${extra.rotulo}-${i}`}>
              <td style={{ ...celula, textAlign: "left" }}>{extra.rotulo}</td>
              <td style={{ ...celula, textAlign: "right" }}>{extra.quantidade}</td>
              <td style={{ ...celula, textAlign: "right", fontWeight: 700 }}>{reais(extra.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Bloco>
  );
}

function Totais({ orcamento }: { orcamento: Orcamento }) {
  const { totais } = orcamento;
  const economia = totais.economiaAnual ?? 0;
  const implantacao = orcamento.implantacao?.total ?? 0;
  return (
    <Bloco titulo="Totais">
      <LinhaTotal rotulo="Total mensal" valor={reais(totais.mensal)} forte />
      <LinhaTotal rotulo="Total de 12 meses de mensalidade" valor={reais(totais.anual)} />
      {implantacao > 0 && (
        <LinhaTotal rotulo="Primeiro ano, com a implantação" valor={reais(totais.anual + implantacao)} forte />
      )}
      {orcamento.anual && economia > 0 && (
        <LinhaTotal rotulo="Economia no plano anual (2 meses)" valor={reais(economia)} />
      )}
      {orcamento.descontoPct > 0 && (
        <LinhaTotal rotulo="Desconto já aplicado nos valores acima" valor={porcento(orcamento.descontoPct)} />
      )}
      {orcamento.observacao && (
        <p style={{ ...info, marginTop: 10, whiteSpace: "pre-wrap" }}>{orcamento.observacao}</p>
      )}
    </Bloco>
  );
}

export default function FolhaOrcamento({ orcamento }: { orcamento: Orcamento }) {
  return (
    <article className="orc-folha" style={{ background: p.white, color: p.ink }}>
      <Identificacao orcamento={orcamento} />
      <Cliente orcamento={orcamento} />
      <TabelaAssentos orcamento={orcamento} />
      <Investimento orcamento={orcamento} />
      <Extras orcamento={orcamento} />
      <Totais orcamento={orcamento} />
      <CondicoesOrcamento orcamento={orcamento} />
    </article>
  );
}
