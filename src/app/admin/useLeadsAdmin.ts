"use client";
/**
 * Estado e chamadas do painel de leads: carregar, marcar follow-up, excluir,
 * exportar e sair. Toda falha vira mensagem visível — nada de erro engolido — e
 * sessão vencida (401) volta para o login em qualquer ação.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import type { LeadAdmin, ResumoLeads } from "@/features/lead/admin";
import type { MudancaEtapa } from "@/features/lead/funil";

const CABECALHO_JSON = { "Content-Type": "application/json" };

export function useLeadsAdmin() {
  const router = useRouter();
  const [resumo, setResumo] = React.useState<ResumoLeads | null>(null);
  const [leads, setLeads] = React.useState<LeadAdmin[]>([]);
  const [erro, setErro] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [ocupado, setOcupado] = React.useState<string | null>(null);
  const [exportando, setExportando] = React.useState(false);

  /** 401 → login. `true` quando a sessão caiu (quem chamou para por ali). */
  const sessaoCaiu = React.useCallback(
    (res: Response) => {
      if (res.status !== 401) return false;
      router.replace("/admin/login");
      return true;
    },
    [router],
  );

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/admin/leads");
      if (sessaoCaiu(res)) return;
      const corpo = await res.json();
      if (!res.ok || !corpo?.ok) throw new Error("resposta inválida");
      setResumo(corpo.resumo);
      setLeads(corpo.leads);
    } catch {
      setErro("não foi possível carregar os leads. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }, [sessaoCaiu]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function mudarStatus(id: string, mudanca: MudancaEtapa) {
    setOcupado(id);
    setErro(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: CABECALHO_JSON,
        body: JSON.stringify({ id, ...mudanca }),
      });
      if (sessaoCaiu(res)) return;
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

  /** LGPD: elimina o lead de vez. `true` quando apagou (o painel fecha a confirmação). */
  async function excluir(id: string): Promise<boolean> {
    setOcupado(id);
    setErro(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: CABECALHO_JSON,
        body: JSON.stringify({ id }),
      });
      if (sessaoCaiu(res)) return false;
      if (!res.ok) throw new Error("falhou");
      await carregar();
      return true;
    } catch {
      setErro("não deu para excluir o lead. Tente de novo.");
      return false;
    } finally {
      setOcupado(null);
    }
  }

  /**
   * Baixa o CSV por `fetch` (e não por link direto): sessão vencida volta para o
   * login e falha vira aviso na tela, em vez de um JSON cru no navegador.
   */
  async function exportar() {
    setExportando(true);
    setErro(null);
    try {
      const res = await fetch("/api/admin/export");
      if (sessaoCaiu(res)) return;
      if (!res.ok) throw new Error("falhou");
      baixarArquivo(await res.blob(), nomeDoArquivo(res.headers.get("Content-Disposition")));
    } catch {
      setErro("não deu para exportar o CSV. Tente de novo.");
    } finally {
      setExportando(false);
    }
  }

  async function sair() {
    setErro(null);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error("falhou");
      router.replace("/admin/login");
    } catch {
      setErro("não deu para sair. Tente de novo.");
    }
  }

  return { resumo, leads, erro, carregando, ocupado, exportando, carregar, mudarStatus, excluir, exportar, sair };
}

/** Nome que o servidor deu ao arquivo (`leads-AAAA-MM-DD.csv`), ou um padrão. */
function nomeDoArquivo(disposicao: string | null): string {
  return /filename="([^"]+)"/.exec(disposicao ?? "")?.[1] ?? "leads.csv";
}

function baixarArquivo(conteudo: Blob, nome: string) {
  const url = URL.createObjectURL(conteudo);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // o navegador já começou o download; libera a memória logo depois
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
