"use client";
/**
 * Avisos do cadastro único (O9·S2). Quem cai num WhatsApp ou CRECI que já tem
 * cadastro, num e-mail sem cadastro ou num dado que não pôde ser atualizado
 * recebe o que fazer — entrar com o e-mail certo, se cadastrar ou falar com a
 * gente — em vez de um erro seco que trava o fluxo.
 */
import * as React from "react";
import { Aviso } from "./ui";
import { BotaoTexto, LinkWhatsapp } from "./pecas";
import {
  MENSAGEM_CRECI_EM_USO,
  MENSAGEM_SEM_CADASTRO,
  WHATSAPP_CRECI_EM_USO,
  WHATSAPP_NAO_ATUALIZADO,
  WHATSAPP_TELEFONE_EM_USO,
  mensagemNaoAtualizados,
  mensagemTelefoneEmUso,
  type CampoNaoAtualizado,
} from "./mensagens";

/** 409 do cadastro: de quem é o dado repetido. */
export type Repetido = { tipo: "telefone"; dica: string | null } | { tipo: "creci" };

/** Linha de saídas embaixo do texto do aviso (quebra linha no celular). */
function Saidas({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: 8 }}>{children}</span>;
}

/**
 * WhatsApp repetido: com a dica, "Entrar com esse e-mail"; sem ela, o WhatsApp
 * da marca. CRECI repetido: as duas saídas (sem dica — o CRECI é público).
 */
export function AvisoRepetido({ repetido, aoEntrar }: { repetido: Repetido; aoEntrar: (dica: string | null) => void }) {
  if (repetido.tipo === "telefone") {
    const { dica } = repetido;
    return (
      <Aviso tipo="erro">
        {mensagemTelefoneEmUso(dica)}
        <Saidas>
          {dica ? (
            <BotaoTexto onClick={() => aoEntrar(dica)}>Entrar com esse e-mail</BotaoTexto>
          ) : (
            <LinkWhatsapp texto={WHATSAPP_TELEFONE_EM_USO} />
          )}
        </Saidas>
      </Aviso>
    );
  }
  return (
    <Aviso tipo="erro">
      {MENSAGEM_CRECI_EM_USO}
      <Saidas>
        <BotaoTexto onClick={() => aoEntrar(null)}>Entrar com meu e-mail</BotaoTexto>
        <LinkWhatsapp texto={WHATSAPP_CRECI_EM_USO} />
      </Saidas>
    </Aviso>
  );
}

/** "Já tenho cadastro" com um e-mail que não existe: avisa e oferece o cadastro (F4). */
export function AvisoSemCadastro({ aoCadastrar }: { aoCadastrar: () => void }) {
  return (
    <Aviso tipo="info">
      {MENSAGEM_SEM_CADASTRO}
      <Saidas>
        <BotaoTexto onClick={aoCadastrar}>Quero me cadastrar</BotaoTexto>
      </Saidas>
    </Aviso>
  );
}

/** Passo final: dado novo que ficou como estava por já estar em outro cadastro. */
export function AvisoNaoAtualizados({ campos }: { campos: readonly CampoNaoAtualizado[] }) {
  const mensagem = mensagemNaoAtualizados(campos);
  if (!mensagem) return null;
  return (
    <Aviso tipo="info">
      {mensagem} <LinkWhatsapp texto={WHATSAPP_NAO_ATUALIZADO} />
    </Aviso>
  );
}
