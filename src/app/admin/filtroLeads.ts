/**
 * Abas do funil e busca do painel — no cliente, sobre a lista já carregada (o
 * volume desta fase cabe numa resposta). Puro, para o teste cobrir as regras.
 */
import type { LeadAdmin } from "@/features/lead/admin";
import type { StatusLead } from "@/features/lead/funil";
import { leadsDeHoje, motivoHoje } from "./hoje";

/** Uma aba por etapa, mais "Hoje" (o que fazer agora) e "Todos". */
export type Aba = "hoje" | "todos" | StatusLead;

export const ABAS: ReadonlyArray<{ valor: Aba; rotulo: string }> = [
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "novo", rotulo: "Novos" },
  { valor: "em_contato", rotulo: "Em contato" },
  { valor: "demonstracao", rotulo: "Demonstração" },
  { valor: "negociacao", rotulo: "Negociação" },
  { valor: "cliente", rotulo: "Clientes" },
  { valor: "retomar", rotulo: "Retomar depois" },
  { valor: "perdido", rotulo: "Perdidos" },
  { valor: "todos", rotulo: "Todos" },
];

const soLetrasEDigitos = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * O lead casa com a busca por nome, e-mail, telefone ou CRECI?
 * - nome: trecho, sem diferenciar maiúsculas nem acento (`joao` acha `João`);
 * - e-mail: trecho, sem diferenciar maiúsculas;
 * - CRECI: ignora espaço, ponto e hífen (`pe12345` acha `PE 12.345`);
 * - telefone: só quando o termo parece número, comparando os dígitos — assim
 *   `(81) 98888` acha `+5581988887777`, e `joao2` não acha todo telefone com 2.
 */
export function casaBusca(lead: LeadAdmin, busca: string): boolean {
  const termo = busca.trim().toLowerCase();
  if (!termo) return true;
  if (lead.nome && semAcento(lead.nome).includes(semAcento(termo))) return true;
  if (lead.email?.toLowerCase().includes(termo)) return true;

  const compacto = soLetrasEDigitos(termo);
  if (compacto && soLetrasEDigitos(lead.creci).includes(compacto)) return true;

  const digitos = termo.replace(/\D/g, "");
  const pareceTelefone = /^[\d\s()+.-]+$/.test(termo);
  return pareceTelefone && digitos.length > 0 && lead.telefone.replace(/\D/g, "").includes(digitos);
}

/** O lead aparece na aba? "Hoje" depende do relógio (dia de Recife). */
export function estaNaAba(lead: LeadAdmin, aba: Aba, agora: Date): boolean {
  if (aba === "todos") return true;
  if (aba === "hoje") return motivoHoje(lead, agora) !== null;
  return lead.status === aba;
}

/** Quantos leads de cada aba casam com a busca (o número ao lado de cada aba). */
export function contarPorAba(leads: ReadonlyArray<LeadAdmin>, busca: string, agora: Date): Record<Aba, number> {
  const contagem = Object.fromEntries(ABAS.map((a) => [a.valor, 0])) as Record<Aba, number>;
  for (const lead of leads) {
    if (!casaBusca(lead, busca)) continue;
    contagem.todos += 1;
    contagem[lead.status] += 1;
    if (motivoHoje(lead, agora)) contagem.hoje += 1;
  }
  return contagem;
}

/**
 * Os leads da aba que casam com a busca. As etapas mantêm a ordem da lista (do
 * pedido mais recente para o mais antigo); "Hoje" vem do mais urgente para o menos.
 */
export function filtrarPorAba(
  leads: ReadonlyArray<LeadAdmin>,
  filtro: { aba: Aba; busca: string },
  agora: Date,
): LeadAdmin[] {
  const buscados = leads.filter((l) => casaBusca(l, filtro.busca));
  if (filtro.aba === "hoje") return leadsDeHoje(buscados, agora);
  return buscados.filter((l) => estaNaAba(l, filtro.aba, agora));
}

/** Ao abrir o painel: "Hoje" se há o que fazer, senão "Todos" (nunca uma aba vazia de cara). */
export function abaInicial(pendentesHoje: number): Aba {
  return pendentesHoje > 0 ? "hoje" : "todos";
}

/** "12 leads" · "3 de 12 leads" · "1 lead". */
export function textoContagem(visiveis: number, total: number): string {
  const palavra = total === 1 ? "lead" : "leads";
  return visiveis === total ? `${total} ${palavra}` : `${visiveis} de ${total} ${palavra}`;
}
