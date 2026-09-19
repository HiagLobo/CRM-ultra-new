/**
 * O CRECI na tela do painel (O9·S3): em que conselho conferir, o número para
 * colar na busca e o rótulo da conferência. Puro (sem React), para o teste.
 *
 * CRECI sem UF (legado de antes da O9) não diz o conselho: a UF vem do DDD do
 * WhatsApp e é marcada como "provável" — o corretor pode atuar em outro estado.
 */
import { dataHoraRecife, type LeadAdmin } from "@/features/lead/admin";
import { LISTA_UFS, normalizarCreci, ufDoCreci, type ConferenciaCreci, type Uf } from "@/features/lead/creci";
import { ufPorTelefone } from "@/features/lead/ddd";
import { CONSULTA_CRECI } from "@/config/creciConsulta";

export interface ConsultaCreci {
  uf: Uf;
  /** Página oficial de busca do conselho da UF. */
  url: string;
  /** `true` quando a UF é palpite pelo DDD (CRECI gravado sem UF). */
  provavel: boolean;
}

const eUf = (valor: string | undefined): valor is Uf => !!valor && (LISTA_UFS as readonly string[]).includes(valor);

/** CRECI gravado → forma canônica (o de antes da O7 pode ter ficado como foi digitado). */
export const creciCanonico = (creci: string): string => normalizarCreci(creci) ?? creci;

/** Onde conferir o CRECI do lead; `null` sem CRECI ou sem UF possível. */
export function consultaDoCreci(lead: Pick<LeadAdmin, "creci" | "telefone">): ConsultaCreci | null {
  if (!lead.creci) return null;
  const uf = ufDoCreci(creciCanonico(lead.creci));
  if (eUf(uf)) return { uf, url: CONSULTA_CRECI[uf], provavel: false };
  // o telefone gravado é E.164: só número brasileiro tem DDD (um +1 555… não é "DDD 15")
  const provavel = lead.telefone.startsWith("+55") ? ufPorTelefone(lead.telefone) : undefined;
  return provavel ? { uf: provavel, url: CONSULTA_CRECI[provavel], provavel: true } : null;
}

/** O número do registro, que é o que a busca do conselho pede ("PE 12.345-F" → "12345"). */
export function numeroDoCreci(creci: string): string {
  return /\d{2,7}/.exec(creciCanonico(creci))?.[0] ?? creci.replace(/\D/g, "");
}

export const ROTULO_CONFERENCIA: Readonly<Record<ConferenciaCreci, string>> = {
  conferido: "Confere",
  nao_confere: "Não confere",
};

/** "Confere · conferido em 18/06" — o resultado e o dia (Recife). */
export function textoConferencia(lead: Pick<LeadAdmin, "creciConferencia" | "creciConferidoEm">): string | null {
  if (!lead.creciConferencia) return null;
  const dia = lead.creciConferidoEm ? dataHoraRecife(lead.creciConferidoEm).slice(0, 5) : "";
  return `${ROTULO_CONFERENCIA[lead.creciConferencia]}${dia ? ` · conferido em ${dia}` : ""}`;
}
