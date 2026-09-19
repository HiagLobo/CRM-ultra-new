"use client";
/**
 * Painel de leads: contagens, lista e follow-up.
 * Busca em `/api/admin/leads` (o cookie da sessão vai junto). Estados de
 * carregando, erro e lista vazia — nada de tela em branco.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import type { Lead } from "@/features/lead/lead";
import type { ResumoLeads, StatusDoAdmin } from "@/features/lead/admin";
import TabelaLeads from "./TabelaLeads";

const CARDS: { chave: keyof ResumoLeads; rotulo: string; sufixo?: string }[] = [
  { chave: "total", rotulo: "Pedidos de acesso" },
  { chave: "verificados", rotulo: "E-mail confirmado" },
  { chave: "conversaoPct", rotulo: "Conversão", sufixo: "%" },
  { chave: "contatados", rotulo: "Já contatados" },
];

export default function PainelLeads() {
  const router = useRouter();
  const [resumo, setResumo] = React.useState<ResumoLeads | null>(null);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [erro, setErro] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [ocupado, setOcupado] = React.useState<string | null>(null);
  const [confirmando, setConfirmando] = React.useState<Lead | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/admin/leads");
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const corpo = await res.json();
      if (!res.ok || !corpo?.ok) throw new Error("resposta inválida");
      setResumo(corpo.resumo);
      setLeads(corpo.leads);
    } catch {
      setErro("não foi possível carregar os leads. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function mudarStatus(id: string, status: StatusDoAdmin) {
    setOcupado(id);
    setErro(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const corpo = await res.json();
      if (!res.ok || !corpo?.ok) throw new Error("falhou");
      setLeads((atuais) => atuais.map((l) => (l.id === id ? corpo.lead : l)));
      await carregar(); // recontar sem inventar as contagens no client
    } catch {
      setErro("não deu para atualizar o status. Tente de novo.");
    } finally {
      setOcupado(null);
    }
  }

  /** LGPD: elimina o lead de vez. Só chega aqui depois da confirmação. */
  async function excluir(lead: Lead) {
    setOcupado(lead.id);
    setErro(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("falhou");
      setConfirmando(null);
      await carregar();
    } catch {
      setErro("não deu para excluir o lead. Tente de novo.");
    } finally {
      setOcupado(null);
    }
  }

  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: p.page }}>
      <header style={{ background: "#fff", borderBottom: `1px solid ${p.g300}` }}>
        <div className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", gap: 16 }}>
          <img src="/assets/logo.svg" alt={brand.nome} style={{ height: 44 }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: p.ink }}>
            Painel de leads
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <a href="/api/admin/export" className="ds-btnpop" style={acao(p.primary, true)}>
              <Ic n="download" s={16} c="#fff" /> Exportar CSV
            </a>
            <button type="button" onClick={sair} style={acao(p.g500, false)}>
              <Ic n="log-out" s={16} c={p.g700} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "32px" }}>
        {erro && (
          <div role="alert" style={{ display: "flex", alignItems: "center", gap: 9, background: `${p.error}14`, border: `1px solid ${p.error}55`, borderRadius: 12, padding: "12px 14px", fontSize: 14, marginBottom: 20 }}>
            <Ic n="alert-triangle" s={17} c={p.error} /> {erro}
            <button type="button" onClick={() => void carregar()} style={{ marginLeft: "auto", background: "none", border: "none", color: p.primary, fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}>
              Recarregar
            </button>
          </div>
        )}

        <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {CARDS.map((c) => (
            <div key={c.chave} style={{ background: "#fff", border: `1px solid ${p.g300}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: p.g500, marginBottom: 8 }}>{c.rotulo}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: p.ink }}>
                {resumo ? `${resumo[c.chave]}${c.sufixo ?? ""}` : "—"}
              </div>
            </div>
          ))}
        </div>

        {carregando ? (
          <Aviso icone="loader">Carregando os leads…</Aviso>
        ) : leads.length === 0 ? (
          <Aviso icone="inbox">
            Nenhum pedido de acesso ainda. Assim que alguém preencher o formulário da landing, ele
            aparece aqui.
          </Aviso>
        ) : (
          <TabelaLeads
            leads={leads}
            ocupado={ocupado}
            aoMudarStatus={(id, s) => void mudarStatus(id, s)}
            aoExcluir={setConfirmando}
          />
        )}
      </main>

      {confirmando && (
        <ConfirmarExclusao
          lead={confirmando}
          ocupado={ocupado === confirmando.id}
          aoCancelar={() => setConfirmando(null)}
          aoConfirmar={() => void excluir(confirmando)}
        />
      )}
    </div>
  );
}

/** Exclusão é irreversível — confirmação explícita, com o e-mail à vista. */
function ConfirmarExclusao({
  lead,
  ocupado,
  aoCancelar,
  aoConfirmar,
}: {
  lead: Lead;
  ocupado: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={aoCancelar}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(28,10,46,.55)", display: "grid", placeItems: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 18, padding: 28, width: "min(440px, 100%)", boxSizing: "border-box", boxShadow: "0 30px 70px rgba(20,6,38,.4)" }}
      >
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, margin: "0 0 10px", color: p.ink }}>
          Excluir este lead?
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: "0 0 6px" }}>
          Todos os dados de <strong style={{ color: p.ink }}>{lead.email}</strong> serão apagados —
          contato, consentimento e histórico. <strong>Não dá para desfazer.</strong>
        </p>
        <p style={{ fontSize: 13, color: p.g500, margin: "0 0 22px" }}>
          Use quando o titular pedir a eliminação dos dados (LGPD). Para só parar o follow-up,
          &ldquo;Descartar&rdquo; basta e preserva o histórico.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" onClick={aoCancelar} style={{ ...acao(p.g500, false), padding: "11px 18px" }}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            disabled={ocupado}
            style={{ ...acao(p.error, true), padding: "11px 18px", opacity: ocupado ? 0.6 : 1 }}
          >
            {ocupado ? "Excluindo…" : "Excluir definitivamente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Aviso({ icone, children }: { icone: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: `1px dashed ${p.g300}`, borderRadius: 16, padding: 48, textAlign: "center", color: p.g500 }}>
      <div style={{ width: 50, height: 50, borderRadius: "50%", background: p.lilac1, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
        <Ic n={icone} s={24} c={p.primary} />
      </div>
      <div style={{ fontSize: 14.5, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function acao(cor: string, cheio: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: cheio ? "none" : `1.5px solid ${p.g300}`,
    background: cheio ? cor : "#fff",
    color: cheio ? "#fff" : p.g700,
    borderRadius: 999,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    textDecoration: "none",
    cursor: "pointer",
  };
}
