"use client";
/**
 * Estado e chamadas das avaliações no painel: carregar, publicar e tirar do
 * site. Mesmo arranjo do `useLeadsAdmin` — toda falha vira mensagem visível,
 * sessão vencida (401) volta para o login, e a ação devolve o resultado para o
 * erro aparecer onde o fundador está olhando.
 *
 * Carrega junto com os leads (e não só quando a aba abre): a ficha do lead
 * mostra a avaliação dele, então a lista precisa estar lá antes.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import type { AvaliacaoAdmin, ResumoAvaliacoes, StatusModeravel } from "@/features/avaliacao";
import { comJson, pedirApi } from "./apiPainel";
import { mensagemDeErro, respostaOk } from "./mensagensApi";
import { liberarOcupado, marcarOcupado } from "./ocupados";
import type { ResultadoAcao } from "./useLeadsAdmin";

const ROTA = "/api/admin/avaliacoes";
const SESSAO_ENCERRADA: { ok: false; erro: string } = { ok: false, erro: "Sessão encerrada. Entre de novo." };
const SEM_AVALIACAO: ResumoAvaliacoes = { media: 0, quantas: 0 };

export function useAvaliacoesAdmin() {
  const router = useRouter();
  const [avaliacoes, setAvaliacoes] = React.useState<AvaliacaoAdmin[]>([]);
  const [resumo, setResumo] = React.useState<ResumoAvaliacoes>(SEM_AVALIACAO);
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
      const corpo = r.corpo as { avaliacoes?: unknown; resumo?: ResumoAvaliacoes } | null;
      if (!respostaOk(r) || !Array.isArray(corpo?.avaliacoes)) {
        setErro(mensagemDeErro(r, "carregar as avaliações"));
        return;
      }
      setAvaliacoes(corpo.avaliacoes as AvaliacaoAdmin[]);
      setResumo(corpo.resumo ?? SEM_AVALIACAO);
      setCarregado(true);
    } finally {
      setCarregando(false);
    }
  }, [irParaLogin]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  /**
   * Publica ou tira do site. A resposta traz a linha alterada, mas SEM o autor
   * (o caso de uso devolve só a avaliação): aqui só a situação e a data de
   * alteração entram na lista — o nome que já estava continua.
   */
  async function moderar(id: string, status: StatusModeravel): Promise<ResultadoAcao> {
    const oQue = status === "recusado" ? "tirar a avaliação do site" : "publicar a avaliação";
    setOcupados((atuais) => marcarOcupado(atuais, id));
    try {
      const r = await pedirApi(ROTA, comJson("PATCH", { id, status }), irParaLogin);
      if (!r) return SESSAO_ENCERRADA;
      // 404 aqui é a avaliação, não o lead (a mensagem comum fala de lead)
      if (r.status === 404) return { ok: false, erro: "Essa avaliação não existe mais. Recarregue a lista." };
      const alterada = (r.corpo as { avaliacao?: AvaliacaoAdmin } | null)?.avaliacao;
      if (!respostaOk(r) || !alterada) return { ok: false, erro: mensagemDeErro(r, oQue) };
      setAvaliacoes((atuais) =>
        atuais.map((a) =>
          a.id === id ? { ...a, status: alterada.status, motivo: alterada.motivo, atualizadoEm: alterada.atualizadoEm } : a,
        ),
      );
      return { ok: true };
    } finally {
      setOcupados((atuais) => liberarOcupado(atuais, id));
    }
  }

  return { avaliacoes, resumo, carregado, carregando, erro, mostrarErro: setErro, ocupados, carregar, moderar };
}

export type PainelAvaliacoesEstado = ReturnType<typeof useAvaliacoesAdmin>;
