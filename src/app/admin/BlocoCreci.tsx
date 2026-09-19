"use client";
/**
 * Bloco CRECI da ficha do lead (O9·S3): o número, "copiar número", o link da
 * busca oficial do conselho (nova aba) e o resultado — ✓ Confere / ✗ Não
 * confere / desfazer. A conferência é manual (F5): sem API oficial e com
 * captcha nas buscas, o fundador olha e marca em ~20 s.
 *
 * Foco (revisão da O9·S3): nenhum botão do bloco some nem fica `disabled`
 * depois do clique — o botão marcado é `aria-pressed`, e o que não se aplica
 * agora (salvando, nada a desfazer) é `aria-disabled` e ignora o clique. Assim
 * o foco do teclado nunca cai para o começo da página. O resultado é anunciado
 * (`role="status"`).
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import type { LeadAdmin } from "@/features/lead/admin";
import type { ConferenciaCreci } from "@/features/lead/creci";
import { consultaDoCreci, numeroDoCreci, ROTULO_CONFERENCIA, textoConferencia } from "./creciPainel";
import { acao, botaoContorno, caixaErro, tituloSecao } from "./estilos";
import type { ResultadoAcao } from "./useLeadsAdmin";

const nota: React.CSSProperties = { fontSize: 13, color: p.g700, margin: "8px 0 0", lineHeight: 1.5 };

const BOTOES: ReadonlyArray<{ valor: ConferenciaCreci; cor: string; icone: string }> = [
  { valor: "conferido", cor: p.success, icone: "check" },
  { valor: "nao_confere", cor: p.error, icone: "x" },
];

export default function BlocoCreci({
  lead,
  ocupado,
  aoConferir,
}: {
  lead: LeadAdmin;
  ocupado: boolean;
  aoConferir: (conferencia: ConferenciaCreci | null) => Promise<ResultadoAcao>;
}) {
  const [erro, setErro] = React.useState<string | null>(null);
  const [copia, setCopia] = React.useState<"copiado" | "falhou" | null>(null);
  const consulta = consultaDoCreci(lead);
  const resultado = textoConferencia(lead);

  // o "Copiado" some sozinho
  React.useEffect(() => {
    if (copia !== "copiado") return;
    const id = window.setTimeout(() => setCopia(null), 2500);
    return () => window.clearTimeout(id);
  }, [copia]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(numeroDoCreci(lead.creci));
      setCopia("copiado");
    } catch {
      setCopia("falhou"); // sem permissão ou sem clipboard: a tela diz o que fazer
    }
  }

  async function conferir(conferencia: ConferenciaCreci | null) {
    // já está assim, ou há uma gravação em andamento: o clique não faz nada (e o foco fica)
    if (ocupado || (lead.creciConferencia ?? null) === conferencia) return;
    setErro(null);
    const r = await aoConferir(conferencia);
    if (!r.ok) setErro(r.erro);
  }

  return (
    <section aria-labelledby="gaveta-creci">
      <h3 id="gaveta-creci" style={tituloSecao}>CRECI</h3>
      {!lead.creci ? (
        <p style={{ ...nota, marginTop: 0 }}>Sem CRECI (cadastro manual). Não há o que conferir.</p>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <strong style={{ fontSize: 16, color: p.ink, overflowWrap: "anywhere" }}>{lead.creci}</strong>
            <button type="button" onClick={() => void copiar()} style={{ ...botaoContorno(p.g700), padding: "4px 10px" }}>
              <Ic n={copia === "copiado" ? "check" : "clipboard-check"} s={14} c="currentColor" />
              {copia === "copiado" ? "Copiado" : "Copiar número"}
            </button>
            {consulta && (
              <a href={consulta.url} target="_blank" rel="noopener noreferrer" style={{ ...botaoContorno(p.primary), padding: "4px 10px" }}>
                Conferir no CRECI-{consulta.uf}
                {consulta.provavel ? " (provável)" : ""} <Ic n="arrow-up-right" s={14} c="currentColor" />
              </a>
            )}
          </div>
          {copia === "falhou" && <p role="status" style={nota}>Não deu para copiar: selecione o número acima.</p>}
          {consulta?.semBuscaDireta && (
            <p style={nota}>O CRECI-{consulta.uf} não tem página de busca direta: procure a consulta de inscritos no site do conselho.</p>
          )}
          {consulta?.provavel && (
            <p style={nota}>
              CRECI sem estado: o CRECI-{consulta.uf} é palpite pelo DDD do WhatsApp. Não achou? Confira no conselho de outro estado.
            </p>
          )}
          {!consulta && <p style={nota}>CRECI sem estado e sem DDD brasileiro: pergunte ao corretor de qual conselho ele é.</p>}

          <div role="group" aria-label="Resultado da conferência do CRECI" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {BOTOES.map(({ valor, cor, icone }) => {
              const ativo = lead.creciConferencia === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={ativo}
                  aria-disabled={ocupado || undefined}
                  onClick={() => void conferir(valor)}
                  style={ativo ? { ...acao(cor, true), padding: "7px 13px", fontSize: 13, cursor: "default" } : botaoContorno(cor, ocupado)}
                >
                  <Ic n={icone} s={14} c="currentColor" /> {ROTULO_CONFERENCIA[valor]}
                </button>
              );
            })}
            <button
              type="button"
              aria-disabled={ocupado || !lead.creciConferencia || undefined}
              onClick={() => void conferir(null)}
              style={botaoContorno(p.g700, ocupado || !lead.creciConferencia)}
            >
              Desfazer
            </button>
          </div>
          <p role="status" style={nota}>{resultado ?? "Ainda não conferido."}</p>
          {erro && <div role="alert" style={{ ...caixaErro, marginTop: 10 }}>{erro}</div>}
        </>
      )}
    </section>
  );
}
