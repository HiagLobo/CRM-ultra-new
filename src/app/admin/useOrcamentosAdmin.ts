"use client";
/**
 * Estado e chamadas dos orçamentos no painel: carregar, criar, marcar a
 * situação e excluir. Mesmo arranjo do `useAvaliacoesAdmin` — toda falha vira
 * mensagem visível, sessão vencida (401) volta para o login, e a ação devolve
 * o resultado para o erro aparecer onde o fundador está olhando.
 *
 * Carrega junto com os leads (e não só quando a aba abre): a ficha do lead
 * mostra os orçamentos dele, então a lista precisa estar lá antes.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import type { OrcamentoAdmin, StatusOrcamento } from "@/features/orcamento";
import { comJson, pedirApi } from "./apiPainel";
import { mensagemDeErro, respostaOk } from "./mensagensApi";
import { liberarOcupado, marcarOcupado } from "./ocupados";
import { lerRespostaOrcamento, type FormOrcamento, type ResultadoOrcamentoTela } from "./formOrcamento";
import type { ResultadoAcao } from "./useLeadsAdmin";
import { corpoDoForm } from "./formOrcamento";

const ROTA = "/api/admin/orcamentos";
const SESSAO_ENCERRADA: { ok: false; erro: string } = { ok: false, erro: "Sessão encerrada. Entre de novo." };
const SUMIU = "Esse orçamento não existe mais. Recarregue a lista.";

export function useOrcamentosAdmin() {
  const router = useRouter();
  const [orcamentos, setOrcamentos] = React.useState<OrcamentoAdmin[]>([]);
  const [carregado, setCarregado] = React.useState(false);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [ocupados, setOcupados] = React.useState<ReadonlySet<string>>(() => new Set());

  const irParaLogin = React.useCallback(() => router.replace("/admin/login"), [router]);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const r = await pedirApi(ROTA, undefined, irParaLogin);
      if (!r) return;
      const lista = (r.corpo as { orcamentos?: unknown } | null)?.orcamentos;
      if (!respostaOk(r) || !Array.isArray(lista)) {
        setErro(mensagemDeErro(r, "carregar os orçamentos"));
        return;
      }
      setOrcamentos(lista as OrcamentoAdmin[]);
      setCarregado(true);
    } finally {
      setCarregando(false);
    }
  }, [irParaLogin]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  /** Cria a proposta; a nova entra no topo da lista (é a mais recente). */
  async function criar(form: FormOrcamento, leadId: string): Promise<ResultadoOrcamentoTela> {
    const r = await pedirApi(ROTA, comJson("POST", corpoDoForm(form, leadId)), irParaLogin);
    if (!r) return { status: "erro", erro: SESSAO_ENCERRADA.erro };
    const resultado = lerRespostaOrcamento(r);
    if (resultado.status === "ok") setOrcamentos((atuais) => [resultado.orcamento, ...atuais]);
    return resultado;
  }

  /**
   * Marca enviado, aceito ou recusado. A resposta traz a linha alterada sem o
   * cliente (o caso de uso devolve só o orçamento): aqui entram a situação e as
   * datas, e o cliente que já estava continua.
   */
  async function trocarStatus(id: string, status: StatusOrcamento): Promise<ResultadoAcao> {
    setOcupados((atuais) => marcarOcupado(atuais, id));
    try {
      const r = await pedirApi(ROTA, comJson("PATCH", { id, status }), irParaLogin);
      if (!r) return SESSAO_ENCERRADA;
      if (r.status === 404) return { ok: false, erro: SUMIU };
      const alterado = (r.corpo as { orcamento?: OrcamentoAdmin } | null)?.orcamento;
      if (!respostaOk(r) || !alterado) return { ok: false, erro: mensagemDeErro(r, "mudar a situação do orçamento") };
      setOrcamentos((atuais) =>
        atuais.map((o) =>
          o.id === id ? { ...o, status: alterado.status, atualizadoEm: alterado.atualizadoEm, enviadoEm: alterado.enviadoEm } : o,
        ),
      );
      return { ok: true };
    } finally {
      setOcupados((atuais) => liberarOcupado(atuais, id));
    }
  }

  /** Apaga a proposta. 404 conta como feito: já não existia. */
  async function excluir(id: string): Promise<ResultadoAcao> {
    setOcupados((atuais) => marcarOcupado(atuais, id));
    try {
      const r = await pedirApi(ROTA, comJson("DELETE", { id }), irParaLogin);
      if (!r) return SESSAO_ENCERRADA;
      if (!respostaOk(r) && r.status !== 404) return { ok: false, erro: mensagemDeErro(r, "excluir o orçamento") };
      setOrcamentos((atuais) => atuais.filter((o) => o.id !== id));
      return { ok: true };
    } finally {
      setOcupados((atuais) => liberarOcupado(atuais, id));
    }
  }

  return { orcamentos, carregado, carregando, erro, mostrarErro: setErro, ocupados, carregar, criar, trocarStatus, excluir };
}

export type PainelOrcamentosEstado = ReturnType<typeof useOrcamentosAdmin>;
