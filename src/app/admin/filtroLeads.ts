/**
 * Busca e filtro do painel — no cliente, sobre a lista já carregada (o volume
 * desta fase cabe numa resposta). Puro, para o teste cobrir as regras de busca.
 */
import type { LeadAdmin } from "@/features/lead/admin";
import type { StatusLead } from "@/features/lead/lead";

export type FiltroStatus = "todos" | StatusLead;

export const FILTROS: ReadonlyArray<{ valor: FiltroStatus; rotulo: string }> = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "novo", rotulo: "Novos" },
  { valor: "verificado", rotulo: "Verificados" },
  { valor: "contatado", rotulo: "Contatados" },
  { valor: "descartado", rotulo: "Descartados" },
];

const soLetrasEDigitos = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * O lead casa com a busca por e-mail, telefone ou CRECI?
 * - e-mail: trecho, sem diferenciar maiúsculas;
 * - CRECI: ignora espaço, ponto e hífen (`pe12345` acha `PE 12.345`);
 * - telefone: só quando o termo parece número, comparando os dígitos — assim
 *   `(81) 98888` acha `+5581988887777`, e `joao2` não acha todo telefone com 2.
 */
export function casaBusca(lead: LeadAdmin, busca: string): boolean {
  const termo = busca.trim().toLowerCase();
  if (!termo) return true;
  if (lead.email.toLowerCase().includes(termo)) return true;

  const compacto = soLetrasEDigitos(termo);
  if (compacto && soLetrasEDigitos(lead.creci).includes(compacto)) return true;

  const digitos = termo.replace(/\D/g, "");
  const pareceTelefone = /^[\d\s()+.-]+$/.test(termo);
  return pareceTelefone && digitos.length > 0 && lead.telefone.replace(/\D/g, "").includes(digitos);
}

/** Quantos leads de cada status casam com a busca (é o número ao lado de cada filtro). */
export function contarPorFiltro(leads: ReadonlyArray<LeadAdmin>, busca: string): Record<FiltroStatus, number> {
  const contagem: Record<FiltroStatus, number> = { todos: 0, novo: 0, verificado: 0, contatado: 0, descartado: 0 };
  for (const lead of leads) {
    if (!casaBusca(lead, busca)) continue;
    contagem.todos += 1;
    contagem[lead.status] += 1;
  }
  return contagem;
}

export function filtrarLeads(
  leads: ReadonlyArray<LeadAdmin>,
  filtro: { busca: string; status: FiltroStatus },
): LeadAdmin[] {
  return leads.filter(
    (l) => (filtro.status === "todos" || l.status === filtro.status) && casaBusca(l, filtro.busca),
  );
}

/** "12 leads" · "3 de 12 leads" · "1 lead". */
export function textoContagem(visiveis: number, total: number): string {
  const palavra = total === 1 ? "lead" : "leads";
  return visiveis === total ? `${total} ${palavra}` : `${visiveis} de ${total} ${palavra}`;
}
