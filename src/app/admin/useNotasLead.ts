"use client";
/**
 * Anotações de um lead na gaveta: carregar (da mais recente para a mais antiga)
 * e adicionar. A gaveta é montada de novo a cada lead (`key`), então este
 * estado nunca mistura as notas de dois leads. O texto só vai à tela.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import type { NotaLead } from "@/features/lead/funil";
import { comJson, pedirApi, urlNotas } from "./apiPainel";
import { mensagemDeErro, respostaOk } from "./mensagensApi";
import type { ResultadoAcao } from "./useLeadsAdmin";

export function useNotasLead(leadId: string) {
  const router = useRouter();
  const [notas, setNotas] = React.useState<NotaLead[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [salvando, setSalvando] = React.useState(false);

  const irParaLogin = React.useCallback(() => router.replace("/admin/login"), [router]);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const r = await pedirApi(urlNotas(leadId), undefined, irParaLogin);
      if (!r) return;
      const lista = (r.corpo as { notas?: unknown } | null)?.notas;
      if (!respostaOk(r) || !Array.isArray(lista)) {
        setErro(mensagemDeErro(r, "carregar as anotações"));
        return;
      }
      setNotas(lista as NotaLead[]);
    } finally {
      setCarregando(false);
    }
  }, [leadId, irParaLogin]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function adicionar(texto: string): Promise<ResultadoAcao> {
    setSalvando(true);
    try {
      const r = await pedirApi(urlNotas(leadId), comJson("POST", { texto }), irParaLogin);
      if (!r) return { ok: false, erro: "Sessão encerrada. Entre de novo." };
      const nota = (r.corpo as { nota?: NotaLead } | null)?.nota;
      if (!respostaOk(r) || !nota) return { ok: false, erro: mensagemDeErro(r, "salvar a anotação") };
      setNotas((atuais) => [nota, ...atuais]);
      return { ok: true };
    } finally {
      setSalvando(false);
    }
  }

  return { notas, carregando, erro, salvando, carregar, adicionar };
}
