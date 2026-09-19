"use client";
/**
 * Anotações na gaveta: campo para adicionar e a lista, da mais recente para a
 * mais antiga. Estados de carregando, erro (com "Tentar de novo") e vazio.
 * O texto é do fundador sobre o lead: aparece só aqui, nunca em log.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { dataHoraRecife } from "@/features/lead/admin";
import { LIMITE_NOTA } from "@/features/lead/funil";
import { NotaSchema } from "@/features/lead/schemaAdmin";
import { useNotasLead } from "./useNotasLead";
import { acao, caixaErro, campo } from "./estilos";

export default function BlocoNotas({ leadId }: { leadId: string }) {
  const notas = useNotasLead(leadId);
  const [texto, setTexto] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    const v = NotaSchema.safeParse({ texto });
    if (!v.success) return setErro(v.error.issues[0]?.message ?? "anotação inválida");
    setErro(null);
    const r = await notas.adicionar(v.data.texto);
    if (r.ok) setTexto("");
    else setErro(r.erro);
  }

  return (
    <div>
      <form onSubmit={adicionar} noValidate>
        <label htmlFor="nota-texto" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Nova anotação
        </label>
        <textarea
          id="nota-texto"
          rows={3}
          maxLength={LIMITE_NOTA}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="O que foi conversado, objeções, combinados…"
          style={{ ...campo(!!erro), resize: "vertical", minHeight: 76, lineHeight: 1.5 }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <button type="submit" disabled={notas.salvando} style={{ ...acao(p.primary, true), padding: "8px 16px", opacity: notas.salvando ? 0.6 : 1 }}>
            <Ic n="plus" s={15} c={p.white} /> {notas.salvando ? "Salvando…" : "Adicionar anotação"}
          </button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: p.g500 }}>
            {texto.length}/{LIMITE_NOTA}
          </span>
        </div>
        {erro && <div role="alert" style={{ ...caixaErro, marginTop: 10 }}>{erro}</div>}
      </form>

      <div style={{ marginTop: 16 }}>
        {notas.carregando && notas.notas.length === 0 ? (
          <p style={{ fontSize: 13.5, color: p.g500, margin: 0 }}>Carregando as anotações…</p>
        ) : notas.erro ? (
          <div role="alert" style={{ ...caixaErro, display: "flex", alignItems: "center", gap: 8 }}>
            {notas.erro}
            <button
              type="button"
              onClick={() => void notas.carregar()}
              style={{ marginLeft: "auto", background: "none", border: "none", color: p.primary, fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              Tentar de novo
            </button>
          </div>
        ) : notas.notas.length === 0 ? (
          <p style={{ fontSize: 13.5, color: p.g500, margin: 0 }}>Nenhuma anotação ainda.</p>
        ) : (
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
            {notas.notas.map((n) => (
              <li key={n.id} style={{ background: p.page, border: `1px solid ${p.g100}`, borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: p.g500, marginBottom: 4 }}>{dataHoraRecife(n.em)}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: p.ink, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{n.texto}</div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
