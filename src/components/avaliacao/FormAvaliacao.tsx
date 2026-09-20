"use client";
/**
 * Formulário da avaliação: a nota, o comentário opcional e como a pessoa quer
 * aparecer. Cada opção de identificação mostra **exatamente** o texto do
 * consentimento que o servidor vai gravar (LGPD) — nada de "li e aceito" genérico.
 *
 * Só desenha e avisa: quem fala com a API é o `ModalAvaliacao`.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { PARAM_ACESSO, VALOR_ACESSO_NECESSARIO } from "@/lib/demoAccess";
import { Aviso, BotaoSubmit } from "@/components/acesso/ui";
import { SeletorEstrelas, type Nota } from "./Estrelas";
import { MAX_COMENTARIO } from "./api";
import {
  AVISO_NOTA_SEMPRE_CONTA,
  IDENTIFICACOES,
  rotuloIdentificacao,
  textoConsentimento,
  type Identificacao,
} from "./identificacao";

const ID_NOTA = "av-nota";
const ID_COMENTARIO = "av-comentario";
const ID_CONTADOR = "av-contador";
const ID_IDENT = "av-identificacao";
const ID_ERRO = "av-erro";

/** Volta para a landing já abrindo o "Entrar" com o aviso de sessão vencida (O9·S2). */
const LINK_ENTRAR = `/?${PARAM_ACESSO}=${VALOR_ACESSO_NECESSARIO}`;

const CSS_FORM = `
.av-opcao { display: flex; gap: 10px; align-items: flex-start; border: 1.5px solid ${p.g300}; border-radius: 12px; padding: 12px 14px; cursor: pointer; }
.av-opcao.av-marcada { border-color: ${p.primary}; background: ${p.lilac1}; }
.av-opcao:focus-within { outline: 3px solid ${p.primary}; outline-offset: 2px; }
.av-texto:focus-visible { outline: 2px solid ${p.primary}; outline-offset: 1px; }
`;

export interface DadosForm {
  estrelas: number;
  comentario: string;
  /**
   * `null` = ainda não escolheu. Nenhuma opção vem marcada de fábrica: consentimento
   * pré-marcado não é consentimento (mesma regra do cadastro, O1·S2).
   */
  identificacao: Identificacao | null;
}

export default function FormAvaliacao({
  dados,
  aoMudar,
  aoEnviar,
  enviando,
  erro,
  aviso,
  semAcesso,
}: {
  dados: DadosForm;
  aoMudar: (novos: Partial<DadosForm>) => void;
  aoEnviar: () => void;
  enviando: boolean;
  /** Erro da API ou da validação da tela. */
  erro?: string;
  /** Aviso sem gravidade (ex.: 409 sem_nome, que jogou a escolha para anônimo). */
  aviso?: string;
  /** 401: o erro ganha a saída de entrar de novo, em vez de virar beco sem saída. */
  semAcesso?: boolean;
}) {
  const restam = MAX_COMENTARIO - dados.comentario.length;
  const semNota = dados.estrelas === 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        aoEnviar();
      }}
      style={{ display: "grid", gap: 18 }}
    >
      <style>{CSS_FORM}</style>

      <div>
        <div id={ID_NOTA} style={{ fontSize: 13, fontWeight: 600, color: p.g700, marginBottom: 6 }}>
          Que nota você dá para a demonstração?
        </div>
        <SeletorEstrelas
          valor={dados.estrelas}
          aoEscolher={(n: Nota) => aoMudar({ estrelas: n })}
          idRotulo={ID_NOTA}
          erro={semNota && erro ? erro : undefined}
          idErro={erro ? ID_ERRO : undefined}
        />
      </div>

      <div>
        <label htmlFor={ID_COMENTARIO} style={{ display: "block", fontSize: 13, fontWeight: 600, color: p.g700, marginBottom: 6 }}>
          Quer contar o que achou? <span style={{ fontWeight: 400, color: p.g500 }}>(opcional)</span>
        </label>
        <textarea
          id={ID_COMENTARIO}
          className="av-texto"
          value={dados.comentario}
          maxLength={MAX_COMENTARIO}
          rows={4}
          aria-describedby={ID_CONTADOR}
          onChange={(e) => aoMudar({ comentario: e.target.value.slice(0, MAX_COMENTARIO) })}
          placeholder="O que ajudou, o que faltou, o que você usaria no dia a dia."
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            lineHeight: 1.5,
            padding: "12px 14px",
            border: `1.5px solid ${p.g300}`,
            borderRadius: 10,
            background: "#fff",
            color: p.ink,
            outline: "none",
            resize: "vertical",
          }}
        />
        <div id={ID_CONTADOR} style={{ fontSize: 12.5, color: restam <= 40 ? p.warning : p.g500, marginTop: 5 }}>
          {dados.comentario.length} de {MAX_COMENTARIO} caracteres
        </div>
      </div>

      <div>
        <div id={ID_IDENT} style={{ fontSize: 13, fontWeight: 600, color: p.g700, marginBottom: 6 }}>
          Como você quer aparecer no site?
        </div>
        <div role="radiogroup" aria-labelledby={ID_IDENT} aria-required="true" style={{ display: "grid", gap: 8 }}>
          {IDENTIFICACOES.map((opcao) => {
            const marcada = dados.identificacao === opcao;
            return (
              <label key={opcao} className={`av-opcao${marcada ? " av-marcada" : ""}`}>
                <input
                  type="radio"
                  name="identificacao"
                  value={opcao}
                  checked={marcada}
                  onChange={() => aoMudar({ identificacao: opcao })}
                  style={{ marginTop: 3, width: 17, height: 17, accentColor: p.primary, flexShrink: 0 }}
                />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: p.ink }}>
                    {rotuloIdentificacao(opcao)}
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, color: p.g700, lineHeight: 1.5, marginTop: 3 }}>
                    {textoConsentimento(opcao)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <div style={{ fontSize: 12.5, color: p.g500, marginTop: 8 }}>{AVISO_NOTA_SEMPRE_CONTA}</div>
      </div>

      {/* Erro e aviso ficam juntos do botão, onde a pessoa está olhando ao enviar.
          A região viva é o próprio `Aviso` (role="alert" no erro, role="status" no
          aviso) — repetir aria-live aqui faria o leitor de tela ler duas vezes. */}
      <div style={{ display: "grid", gap: 10 }}>
        {aviso && <Aviso tipo="info">{aviso}</Aviso>}
        {erro && (
          <Aviso tipo="erro" id={ID_ERRO}>
            {erro}
            {semAcesso && (
              <>
                {" "}
                <a href={LINK_ENTRAR} style={{ color: p.primary, fontWeight: 600, whiteSpace: "nowrap" }}>
                  Entrar de novo
                </a>
              </>
            )}
          </Aviso>
        )}
      </div>

      {/* o botão não fica desabilitado: sem nota, o envio explica o que falta */}
      <BotaoSubmit carregando={enviando}>Enviar avaliação</BotaoSubmit>
    </form>
  );
}
