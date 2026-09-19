"use client";
/**
 * Fluxo de acesso ao demo: dados → código → liberado.
 * É a ponte visual para a O1 (`POST /api/lead` e `POST /api/lead/verify`).
 * Guarda os dados da solicitação só em memória, para o reenvio — nada de PII
 * em storage ou console.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import type { DadosSolicitacao } from "./api";
import { Aviso } from "./ui";
import StepDados from "./StepDados";
import StepCodigo from "./StepCodigo";
import StepOk from "./StepOk";

type Passo = "dados" | "codigo" | "ok";

const TITULOS: Record<Passo, { titulo: string; etapa: string }> = {
  dados: { titulo: "Acessar a demonstração", etapa: "Passo 1 de 2" },
  codigo: { titulo: "Confirme seu e-mail", etapa: "Passo 2 de 2" },
  ok: { titulo: "Tudo certo", etapa: "" },
};

export default function AccessFlow({
  aoFechar,
  avisoAcesso,
}: {
  aoFechar: () => void;
  /** Chegou aqui rebatido de um painel: explica em vez de deixar a pessoa no escuro. */
  avisoAcesso?: boolean;
}) {
  const [passo, setPasso] = React.useState<Passo>("dados");
  const [dados, setDados] = React.useState<DadosSolicitacao | null>(null);
  const [codigoDev, setCodigoDev] = React.useState<string | undefined>();

  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  const { titulo, etapa } = TITULOS[passo];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="acesso-titulo"
      onClick={aoFechar}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(28,10,46,.55)",
        display: "grid",
        placeItems: "center",
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 30px 70px rgba(20,6,38,.4)",
          padding: 30,
          width: "min(460px, 100%)",
          boxSizing: "border-box",
          margin: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <div>
            {etapa && (
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: p.primary, marginBottom: 6 }}>
                {etapa}
              </div>
            )}
            <h2
              id="acesso-titulo"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, margin: 0, color: p.ink }}
            >
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={aoFechar}
            className="ds-iconbox"
            style={{
              width: 38,
              height: 38,
              display: "grid",
              placeItems: "center",
              border: `1.5px solid ${p.g300}`,
              background: "#fff",
              borderRadius: 11,
              cursor: "pointer",
              color: p.g700,
              flexShrink: 0,
            }}
          >
            <Ic n="x" s={18} />
          </button>
        </div>

        {avisoAcesso && passo === "dados" && (
          <div style={{ marginBottom: 16 }}>
            <Aviso tipo="info">
              Seu acesso ao demo expirou ou ainda não foi liberado neste navegador. Confirme seu
              e-mail para entrar de novo — leva menos de um minuto.
            </Aviso>
          </div>
        )}

        {passo === "dados" && (
          <StepDados
            aoEnviar={(d, dev) => {
              setDados(d);
              setCodigoDev(dev);
              setPasso("codigo");
            }}
          />
        )}

        {passo === "codigo" && dados && (
          <StepCodigo
            dados={dados}
            codigoDevInicial={codigoDev}
            aoVerificar={() => setPasso("ok")}
            aoVoltar={() => setPasso("dados")}
          />
        )}

        {passo === "ok" && <StepOk aoFechar={aoFechar} />}

        {passo !== "ok" && (
          <p style={{ fontSize: 12, color: p.g500, margin: "16px 0 0", textAlign: "center" }}>
            Seus dados servem só para liberar o demo do {brand.nomeCurto} e falar com você.
          </p>
        )}
      </div>
    </div>
  );
}
