"use client";
/**
 * Estado e chamadas do painel de leads: carregar, mudar etapa, próxima ação,
 * cadastrar, excluir, exportar e sair. Toda falha vira mensagem visível — nada
 * de erro engolido — e sessão vencida (401) volta para o login em qualquer ação.
 *
 * As ações devolvem o resultado (em vez de só acender o aviso do topo): na
 * gaveta e nos formulários o erro aparece ali mesmo, onde o fundador está olhando.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import type { LeadAdmin } from "@/features/lead/admin";
import type { MudancaEtapa, ProximaAcao } from "@/features/lead/funil";
import { comJson, pedirApi } from "./apiPainel";
import { mensagemDeErro, respostaOk, type RespostaApi } from "./mensagensApi";
import { lerRespostaCadastro, type FormNovoLead, type ResultadoCadastroTela } from "./formNovoLead";

export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

const SESSAO_ENCERRADA: { ok: false; erro: string } = { ok: false, erro: "Sessão encerrada. Entre de novo." };

export function useLeadsAdmin() {
  const router = useRouter();
  const [leads, setLeads] = React.useState<LeadAdmin[]>([]);
  const [carregado, setCarregado] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [ocupado, setOcupado] = React.useState<string | null>(null);
  const [exportando, setExportando] = React.useState(false);

  const irParaLogin = React.useCallback(() => router.replace("/admin/login"), [router]);
  const pedir = React.useCallback(
    (url: string, init?: RequestInit) => pedirApi(url, init, irParaLogin),
    [irParaLogin],
  );

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const r = await pedir("/api/admin/leads");
      if (!r) return;
      const lista = (r.corpo as { leads?: unknown } | null)?.leads;
      if (!respostaOk(r) || !Array.isArray(lista)) {
        setErro(mensagemDeErro(r, "carregar os leads"));
        return;
      }
      setLeads(lista as LeadAdmin[]);
      setCarregado(true);
    } finally {
      setCarregando(false);
    }
  }, [pedir]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  /** PATCH de um lead; a resposta traz o lead atualizado, que troca o da lista. */
  async function alterar(id: string, corpo: object, oQue: string): Promise<ResultadoAcao> {
    setOcupado(id);
    try {
      const r = await pedir("/api/admin/leads", comJson("PATCH", { id, ...corpo }));
      if (!r) return SESSAO_ENCERRADA;
      const lead = (r.corpo as { lead?: LeadAdmin } | null)?.lead;
      if (!respostaOk(r) || !lead) return { ok: false, erro: mensagemDeErro(r, oQue) };
      setLeads((atuais) => atuais.map((l) => (l.id === id ? lead : l)));
      return { ok: true };
    } finally {
      // só libera se ninguém marcou outro lead como ocupado nesse meio
      setOcupado((atual) => (atual === id ? null : atual));
    }
  }

  const mudarEtapa = (id: string, mudanca: MudancaEtapa) => alterar(id, mudanca, "mudar a etapa");

  const definirProximaAcao = (id: string, acao: ProximaAcao | null) =>
    alterar(id, { proximaAcao: acao }, acao ? "salvar a próxima ação" : "limpar a próxima ação");

  /** Cadastro manual; o lead novo entra no topo da lista (é o mais recente). */
  async function cadastrar(form: FormNovoLead): Promise<ResultadoCadastroTela> {
    const r = await pedir("/api/admin/leads", comJson("POST", form));
    if (!r) return { status: "erro", erro: SESSAO_ENCERRADA.erro };
    const resultado = lerRespostaCadastro(r);
    if (resultado.status === "ok") setLeads((atuais) => [resultado.lead, ...atuais]);
    return resultado;
  }

  /** LGPD: elimina o lead de vez (com as anotações). */
  async function excluir(id: string): Promise<ResultadoAcao> {
    setOcupado(id);
    try {
      const r: RespostaApi | null = await pedir("/api/admin/leads", comJson("DELETE", { id }));
      if (!r) return SESSAO_ENCERRADA;
      if (!respostaOk(r) && r.status !== 404) return { ok: false, erro: mensagemDeErro(r, "excluir o lead") };
      // 404: já não existia — o pedido do titular está atendido do mesmo jeito
      setLeads((atuais) => atuais.filter((l) => l.id !== id));
      return { ok: true };
    } finally {
      setOcupado((atual) => (atual === id ? null : atual));
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
      const res = await fetch("/api/admin/export", { cache: "no-store" });
      if (res.status === 401) return irParaLogin();
      if (!res.ok) throw new Error("falhou");
      baixarArquivo(await res.blob(), nomeDoArquivo(res.headers.get("Content-Disposition")));
    } catch {
      setErro("Não deu para exportar o CSV. Tente de novo.");
    } finally {
      setExportando(false);
    }
  }

  async function sair() {
    setErro(null);
    const r = await pedir("/api/admin/logout", { method: "POST" });
    if (r && r.status >= 200 && r.status < 300) irParaLogin();
    else if (r) setErro(mensagemDeErro(r, "sair"));
  }

  return {
    leads,
    carregado,
    erro,
    mostrarErro: setErro,
    carregando,
    ocupado,
    exportando,
    carregar,
    mudarEtapa,
    definirProximaAcao,
    cadastrar,
    excluir,
    exportar,
    sair,
  };
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
