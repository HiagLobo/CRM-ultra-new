/**
 * O CRECI na tela do painel (O9·S3): em que conselho conferir, o número para
 * colar na busca e o rótulo da conferência. Puro (sem React), para o teste.
 *
 * A UF vem do próprio CRECI — da forma canônica ou, no legado que nem normaliza
 * ("SP 123456-7", "PE12345A"), da ÚNICA sigla de UF solta no texto. Sem UF no
 * texto (legado sem UF), vem do DDD do WhatsApp e é marcada como "provável": o
 * corretor pode atuar em outro estado.
 */
import { dataHoraRecife, type LeadAdmin } from "@/features/lead/admin";
import { LISTA_UFS, normalizarCreci, ufDoCreci, type ConferenciaCreci, type Uf } from "@/features/lead/creci";
import { ufPorTelefone } from "@/features/lead/ddd";
import { CONSULTA_CRECI, UFS_SEM_BUSCA_DIRETA } from "@/config/creciConsulta";

export interface ConsultaCreci {
  uf: Uf;
  /** Página oficial de busca do conselho da UF. */
  url: string;
  /** `true` quando a UF é palpite pelo DDD (CRECI gravado sem UF). */
  provavel: boolean;
  /** O conselho não tem página de busca direta: o link abre o site dele. */
  semBuscaDireta: boolean;
}

const eUf = (valor: string | undefined): valor is Uf => !!valor && (LISTA_UFS as readonly string[]).includes(valor);

/** CRECI gravado → forma canônica (o de antes da O7 pode ter ficado como foi digitado). */
export const creciCanonico = (creci: string): string => normalizarCreci(creci) ?? creci;

/**
 * A UF que o texto do CRECI diz: a da forma canônica ou, se nem normaliza, a
 * única sigla de UF solta no texto (palavra de 2 letras, fora o rótulo "CRECI").
 * Nenhuma, ou duas diferentes → `undefined` (não dá para saber).
 */
export function ufDoTextoCreci(creci: string): Uf | undefined {
  const canonica = ufDoCreci(creciCanonico(creci));
  if (eUf(canonica)) return canonica;
  const palavras: string[] = creci.toUpperCase().replace(/CRECI/g, " ").match(/[A-Z]+/g) ?? [];
  const siglas = new Set(palavras.filter((palavra): palavra is Uf => eUf(palavra)));
  return siglas.size === 1 ? [...siglas][0] : undefined;
}

function consulta(uf: Uf, provavel: boolean): ConsultaCreci {
  return { uf, url: CONSULTA_CRECI[uf], provavel, semBuscaDireta: UFS_SEM_BUSCA_DIRETA.includes(uf) };
}

/** Onde conferir o CRECI do lead; `null` sem CRECI ou sem UF possível. */
export function consultaDoCreci(lead: Pick<LeadAdmin, "creci" | "telefone">): ConsultaCreci | null {
  if (!lead.creci) return null;
  const uf = ufDoTextoCreci(lead.creci);
  if (uf) return consulta(uf, false);
  // o telefone gravado é E.164: só número brasileiro tem DDD (um +1 555… não é "DDD 15")
  const provavel = lead.telefone.startsWith("+55") ? ufPorTelefone(lead.telefone) : undefined;
  return provavel ? consulta(provavel, true) : null;
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
