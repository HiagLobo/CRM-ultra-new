"use client";
/**
 * Fluxo de acesso ao demo: cadastro (ou Entrar, para quem já tem cadastro) →
 * código → liberado. É a ponte visual para as rotas `POST /api/lead`,
 * `POST /api/lead/entrar` e `POST /api/lead/verify`.
 *
 * Os passos e o formulário vivem no redutor puro `fluxo.ts` — só em memória,
 * para o reenvio e as idas e vindas: nada de PII em storage ou console.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Aviso } from "./ui";
import { TITULOS, estadoInicial, fluxo } from "./fluxo";
import ModalAcesso from "./ModalAcesso";
import StepDados from "./StepDados";
import StepEntrar from "./StepEntrar";
import StepCodigo from "./StepCodigo";
import StepOk from "./StepOk";

export default function AccessFlow({
  aoFechar,
  avisoAcesso,
  passoInicial = "dados",
}: {
  aoFechar: () => void;
  /**
   * Chegou aqui rebatido de um painel (acesso vencido): quem volta já tem
   * cadastro, então o fluxo abre no Entrar e explica em vez de deixar a pessoa no escuro.
   */
  avisoAcesso?: boolean;
  /** Onde o fluxo começa quando não é o acesso vencido (o `/login` abre no Entrar). */
  passoInicial?: "dados" | "entrar";
}) {
  const [estado, despachar] = React.useReducer(fluxo, avisoAcesso ? "entrar" : passoInicial, estadoInicial);
  const { passo, pedido } = estado;
  const { titulo, etapa } = TITULOS[passo];

  return (
    <ModalAcesso titulo={titulo} etapa={etapa} aoFechar={aoFechar}>
      {avisoAcesso && passo === "entrar" && (
        <div style={{ marginBottom: 16 }}>
          <Aviso tipo="info">
            Seu acesso ao demo expirou ou ainda não foi liberado neste navegador. Confirme seu
            e-mail para entrar de novo — leva menos de um minuto.
          </Aviso>
        </div>
      )}

      {passo === "dados" && (
        <StepDados
          form={estado.form}
          aoMudarForm={(form) => despachar({ tipo: "form", form })}
          aoEnviado={(dados, existente, codigoDev) => despachar({ tipo: "cadastro_enviado", dados, existente, codigoDev })}
          aoGravadoSemCodigo={(email) => despachar({ tipo: "cadastro_sem_codigo", email })}
          aoIrParaEntrar={(opcoes) => despachar({ tipo: "ir_entrar", ...opcoes })}
        />
      )}

      {passo === "entrar" && (
        <StepEntrar
          emailInicial={estado.emailEntrar}
          dica={estado.dica}
          aoEnviado={(email, codigoDev) => despachar({ tipo: "entrar_enviado", email, codigoDev })}
          aoCadastrar={(email) => despachar({ tipo: "ir_cadastro", email })}
        />
      )}

      {passo === "codigo" && pedido && (
        <StepCodigo
          pedido={pedido}
          codigoDevInicial={estado.codigoDev}
          aoVerificar={(naoAtualizados) => despachar({ tipo: "verificado", naoAtualizados })}
          aoVoltar={() => despachar({ tipo: "voltar" })}
        />
      )}

      {passo === "ok" && <StepOk aoFechar={aoFechar} naoAtualizados={estado.naoAtualizados} />}

      {passo !== "ok" && (
        <p style={{ fontSize: 12, color: p.g500, margin: "16px 0 0", textAlign: "center" }}>
          Seus dados servem só para liberar o demo do {brand.nomeCurto} e falar com você.
        </p>
      )}
    </ModalAcesso>
  );
}
