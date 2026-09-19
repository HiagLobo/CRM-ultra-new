"use client";
/**
 * CRECI do cadastro (O9·S2): Estado (as 27 UFs) + Número, lado a lado.
 * Cada conselho regional numera à parte, então o Estado é obrigatório. Ele vem
 * pré-escolhido pelo DDD do WhatsApp até a pessoa mexer nele (`cadastro.ts`).
 * Os erros ficam embaixo dos dois, na largura toda — numa coluna estreita de
 * celular, o texto quebraria em várias linhas.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { LISTA_UFS, type Uf } from "@/features/lead/creci";
import { ID_CAMPO } from "./cadastro";
import { estiloEntrada } from "./ui";

const ID_DICA = "acesso-creci-dica";
const idErro = (id: string) => `${id}-erro`;

const estiloSubrotulo: React.CSSProperties = { display: "block", fontSize: 12, color: p.g500, marginBottom: 4 };
const estiloErro: React.CSSProperties = { fontSize: 13, color: p.error, marginTop: 6 };

export default function CampoCreci({
  uf,
  numero,
  erroUf,
  erroNumero,
  aoMudarUf,
  aoMudarNumero,
}: {
  uf: Uf | "";
  numero: string;
  erroUf?: string;
  erroNumero?: string;
  aoMudarUf: (uf: string) => void;
  aoMudarNumero: (numero: string) => void;
}) {
  const semErro = !erroUf && !erroNumero;
  return (
    <fieldset style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ fontSize: 13, fontWeight: 600, color: p.g700, marginBottom: 6, padding: 0 }}>CRECI</legend>
      <div style={{ display: "grid", gridTemplateColumns: "104px minmax(0, 1fr)", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <label htmlFor={ID_CAMPO.uf} style={estiloSubrotulo}>
            Estado
          </label>
          <div style={{ position: "relative" }}>
            <select
              id={ID_CAMPO.uf}
              value={uf}
              onChange={(e) => aoMudarUf(e.target.value)}
              aria-invalid={!!erroUf}
              aria-describedby={erroUf ? idErro(ID_CAMPO.uf) : semErro ? ID_DICA : undefined}
              style={{ ...estiloEntrada(!!erroUf), appearance: "none", WebkitAppearance: "none", paddingRight: 30, cursor: "pointer" }}
            >
              <option value="">UF</option>
              {LISTA_UFS.map((sigla) => (
                <option key={sigla} value={sigla}>
                  {sigla}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}
            >
              <Ic n="chevron-down" s={16} c={p.g500} />
            </span>
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <label htmlFor={ID_CAMPO.numero} style={estiloSubrotulo}>
            Número
          </label>
          <input
            id={ID_CAMPO.numero}
            value={numero}
            onChange={(e) => aoMudarNumero(e.target.value)}
            placeholder="12345-F"
            autoComplete="off"
            aria-invalid={!!erroNumero}
            aria-describedby={erroNumero ? idErro(ID_CAMPO.numero) : semErro ? ID_DICA : undefined}
            style={estiloEntrada(!!erroNumero)}
          />
        </div>
      </div>
      {erroUf && (
        <div id={idErro(ID_CAMPO.uf)} role="alert" style={estiloErro}>
          {erroUf}
        </div>
      )}
      {erroNumero && (
        <div id={idErro(ID_CAMPO.numero)} role="alert" style={estiloErro}>
          {erroNumero}
        </div>
      )}
      {semErro && (
        <div id={ID_DICA} style={{ fontSize: 12.5, color: p.g500, marginTop: 6 }}>
          O estado do conselho e o número do seu registro. Usamos para confirmar que você atua no mercado imobiliário.
        </div>
      )}
    </fieldset>
  );
}
