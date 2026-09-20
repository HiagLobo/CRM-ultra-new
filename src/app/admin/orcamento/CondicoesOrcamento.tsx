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
import { ROTULO_NIVEL, niveisContratados, type Orcamento } from "./tiposOrcamento";

const apoio: React.CSSProperties = { fontSize: 12.5, color: p.g700, lineHeight: 1.55, margin: "8px 0 0" };
const subtitulo: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: p.ink,
  margin: "12px 0 6px",
  fontFamily: "var(--font-display)",
};

function Inclusos({ orcamento }: { orcamento: Orcamento }) {
  const niveis = niveisContratados(orcamento).filter((n) => inclusosDoNivel(orcamento, n).length > 0);
  return (
    <Bloco titulo="O que está incluso">
      {niveis.length === 0 ? (
        <p style={{ ...apoio, marginTop: 0 }}>
          A lista do que cada nível inclui acompanha esta proposta e vale na data de emissão.
        </p>
      ) : (
        niveis.map((nivel) => (
          <div key={nivel}>
            <h3 style={subtitulo}>Nível {ROTULO_NIVEL[nivel]}</h3>
            <Lista itens={inclusosDoNivel(orcamento, nivel)} />
          </div>
        ))
      )}
    </Bloco>
  );
}

function Franquias({ orcamento }: { orcamento: Orcamento }) {
  const franquias = franquiasDoOrcamento(orcamento);
  return (
    <Bloco titulo="Franquias de uso e excedente" apoio="O que já está na mensalidade e quanto custa o que passar disso.">
      {franquias.length === 0 ? (
        <p style={{ ...apoio, marginTop: 0 }}>
          As franquias de uso e o preço do excedente seguem a tabela vigente na data desta proposta.
        </p>
      ) : (
        <Lista
          itens={franquias.map((f) =>
            f.excedente ? `${f.rotulo}: ${f.incluso}. Excedente: ${f.excedente}.` : `${f.rotulo}: ${f.incluso}.`,
          )}
        />
      )}
    </Bloco>
  );
}

function Anexo() {
  return (
    <Bloco titulo={TITULO_ANEXO}>
      <h3 style={{ ...subtitulo, marginTop: 0 }}>No ar hoje</h3>
      <Lista itens={ANEXO_NO_AR} />
      {ANEXO_PROXIMAS.map((entrega) => (
        <div key={entrega.mes} className="orc-bloco">
          <h3 style={subtitulo}>{entrega.mes}</h3>
          <Lista itens={entrega.itens} />
        </div>
      ))}
      <p style={apoio}>{CLAUSULA_MES_GRATIS.join(" ")}</p>
      <p style={{ ...apoio, color: p.g500 }}>{ANEXO_NOTAS.join(" ")}</p>
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
