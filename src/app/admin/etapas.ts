/**
 * Como cada etapa do funil aparece no painel: rótulo e cores (só da palette).
 * Sem React, para a tabela, a gaveta e o teste lerem a mesma tabela.
 */
import { palette as p } from "@/lib/palette";
import type { StatusLead } from "@/features/lead/funil";

export const ROTULO_ETAPA: Readonly<Record<StatusLead, string>> = {
  novo: "Novo",
  em_contato: "Em contato",
  demonstracao: "Demonstração",
  negociacao: "Negociação",
  cliente: "Cliente",
  retomar: "Retomar depois",
  perdido: "Perdido",
};

export const COR_ETAPA: Readonly<Record<StatusLead, { fundo: string; texto: string }>> = {
  novo: { fundo: p.g100, texto: p.g700 },
  em_contato: { fundo: p.lilac1, texto: p.dark },
  demonstracao: { fundo: p.lilac1, texto: p.dark },
  negociacao: { fundo: p.lilac2, texto: p.deep },
  cliente: { fundo: `${p.success}1A`, texto: p.success },
  retomar: { fundo: `${p.warning}26`, texto: p.ink },
  perdido: { fundo: `${p.error}14`, texto: p.error },
};

/** Etapas que pedem um mini-formulário antes de mover (data e/ou motivo). */
export type EtapaComDetalhe = "retomar" | "perdido";

export function pedeDetalhe(etapa: StatusLead): etapa is EtapaComDetalhe {
  return etapa === "retomar" || etapa === "perdido";
}
