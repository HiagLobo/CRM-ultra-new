/**
 * A segunda metade da folha: o que está incluso, franquias de uso, o anexo
 * datado das entregas, as condições comerciais, a LGPD e o rodapé que diz, com
 * todas as letras, que proposta não é contrato.
 *
 * O texto vem dos módulos `anexo.ts` e `legais.ts` (atualizados a cada onda); o
 * que está incluso e as franquias vêm da tabela oficial pela ponte
 * `tabelaDaTrilhaA.ts`. Nada é escrito na tela.
 */
import type * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Bloco, Lista } from "./pecas";
import { ANEXO_NO_AR, ANEXO_NOTAS, ANEXO_PROXIMAS, CLAUSULA_MES_GRATIS, TITULO_ANEXO } from "./anexo";
import {
  AVISO_PROPOSTA,
  CONDICOES_COMERCIAIS,
  FUNDADOR_EM_TROCA,
  FUNDADOR_RECEBE,
  TITULO_CONDICOES,
  TITULO_FUNDADOR,
  TITULO_LGPD,
  textoLgpd,
} from "./legais";
import { franquiasDoOrcamento, inclusosDoNivel } from "./tabelaDaTrilhaA";
import { niveisContratados, type Orcamento } from "./tiposOrcamento";

const apoio: React.CSSProperties = { fontSize: 12.5, color: p.g700, lineHeight: 1.55, margin: "8px 0 0" };
const subtitulo: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: p.ink,
  margin: "12px 0 6px",
  fontFamily: "var(--font-display)",
};

/**
 * O que está incluso e as franquias vêm da tabela oficial, copiados no
 * orçamento na emissão. Sem eles o documento nem chega aqui: a conferência em
 * `api.ts` recusa a proposta em vez de imprimir texto genérico no lugar.
 */
function Inclusos({ orcamento }: { orcamento: Orcamento }) {
  return (
    <Bloco titulo="O que está incluso">
      {niveisContratados(orcamento).map((nivel) => (
        <div key={nivel.codigo}>
          <h3 style={subtitulo}>Nível {nivel.rotulo}</h3>
          <Lista itens={inclusosDoNivel(orcamento, nivel.codigo)} />
        </div>
      ))}
    </Bloco>
  );
}

function Franquias({ orcamento }: { orcamento: Orcamento }) {
  return (
    <Bloco titulo="Franquias de uso e excedente" apoio="O que já está na mensalidade e quanto custa o que passar disso.">
      <Lista
        itens={franquiasDoOrcamento(orcamento).map((f) =>
          f.excedente ? `${f.rotulo}: ${f.incluso}. Excedente: ${f.excedente}.` : `${f.rotulo}: ${f.incluso}.`,
        )}
      />
    </Bloco>
  );
}

/**
 * O anexo é a seção mais comprida do documento: ela pode virar a página, e
 * quem não pode partir no meio é cada pedaço (o "no ar hoje", cada mês e as
 * cláusulas). Por isso `quebravel`.
 */
function Anexo() {
  return (
    <Bloco titulo={TITULO_ANEXO} quebravel>
      <div className="orc-bloco">
        <h3 style={{ ...subtitulo, marginTop: 0 }}>No ar hoje</h3>
        <Lista itens={ANEXO_NO_AR} />
      </div>
      {ANEXO_PROXIMAS.map((entrega) => (
        <div key={entrega.mes} className="orc-bloco">
          <h3 style={subtitulo}>{entrega.mes}</h3>
          <Lista itens={entrega.itens} />
        </div>
      ))}
      <div className="orc-bloco">
        <p style={apoio}>{CLAUSULA_MES_GRATIS.join(" ")}</p>
        <p style={{ ...apoio, color: p.g500 }}>{ANEXO_NOTAS.join(" ")}</p>
      </div>
    </Bloco>
  );
}

function Condicoes({ orcamento }: { orcamento: Orcamento }) {
  return (
    <Bloco titulo={TITULO_CONDICOES}>
      <Lista itens={CONDICOES_COMERCIAIS} />
      {orcamento.condicaoFundador && (
        <div className="orc-bloco">
          <h3 style={subtitulo}>{TITULO_FUNDADOR}</h3>
          <Lista itens={FUNDADOR_RECEBE} />
          <h3 style={subtitulo}>Em troca, fica combinado</h3>
          <Lista itens={FUNDADOR_EM_TROCA} />
        </div>
      )}
    </Bloco>
  );
}

function Rodape() {
  const contato = [brand.contato.email, brand.contato.telefone, brand.dominio].filter(Boolean).join(" · ");
  return (
    <footer className="orc-bloco" style={{ marginTop: 24, borderTop: `1.5px solid ${p.g300}`, paddingTop: 10 }}>
      <p style={{ ...apoio, marginTop: 0, fontWeight: 700, color: p.ink }}>{AVISO_PROPOSTA}</p>
      <p style={{ ...apoio, color: p.g500 }}>
        {brand.empresa.razaoSocial} · CNPJ {brand.empresa.cnpj}
        <br />
        {contato}
      </p>
    </footer>
  );
}

export default function CondicoesOrcamento({ orcamento }: { orcamento: Orcamento }) {
  return (
    <>
      <Inclusos orcamento={orcamento} />
      <Franquias orcamento={orcamento} />
      <Anexo />
      <Condicoes orcamento={orcamento} />
      <Bloco titulo={TITULO_LGPD}>
        <Lista itens={textoLgpd(orcamento.cliente.nome, brand.empresa.razaoSocial)} />
      </Bloco>
      <Rodape />
    </>
  );
}
